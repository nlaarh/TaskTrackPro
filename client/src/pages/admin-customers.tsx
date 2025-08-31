import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Search, 
  User, 
  Plus,
  Filter,
  Download,
  Heart,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  MessageCircle
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

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery({
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

  const customers = users.filter((user: User) => user.role === 'customer');
  
  const filteredCustomers = customers.filter((customer: User) => 
    customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-green-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Customer Hub</h1>
                  <p className="text-sm text-gray-500">Manage customer relationships</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Total Customers</p>
                  <p className="text-2xl font-bold text-green-900">{customers.length}</p>
                </div>
                <div className="p-2 bg-green-500 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active Users</p>
                  <p className="text-2xl font-bold text-blue-900">{customers.filter((c: User) => c.isVerified).length}</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold text-amber-900">{customers.filter((c: User) => !c.isVerified).length}</p>
                </div>
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-rose-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-pink-600 uppercase tracking-wide">Engagement</p>
                  <p className="text-2xl font-bold text-pink-900">94%</p>
                </div>
                <div className="p-2 bg-pink-500 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Content Area */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Customer Directory ({filteredCustomers.length})
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Manage customer accounts and relationships</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Enhanced Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Modern Table or Empty State */}
            {filteredCustomers.length > 0 ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900">Customer</TableHead>
                      <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-900">Status</TableHead>
                      <TableHead className="font-semibold text-gray-900">Activity</TableHead>
                      <TableHead className="font-semibold text-gray-900">Joined</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer: User) => (
                      <TableRow key={customer.id} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-500 text-white font-medium">
                                {customer.firstName?.[0] || 'C'}{customer.lastName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {customer.firstName || 'Unknown'} {customer.lastName || 'User'}
                              </div>
                              <div className="text-xs text-gray-500">Customer ID: {customer.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900 font-medium">{customer.email}</div>
                          <div className="text-xs text-gray-500">Primary contact</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={customer.isVerified ? 'default' : 'secondary'}
                            className={`font-medium ${customer.isVerified ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
                          >
                            {customer.isVerified ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-600">Recently active</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Unknown'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500 mb-6">No customers match your search criteria. Try adjusting your filters.</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}