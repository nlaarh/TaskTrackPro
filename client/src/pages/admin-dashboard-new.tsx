import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // API Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin-clean/users'],
    queryFn: async () => {
      const token = localStorage.getItem('customerToken');
      if (!token) throw new Error('No authentication token');
      
      const response = await fetch('/api/admin-clean/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error loading users: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  const { data: florists = [], isLoading: floristsLoading } = useQuery({
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
        throw new Error('Failed to fetch florists');
      }
      
      return response.json();
    },
  });

  // Filter functions
  const filteredUsers = users.filter((user: User) => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = users.filter((user: User) => 
    (user.role === 'customer' || user.roles?.includes('customer')) &&
    (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredFlorists = florists.filter((florist: Florist) => 
    florist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-3 w-3" />;
      case 'florist': return <Store className="h-3 w-3" />;
      default: return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'florist': return 'default';
      default: return 'secondary';
    }
  };

  if (usersLoading || floristsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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

        {/* Tabs Section */}
        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm rounded-lg p-1">
            <TabsTrigger 
              value="users" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Users className="h-4 w-4" />
              All Users
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <User className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger 
              value="florists" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Store className="h-4 w-4" />
              Florists
            </TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users" className="space-y-6">
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
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
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
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Name</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Email</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Primary Role</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="text-gray-500">
                              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">No users found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: User) => (
                          <TableRow key={user.id}>
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
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
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
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
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
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
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
                      {filteredCustomers.length === 0 ? (
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
                        filteredCustomers.map((customer: User) => (
                          <TableRow key={customer.id}>
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
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
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
          </TabsContent>

          {/* Florists Tab */}
          <TabsContent value="florists" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Store className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Florist Business Management</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage florist businesses and profiles</p>
                    </div>
                  </span>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Florist
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search florists by business name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-lg"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Business</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Contact</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Location</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Rating</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Created</TableHead>
                        <TableHead className="py-4 px-6 font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlorists.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="text-gray-500">
                              <Store className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-lg font-medium">No florists found</p>
                              <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFlorists.map((florist: Florist) => (
                          <TableRow key={florist.id}>
                            <TableCell className="font-medium py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {florist.businessName?.[0]}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{florist.businessName}</div>
                                  <div className="text-sm text-gray-500">ID: {florist.id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-gray-900">{florist.email}</div>
                              {florist.phone && (
                                <div className="text-sm text-gray-500">{florist.phone}</div>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              <div className="text-gray-900">{florist.city}, {florist.state}</div>
                              <div className="text-sm text-gray-500">{florist.zipCode}</div>
                            </TableCell>
                            <TableCell className="py-4 px-6">
                              {florist.rating ? (
                                <div className="flex items-center gap-1">
                                  ⭐ {florist.rating.toFixed(1)}
                                  <span className="text-gray-500">({florist.reviewCount})</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">No rating</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 px-6 text-gray-600">
                              {new Date(florist.createdAt).toLocaleDateString('en-US', {
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
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Florist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Florist
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}