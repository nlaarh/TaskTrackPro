import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// Tabs component removed - using custom tab implementation
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { 
  Users, 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Shield,
  User,
  Crown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Form schemas
const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["customer", "florist", "admin"]),
});

const floristSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type UserForm = z.infer<typeof userSchema>;
type FloristForm = z.infer<typeof floristSchema>;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
  isVerified: boolean;
  createdAt: string;
}

interface Florist {
  id: number;
  businessName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle tab changes with forced state persistence
  const handleTabChange = (newTab: string) => {
    console.log(`🔄 TAB CHANGE REQUESTED: ${activeTab} -> ${newTab}`);
    console.log(`🔄 Before change - activeTab: ${activeTab}`);
    
    // Force tab change immediately
    setActiveTab(newTab);
    
    // Clear filters
    setSearchTerm(""); 
    setSortField(""); 
    setSortDirection("asc");
    
    // Log after state change
    setTimeout(() => {
      console.log(`🔄 After change - activeTab should be: ${newTab}`);
    }, 10);
  };
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFlorist, setSelectedFlorist] = useState<Florist | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isFloristDialogOpen, setIsFloristDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Authentication is now handled at the router level in App.tsx

  // Forms
  const userForm = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "customer",
    },
  });

  const floristForm = useForm<FloristForm>({
    resolver: zodResolver(floristSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // API Queries
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin-clean/users'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        console.error('No authentication token found in localStorage');
        console.log('Available localStorage keys:', Object.keys(localStorage));
        throw new Error('Please log in to access the admin dashboard');
      }
      
      console.log('Making request with token:', token.substring(0, 20) + '...');
      console.log('Full token available:', !!token);
      
      const response = await fetch('/api/admin-clean/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Error loading users: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Users data received:', data);
      return data;
    },
    retry: 1, // Allow one retry
    retryDelay: 1000, // Wait 1 second before retry
  });

  const { data: florists = [], isLoading: floristsLoading, error: floristsError } = useQuery({
    queryKey: ['/api/admin-clean/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch('/api/admin-clean/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch florists' }));
        throw new Error(error.message || 'Failed to fetch florists');
      }
      
      return response.json();
    },
    retry: false,
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (data: UserForm) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsUserDialogOpen(false);
      userForm.reset();
      toast({ title: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...data }: UserForm & { id: string }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update user');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setIsUserDialogOpen(false);
      setIsEditing(false);
      userForm.reset();
      toast({ title: "User updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete user');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "User deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Filter and sort data
  const filteredUsers = users
    .filter((user: User) => 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: User, b: User) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof User] || "";
      const bValue = b[sortField as keyof User] || "";
      return sortDirection === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const filteredCustomers = users
    .filter((user: User) => {
      // Only show users with customer role
      const isCustomer = user.role === 'customer' || (user.roles && user.roles.includes('customer'));
      console.log(`User ${user.email}: role=${user.role}, roles=${JSON.stringify(user.roles)}, isCustomer=${isCustomer}`);
      return isCustomer;
    })
    .filter((user: User) => 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: User, b: User) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof User] || "";
      const bValue = b[sortField as keyof User] || "";
      return sortDirection === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  console.log(`🎯 RENDER: Tab=${activeTab}, Users=${users.length}, Customers=${filteredCustomers.length}, Florists=${florists.length}`);
  
  // Add effect to track tab changes
  useEffect(() => {
    console.log(`🎯 EFFECT: activeTab changed to ${activeTab}`);
  }, [activeTab]);

  const filteredFlorists = florists
    .filter((florist: Florist) => 
      florist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.state?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: Florist, b: Florist) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof Florist] || "";
      const bValue = b[sortField as keyof Florist] || "";
      return sortDirection === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    userForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as "customer" | "florist" | "admin",
    });
    setIsUserDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    // Could open a view-only dialog
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  // Excel Export
  const exportToExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(dataBlob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Excel Import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, type: 'users' | 'florists') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`Imported ${type} data:`, jsonData);
        toast({ title: `Imported ${jsonData.length} ${type} records` });
        
        // TODO: Process imported data and send to API
      } catch (error) {
        toast({ title: "Import failed", description: "Invalid file format", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'florist': return <Store className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'florist': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                <Shield className="h-10 w-10 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600">Comprehensive management for users, customers, and florist businesses</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-sm text-gray-500">Total Users</span>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="text-sm text-gray-500">Total Florists</span>
                <div className="text-2xl font-bold text-gray-900">{florists.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Custom Tab Navigation */}
          <div className="grid w-full grid-cols-3 bg-white border shadow-sm rounded-lg p-1">
            <button 
              onClick={() => handleTabChange("users")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "users" 
                  ? "bg-blue-50 text-blue-700 shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users className="h-4 w-4" />
              All Users
            </button>
            <button 
              onClick={() => handleTabChange("customers")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "customers" 
                  ? "bg-green-50 text-green-700 shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <User className="h-4 w-4" />
              Customers
            </button>
            <button 
              onClick={() => handleTabChange("florists")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "florists" 
                  ? "bg-purple-50 text-purple-700 shadow-sm font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Store className="h-4 w-4" />
              Florists
            </button>
          </div>

          {/* All Users Tab */}
          {activeTab === "users" && (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">All Users Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage all user accounts across the platform</p>
                    </div>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleImport(e, 'users')}
                      className="hidden"
                      id="import-users"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('import-users')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(filteredUsers, 'users')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={() => {
                            setIsEditing(false);
                            userForm.reset();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                          <DialogDescription>
                            {isEditing ? 'Update user information' : 'Create a new user account'}
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...userForm}>
                          <form onSubmit={userForm.handleSubmit((data) => {
                            if (isEditing && selectedUser) {
                              updateUserMutation.mutate({ ...data, id: selectedUser.id });
                            } else {
                              createUserMutation.mutate(data);
                            }
                          })} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={userForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={userForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={userForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input {...field} type="email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={userForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Role</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="customer">Customer</SelectItem>
                                      <SelectItem value="florist">Florist</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                                {isEditing ? 'Update' : 'Create'} User
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {usersError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-700">
                      <span className="font-medium">Error loading users:</span>
                      <span>{usersError.message}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search users by name, email, or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 transition-colors py-4 px-6 font-semibold text-gray-700"
                          onClick={() => handleSort('firstName')}
                        >
                          <div className="flex items-center gap-2">
                            Name 
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 transition-colors py-4 px-6 font-semibold text-gray-700"
                          onClick={() => handleSort('email')}
                        >
                          <div className="flex items-center gap-2">
                            Email 
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 transition-colors py-4 px-6 font-semibold text-gray-700"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center gap-2">
                            Primary Role 
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">All Roles</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Status</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-100 transition-colors py-4 px-6 font-semibold text-gray-700"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Created 
                            <ArrowUpDown className="h-4 w-4" />
                          </div>
                        </TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex items-center justify-center gap-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="text-gray-600">Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">No users found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: User, index) => (
                          <TableRow key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell className="font-medium py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                  <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-gray-900">{user.email}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge 
                                variant={getRoleBadgeVariant(user.role)}
                                className="flex items-center gap-1 w-fit font-medium"
                              >
                                {getRoleIcon(user.role)}
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {user.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.roles.map((role, idx) => (
                                    <Badge 
                                      key={idx}
                                      variant="outline" 
                                      className="text-xs"
                                    >
                                      {role}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  {user.role}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge 
                                variant={user.isVerified ? "default" : "secondary"}
                                className={user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                              >
                                {user.isVerified ? "✓ Verified" : "⏳ Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Customer Management Tab */}
          {activeTab === "customers" && (
          <div className="space-y-6">
            {/* Debug info */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                🎯 DEBUG: Found {filteredCustomers.length} customers out of {users.length} total users. Active tab: {activeTab}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Users loading: {usersLoading ? 'YES' : 'NO'}, Search term: "{searchTerm}"
              </p>
            </div>
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Customer Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage customer accounts and profiles</p>
                    </div>
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleImport(e, 'users')}
                      className="hidden"
                      id="import-customers"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('import-customers')?.click()}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(filteredCustomers, 'customers')}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setIsEditing(false);
                            userForm.reset({ role: 'customer' });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Customer
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search customers by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-lg"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Customer</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Contact</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Member Since</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="flex items-center justify-center gap-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                              <span className="text-gray-600">Loading customers...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="text-gray-500">
                              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">No customers found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer: User, index) => (
                          <TableRow key={customer.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {customer.firstName?.[0]}{customer.lastName?.[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</div>
                                  <div className="text-sm text-gray-500">Customer ID: {customer.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-gray-900">{customer.email}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <Badge 
                                variant={customer.isVerified ? "default" : "secondary"}
                                className={customer.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                              >
                                {customer.isVerified ? "✓ Active" : "⏳ Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4 px-6 text-gray-600">
                              {new Date(customer.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleViewUser(customer)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(customer)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(customer.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Florists Tab */}
          {activeTab === "florists" && (
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Store className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Florist Business Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage florist businesses and their profiles</p>
                    </div>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => handleImport(e, 'florists')}
                      className="hidden"
                      id="import-florists"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('import-florists')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportToExcel(filteredFlorists, 'florists')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Florist
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Manage florist businesses and profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search florists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('businessName')}
                        >
                          Business Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('rating')}
                        >
                          Rating <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('createdAt')}
                        >
                          Created <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {floristsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading florists...
                          </TableCell>
                        </TableRow>
                      ) : filteredFlorists.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No florists found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFlorists.map((florist: Florist) => (
                          <TableRow key={florist.id}>
                            <TableCell className="font-medium">
                              {florist.businessName}
                            </TableCell>
                            <TableCell>{florist.email}</TableCell>
                            <TableCell>
                              {florist.city}, {florist.state}
                            </TableCell>
                            <TableCell>
                              {florist.rating ? (
                                <div className="flex items-center gap-1">
                                  ⭐ {florist.rating.toFixed(1)}
                                  <span className="text-gray-500">({florist.reviewCount})</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">No rating</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(florist.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}