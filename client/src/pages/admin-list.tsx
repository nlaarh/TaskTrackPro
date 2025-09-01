import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Store, 
  User, 
  Search, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Building,
  Settings,
  UserMinus
  // Import check: Settings icon properly imported from lucide-react
} from "lucide-react";
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaStore,
  FaSave,
  FaTimes,
  FaFile,
  FaKey,
  FaEyeSlash,
  FaCopy
} from "react-icons/fa";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [viewUser, setViewUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [changePasswordUser, setChangePasswordUser] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'customer' as 'customer' | 'florist' | 'admin'
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-clean/users'] });
      toast({ title: "Success", description: "User created successfully" });
      setShowCreateUser(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'customer' });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const token = localStorage.getItem('customerToken');
      
      // Create payload, only include password if provided
      const payload: any = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role
      };
      
      // Only add password if it's provided and not empty
      if (userData.newPassword && userData.newPassword.trim() !== '') {
        payload.password = userData.newPassword;
      }
      
      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-clean/users'] });
      toast({ title: "Success", description: "User updated successfully" });
      setEditUser(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string, password: string }) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to change password: ${errorText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-clean/users'] });
      toast({ title: "Success", description: "Password changed successfully" });
      setChangePasswordUser(null);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      console.error('Change password error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${errorText}`);
      }
      // Handle 204 No Content response (successful deletion)
      if (response.status === 204) {
        return { success: true };
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin-clean/users'] });
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteUser(null);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Handle create user
  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  // Handle update user
  const handleUpdateUser = () => {
    if (!editUser.firstName || !editUser.lastName || !editUser.email) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate(editUser);
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (deleteUser) {
      deleteUserMutation.mutate(deleteUser.id);
    }
  };

  // Handle change password
  const handleChangePasswordSubmit = () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Please fill in both password fields", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ 
      userId: changePasswordUser.id, 
      password: passwordForm.newPassword 
    });
  };

  // Handler functions for view, edit, delete actions
  const handleView = (type: string, item: any) => {
    console.log(`View ${type}:`, item);
    console.log('Setting viewUser state to:', item);
    if (type === 'florist') {
      // For now, just show an alert - can be enhanced later
      alert(`Viewing florist: ${item.businessName}\nEmail: ${item.email}\nLocation: ${item.city}, ${item.state}`);
    } else if (type === 'user') {
      setViewUser(item);
    }
  };

  const handleEdit = (type: string, item: any) => {
    console.log(`Edit ${type}:`, item);
    console.log('Setting editUser state to:', item);
    if (type === 'florist') {
      // For now, just show an alert - can be enhanced later  
      alert(`Edit functionality for florist "${item.businessName}" will be implemented in future update.`);
    } else if (type === 'user') {
      // Create a proper copy with empty password field
      setEditUser({
        ...item, 
        newPassword: '' // Initialize password field as empty
      });
    }
  };

  const handleDelete = (type: string, item: any) => {
    console.log(`Delete ${type}:`, item);
    console.log('Setting deleteUser state to:', item);
    if (type === 'florist') {
      // For now, just show an alert - can be enhanced later
      const confirmed = confirm(`Are you sure you want to remove florist "${item.businessName}"? This action cannot be undone.`);
      if (confirmed) {
        alert('Delete functionality for florists will be implemented in future update.');
      }
    } else if (type === 'user') {
      setDeleteUser(item);
    }
  };

  const handleChangePassword = (user: any) => {
    setChangePasswordUser(user);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Success", description: "Password copied to clipboard" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy password", variant: "destructive" });
    }
  };

  // Fetch users data
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin-clean/users'],
    queryFn: async () => {
      console.log('Fetching users...');
      const token = localStorage.getItem('customerToken');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch('/api/admin-clean/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Fetch florists data
  const { data: florists = [], isLoading: floristsLoading, error: floristsError } = useQuery({
    queryKey: ['/api/admin-clean/florists'],
    queryFn: async () => {
      console.log('Fetching florists...');
      const token = localStorage.getItem('customerToken');
      
      const response = await fetch('/api/admin-clean/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Florists response status:', response.status);
      const data = await response.json();
      console.log('Florists data:', data);
      
      if (!response.ok) throw new Error(`Failed to fetch florists: ${response.status}`);
      return data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortData = (data: any[], key: string) => {
    if (!key) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];
      
      // Handle nested properties
      if (key.includes('.')) {
        const keys = key.split('.');
        aValue = keys.reduce((obj, k) => obj?.[k], a);
        bValue = keys.reduce((obj, k) => obj?.[k], b);
      }
      
      // Convert to strings for comparison
      aValue = String(aValue || '').toLowerCase();
      bValue = String(bValue || '').toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  // Debug logging after queries are defined
  console.log('Admin List - Users:', users);
  console.log('Admin List - Florists:', florists);
  console.log('Admin List - Users Loading:', usersLoading);
  console.log('Admin List - Florists Loading:', floristsLoading);

  // Display debugging info in UI temporarily
  React.useEffect(() => {
    if (users && users.length > 0) {
      console.log('✓ Found users:', users.length);
      toast({ title: "Debug", description: `Found ${users.length} users in database`, variant: "default" });
    }
    if (florists && florists.length > 0) {
      console.log('✓ Found florists:', florists.length);
      toast({ title: "Debug", description: `Found ${florists.length} florists in database`, variant: "default" });
    }
  }, [users, florists, toast]);

  // Filter and sort data
  const customers = users.filter((user: any) => user.role === 'customer');

  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter((user: any) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered, sortConfig.key);
  }, [users, searchTerm, sortConfig]);

  const filteredAndSortedCustomers = useMemo(() => {
    const filtered = customers.filter((user: any) =>
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered, sortConfig.key);
  }, [customers, searchTerm, sortConfig]);

  const filteredAndSortedFlorists = useMemo(() => {
    const filtered = florists.filter((florist: any) =>
      florist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortData(filtered, sortConfig.key);
  }, [florists, searchTerm, sortConfig]);

  // Sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Management</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users, florists, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              {searchTerm && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
              <Button
                onClick={() => setShowCreateUser(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FaUserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FaStore className="h-4 w-4 mr-2" />
                Add Florist
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({filteredAndSortedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="customers">
              <User className="h-4 w-4 mr-2" />
              Customers ({filteredAndSortedCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="florists">
              <Store className="h-4 w-4 mr-2" />
              Florists ({filteredAndSortedFlorists.length})
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('firstName')}
                      >
                        Name
                        <SortIcon column="firstName" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('email')}
                      >
                        Email
                        <SortIcon column="email" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('role')}
                      >
                        Role
                        <SortIcon column="role" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('isVerified')}
                      >
                        Status
                        <SortIcon column="isVerified" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        <SortIcon column="createdAt" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedUsers.map((user: any, index: number) => (
                      <TableRow key={user.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <TableCell className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className="text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : user.role === 'florist' ? 'default' : 'secondary'}
                            className="font-medium"
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isVerified ? 'default' : 'secondary'}
                            className="font-medium"
                          >
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300 rounded-lg border border-transparent hover:border-blue-300 hover:shadow-md group"
                              title="View User Details"
                              onClick={() => handleView('user', user)}
                            >
                              <FaEye className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit User"
                              onClick={() => handleEdit('user', user)}
                            >
                              <FaEdit className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300 rounded-lg border border-transparent hover:border-orange-300 hover:shadow-md group"
                              title="Change Password"
                              onClick={() => handleChangePassword(user)}
                            >
                              <FaKey className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Delete User"
                              onClick={() => handleDelete('user', user)}
                            >
                              <FaTrash className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('firstName')}
                      >
                        Name
                        <SortIcon column="firstName" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('email')}
                      >
                        Email
                        <SortIcon column="email" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('isVerified')}
                      >
                        Status
                        <SortIcon column="isVerified" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('createdAt')}
                      >
                        Joined
                        <SortIcon column="createdAt" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                        {searchTerm ? `No customers found matching "${searchTerm}"` : 'No customers found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedCustomers.map((customer: any, index: number) => (
                      <TableRow key={customer.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <TableCell className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell className="text-gray-600">{customer.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={customer.isVerified ? 'default' : 'secondary'}
                            className="font-medium"
                          >
                            {customer.isVerified ? 'Active' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(customer.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300 rounded-lg border border-transparent hover:border-blue-300 hover:shadow-md group"
                              title="View Customer Profile"
                              onClick={() => handleView('user', customer)}
                            >
                              <FaEye className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit Customer Account"
                              onClick={() => handleEdit('user', customer)}
                            >
                              <FaEdit className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 hover:text-orange-700 transition-all duration-300 rounded-lg border border-transparent hover:border-orange-300 hover:shadow-md group"
                              title="Change Password"
                              onClick={() => handleChangePassword(customer)}
                            >
                              <FaKey className="h-4 w-4 text-orange-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Remove Customer"
                              onClick={() => handleDelete('user', customer)}
                            >
                              <FaTrash className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Florists Tab */}
          <TabsContent value="florists" className="space-y-4">
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('businessName')}
                      >
                        Business Name
                        <SortIcon column="businessName" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('email')}
                      >
                        Email
                        <SortIcon column="email" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('city')}
                      >
                        Location
                        <SortIcon column="city" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('phone')}
                      >
                        Phone
                        <SortIcon column="phone" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-semibold text-gray-900 hover:bg-transparent"
                        onClick={() => handleSort('createdAt')}
                      >
                        Joined
                        <SortIcon column="createdAt" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {floristsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                          <span className="ml-2">Loading florists...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredAndSortedFlorists.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        {searchTerm ? `No florists found matching "${searchTerm}"` : 'No florists found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedFlorists.map((florist: any, index: number) => (
                      <TableRow key={florist.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <TableCell className="font-medium text-gray-900">
                          {florist.businessName}
                        </TableCell>
                        <TableCell className="text-gray-600">{florist.email}</TableCell>
                        <TableCell className="text-gray-600">
                          {florist.city}{florist.state ? `, ${florist.state}` : ''}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {florist.phone || <span className="text-gray-400 italic">N/A</span>}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(florist.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-700 transition-all duration-300 rounded-lg border border-transparent hover:border-blue-300 hover:shadow-md group"
                              title="View Business Profile"
                              onClick={() => handleView('florist', florist)}
                            >
                              <FaEye className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit Business Settings"
                              onClick={() => handleEdit('florist', florist)}
                            >
                              <FaEdit className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Remove Florist"
                              onClick={() => handleDelete('florist', florist)}
                            >
                              <FaTrash className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* View User Dialog */}
        <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaEye className="h-5 w-5 text-blue-600" />
                User Details
              </DialogTitle>
            </DialogHeader>
            {viewUser && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Name</Label>
                  <p className="text-lg">{viewUser.firstName} {viewUser.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Email</Label>
                  <p>{viewUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Role</Label>
                  <Badge variant={viewUser.role === 'admin' ? 'destructive' : viewUser.role === 'florist' ? 'default' : 'secondary'}>
                    {viewUser.role}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Status</Label>
                  <Badge variant={viewUser.isVerified ? 'default' : 'secondary'}>
                    {viewUser.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Joined</Label>
                  <p>{new Date(viewUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaEdit className="h-5 w-5 text-green-600" />
                Edit User
              </DialogTitle>
            </DialogHeader>
            {editUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editUser.firstName || ''}
                    onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
                    placeholder="Enter first name"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editUser.lastName || ''}
                    onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
                    placeholder="Enter last name"
                    autoComplete="family-name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editUser.email || ''}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    placeholder="Enter email address"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={editUser.role} onValueChange={(value) => setEditUser({...editUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="florist">Florist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleUpdateUser}
                    disabled={updateUserMutation.isPending}
                    className="flex-1"
                  >
                    <FaSave className="h-4 w-4 mr-2" />
                    {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditUser(null)}>
                    <FaTimes className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaTrash className="h-5 w-5 text-red-600" />
                Delete User
              </DialogTitle>
            </DialogHeader>
            {deleteUser && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete <strong>{deleteUser.firstName} {deleteUser.lastName}</strong>?
                </p>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  This action cannot be undone. The user will be permanently removed from the system.
                </p>
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteUser}
                    disabled={deleteUserMutation.isPending}
                    className="flex-1"
                  >
                    <FaTrash className="h-4 w-4 mr-2" />
                    {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteUser(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Change Password Dialog */}
        <Dialog open={!!changePasswordUser} onOpenChange={() => setChangePasswordUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaKey className="h-5 w-5 text-orange-600" />
                Change Password for {changePasswordUser?.firstName} {changePasswordUser?.lastName}
              </DialogTitle>
            </DialogHeader>
            {changePasswordUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      autoComplete="new-password"
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </Button>
                      {passwordForm.newPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => copyToClipboard(passwordForm.newPassword)}
                          title="Copy password"
                        >
                          <FaCopy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      autoComplete="new-password"
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                      </Button>
                      {passwordForm.confirmPassword && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => copyToClipboard(passwordForm.confirmPassword)}
                          title="Copy password"
                        >
                          <FaCopy className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                  {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                    <p className="text-sm text-green-600 mt-1">Passwords match ✓</p>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleChangePasswordSubmit}
                    disabled={changePasswordMutation.isPending || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.newPassword}
                    className="flex-1"
                  >
                    <FaKey className="h-4 w-4 mr-2" />
                    {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setChangePasswordUser(null)}>
                    <FaTimes className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FaUserPlus className="h-5 w-5 text-blue-600" />
                Create New User
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFirstName">First Name</Label>
                <Input
                  id="newFirstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="newLastName">Last Name</Label>
                <Input
                  id="newLastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="newEmail">Email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="newRole">Role</Label>
                <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="florist">Florist</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className="flex-1"
                >
                  <FaUserPlus className="h-4 w-4 mr-2" />
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                  <FaTimes className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}