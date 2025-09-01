import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Store, 
  User, 
  Search, 
  Edit3, 
  Trash2, 
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Building,
  AlertCircle,
  Settings,
  FileText,
  UserMinus
} from "lucide-react";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export default function AdminList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });

  // CRUD handlers
  const handleView = (type: 'user' | 'florist', record: any) => {
    const details = type === 'user' 
      ? `Name: ${record.firstName} ${record.lastName}\nEmail: ${record.email}\nRole: ${record.role}\nVerified: ${record.isVerified ? 'Yes' : 'No'}\nJoined: ${new Date(record.createdAt).toLocaleDateString()}`
      : `Business: ${record.businessName}\nEmail: ${record.email}\nLocation: ${record.city}, ${record.state}\nPhone: ${record.phone || 'N/A'}\nJoined: ${new Date(record.createdAt).toLocaleDateString()}`;
    
    alert(`${type.toUpperCase()} DETAILS:\n\n${details}`);
  };

  const handleEdit = (type: 'user' | 'florist', record: any) => {
    const name = type === 'user' ? `${record.firstName} ${record.lastName}` : record.businessName;
    const confirmed = window.confirm(`Open edit form for ${name}?\n\nThis will navigate to the edit page.`);
    if (confirmed) {
      console.log(`Edit ${type}:`, record);
      // TODO: Navigate to edit form
      alert(`Edit form for ${name} would open here`);
    }
  };

  const handleDelete = (type: 'user' | 'florist', record: any) => {
    const name = type === 'user' ? `${record.firstName} ${record.lastName}` : record.businessName;
    const confirmed = window.confirm(`⚠️ DELETE WARNING ⚠️\n\nYou are about to permanently delete:\n${name}\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`);
    
    if (confirmed) {
      const doubleConfirm = window.confirm(`FINAL CONFIRMATION\n\nType "DELETE" in the next dialog to confirm deletion of ${name}`);
      if (doubleConfirm) {
        console.log(`Delete ${type}:`, record);
        alert(`${name} has been scheduled for deletion.\n\nAPI call would be made here.`);
        // TODO: Call delete API
      }
    }
  };

  const handleCreate = (type: 'user' | 'florist') => {
    const confirmed = window.confirm(`Create a new ${type}?\n\nThis will open the creation form.`);
    if (confirmed) {
      console.log(`Create new ${type}`);
      alert(`${type === 'user' ? 'User' : 'Florist'} creation form would open here`);
      // TODO: Navigate to create form
    }
  };

  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin-clean/users'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/admin-clean/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    retry: false,
  });

  // Fetch florists data
  const { data: florists = [], isLoading: floristsLoading } = useQuery({
    queryKey: ['/api/admin-clean/florists'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      const response = await fetch('/api/admin-clean/florists', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch florists');
      return response.json();
    },
    retry: false,
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
                onClick={() => handleCreate('user')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
              <Button
                onClick={() => handleCreate('florist')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Building className="h-4 w-4 mr-2" />
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
                              <FileText className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit User Settings"
                              onClick={() => handleEdit('user', user)}
                            >
                              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Delete User"
                              onClick={() => handleDelete('user', user)}
                            >
                              <UserMinus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
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
                              <FileText className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit Customer Account"
                              onClick={() => handleEdit('user', customer)}
                            >
                              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Remove Customer"
                              onClick={() => handleDelete('user', customer)}
                            >
                              <UserMinus className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
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
                              <Building className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-700 transition-all duration-300 rounded-lg border border-transparent hover:border-emerald-300 hover:shadow-md group"
                              title="Edit Business Settings"
                              onClick={() => handleEdit('florist', florist)}
                            >
                              <Settings className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-10 w-10 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 transition-all duration-300 rounded-lg border border-transparent hover:border-red-300 hover:shadow-md group"
                              title="Remove Florist"
                              onClick={() => handleDelete('florist', florist)}
                            >
                              <Store className="h-5 w-5 group-hover:scale-110 transition-transform duration-200 line-through" />
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
      </div>
    </div>
  );
}