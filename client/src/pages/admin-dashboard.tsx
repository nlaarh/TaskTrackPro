import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Store, Search, User, Plus } from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Florist {
  id: number;
  businessName: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<"users" | "customers" | "florists">("users");
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log("🎯 Current view:", currentView);

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

  const filteredUsers = users.filter((user: User) => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = users.filter((user: User) => {
    console.log("🔍 User role:", user.role, "for email:", user.email);
    return user.role === 'customer' &&
      (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const filteredFlorists = florists.filter((florist: Florist) => 
    florist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (usersLoading || floristsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Admin Dashboard
          </h1>
          
          <div className="flex gap-4 mb-6">
            <div className="bg-white px-4 py-2 rounded-lg shadow border">
              <span className="text-sm text-gray-500">Users</span>
              <div className="text-xl font-bold">{users.length}</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow border">
              <span className="text-sm text-gray-500">Florists</span>
              <div className="text-xl font-bold">{florists.length}</div>
            </div>
          </div>
        </div>

        {/* Simple Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white p-2 rounded-lg border shadow-sm">
            <div className="flex gap-2">
              <div
                onClick={() => {
                  console.log("🔥 Users div clicked!");
                  setCurrentView("users");
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all cursor-pointer select-none ${
                  currentView === "users"
                    ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">All Users</span>
              </div>
              <div
                onClick={() => {
                  console.log("🔥 Customers div clicked!");
                  setCurrentView("customers");
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all cursor-pointer select-none ${
                  currentView === "customers"
                    ? "bg-green-100 text-green-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <User className="h-5 w-5" />
                <span className="font-medium">Customers</span>
              </div>
              <div
                onClick={() => {
                  console.log("🔥 Florists div clicked!");
                  setCurrentView("florists");
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all cursor-pointer select-none ${
                  currentView === "florists"
                    ? "bg-purple-100 text-purple-700 font-medium shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <Store className="h-5 w-5" />
                <span className="font-medium">Florists</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {currentView === "users" && "All Users Management"}
                {currentView === "customers" && "Customer Management"} 
                {currentView === "florists" && "Florist Management"}
              </span>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add {currentView === "users" ? "User" : currentView === "customers" ? "Customer" : "Florist"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={`Search ${currentView}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users Table */}
            {currentView === "users" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <div className="font-medium">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'florist' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Customers Table */}
            {currentView === "customers" && (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredCustomers.length} customers
                </div>
                {filteredCustomers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Member Since</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer: User) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                              </div>
                              <div>
                                <div className="font-medium">{customer.firstName || 'Unknown'} {customer.lastName || 'User'}</div>
                                <div className="text-sm text-gray-500">ID: {customer.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>
                            <Badge variant={customer.isVerified ? 'default' : 'secondary'}>
                              {customer.isVerified ? 'Active' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No customers found</p>
                  </div>
                )}
              </div>
            )}

            {/* Florists Table */}
            {currentView === "florists" && (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredFlorists.length} florists
                </div>
                {filteredFlorists.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFlorists.map((florist: Florist) => (
                        <TableRow key={florist.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {florist.businessName?.[0] || 'F'}
                              </div>
                              <div>
                                <div className="font-medium">{florist.businessName || 'Unknown Business'}</div>
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
                            <div>{florist.city || 'Unknown'}, {florist.state || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{florist.zipCode || 'No ZIP'}</div>
                          </TableCell>
                          <TableCell>{florist.createdAt ? new Date(florist.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No florists found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}