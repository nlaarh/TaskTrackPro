import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Store, 
  User, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Shield,
  Crown
} from "lucide-react";

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

export default function SimpleAdmin() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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

  const customers = users.filter((user: User) => user.role === 'customer');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortData = (data: any[]) => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  };

  const filterData = (data: any[]) => {
    if (!searchTerm) return data;
    
    return data.filter((item: any) => 
      Object.values(item).some((value: any) => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none" 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  const ActionButtons = ({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) => (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={onView} className="h-8 w-8 p-0">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Management</h1>
          <p className="text-gray-600">Manage users, customers, and florists</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customers ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="florists" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Florists ({florists.length})
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="firstName">Name</SortableHeader>
                        <SortableHeader field="email">Email</SortableHeader>
                        <SortableHeader field="role">Role</SortableHeader>
                        <SortableHeader field="isVerified">Status</SortableHeader>
                        <SortableHeader field="createdAt">Created</SortableHeader>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(filterData(users)).map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
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
                              {user.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                              {user.role === 'florist' && <Shield className="h-3 w-3 mr-1" />}
                              {user.role === 'customer' && <User className="h-3 w-3 mr-1" />}
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                              {user.isVerified ? 'Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <ActionButtons
                              onView={() => console.log('View user', user.id)}
                              onEdit={() => console.log('Edit user', user.id)}
                              onDelete={() => console.log('Delete user', user.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="firstName">Name</SortableHeader>
                        <SortableHeader field="email">Email</SortableHeader>
                        <SortableHeader field="isVerified">Status</SortableHeader>
                        <SortableHeader field="createdAt">Joined</SortableHeader>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(filterData(customers)).map((customer: User) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                                {customer.firstName?.[0]}{customer.lastName?.[0]}
                              </div>
                              <div>
                                <div className="font-medium">{customer.firstName} {customer.lastName}</div>
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
                          <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <ActionButtons
                              onView={() => console.log('View customer', customer.id)}
                              onEdit={() => console.log('Edit customer', customer.id)}
                              onDelete={() => console.log('Delete customer', customer.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Florists Tab */}
          <TabsContent value="florists" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Florist Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader field="businessName">Business</SortableHeader>
                        <SortableHeader field="email">Email</SortableHeader>
                        <SortableHeader field="city">Location</SortableHeader>
                        <SortableHeader field="phone">Phone</SortableHeader>
                        <SortableHeader field="createdAt">Joined</SortableHeader>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortData(filterData(florists)).map((florist: Florist) => (
                        <TableRow key={florist.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                {florist.businessName?.[0] || 'F'}
                              </div>
                              <div>
                                <div className="font-medium">{florist.businessName}</div>
                                <div className="text-sm text-gray-500">ID: {florist.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{florist.email}</TableCell>
                          <TableCell>{florist.city}, {florist.state} {florist.zipCode}</TableCell>
                          <TableCell>{florist.phone || 'N/A'}</TableCell>
                          <TableCell>{new Date(florist.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <ActionButtons
                              onView={() => console.log('View florist', florist.id)}
                              onEdit={() => console.log('Edit florist', florist.id)}
                              onDelete={() => console.log('Delete florist', florist.id)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
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