import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { 
  Users, 
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
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

  // Fetch users data
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
      if (!token) throw new Error('No authentication token');
      
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">All Users</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="florists">Florists</TabsTrigger>
          </TabsList>

          {/* All Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Users Management</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                              <div>{user.firstName} {user.lastName}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isVerified ? "default" : "secondary"}>
                            {user.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Management</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Member Since</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer: User) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                              {customer.firstName?.[0]}{customer.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-semibold">{customer.firstName} {customer.lastName}</div>
                              <div className="text-sm text-gray-500">ID: {customer.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <Badge variant={customer.isVerified ? "default" : "secondary"}>
                            {customer.isVerified ? "Active" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(customer.createdAt).toLocaleDateString()}
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Florists Tab */}
          <TabsContent value="florists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Florist Business Management</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Florist
                  </Button>
                </CardTitle>
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

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlorists.map((florist: Florist) => (
                      <TableRow key={florist.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                              {florist.businessName?.[0]}
                            </div>
                            <div>
                              <div>{florist.businessName}</div>
                              <div className="text-sm text-gray-500">ID: {florist.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{florist.email}</div>
                          {florist.phone && (
                            <div className="text-sm text-gray-500">{florist.phone}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>{florist.city}, {florist.state}</div>
                          <div className="text-sm text-gray-500">{florist.zipCode}</div>
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}