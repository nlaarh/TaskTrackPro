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
  Store, 
  Plus,
  Filter,
  Download,
  Star,
  MapPin,
  Phone,
  Calendar,
  TrendingUp,
  Eye,
  Edit3,
  Settings,
  Award
} from "lucide-react";

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

export default function AdminFlorists() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: florists = [], isLoading } = useQuery({
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

  const filteredFlorists = florists.filter((florist: Florist) => 
    florist.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    florist.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading florists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-violet-50/30">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link to="/admin-dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Store className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Business Center</h1>
                  <p className="text-sm text-gray-500">Manage florist operations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Florist
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-violet-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Florists</p>
                  <p className="text-2xl font-bold text-purple-900">{florists.length}</p>
                </div>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Store className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Active Listings</p>
                  <p className="text-2xl font-bold text-emerald-900">{florists.length}</p>
                </div>
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">This Month</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {florists.filter((f: Florist) => {
                      const created = new Date(f.createdAt);
                      const now = new Date();
                      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-cyan-100/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Avg Rating</p>
                  <p className="text-2xl font-bold text-blue-900">4.8</p>
                </div>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Star className="h-5 w-5 text-white" />
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
                  Business Directory ({filteredFlorists.length})
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Manage florist businesses and partnerships</p>
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
                  placeholder="Search florists by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Modern Table or Empty State */}
            {filteredFlorists.length > 0 ? (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-900">Business</TableHead>
                      <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                      <TableHead className="font-semibold text-gray-900">Location</TableHead>
                      <TableHead className="font-semibold text-gray-900">Rating</TableHead>
                      <TableHead className="font-semibold text-gray-900">Joined</TableHead>
                      <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlorists.map((florist: Florist) => (
                      <TableRow key={florist.id} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white font-medium">
                                {florist.businessName?.[0] || 'F'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {florist.businessName || 'Unknown Business'}
                              </div>
                              <div className="text-xs text-gray-500">Business ID: {florist.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-900 font-medium">{florist.email}</div>
                          {florist.phone && (
                            <div className="text-xs text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {florist.phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-900">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            <div>
                              <div className="font-medium">{florist.city || 'Unknown'}, {florist.state || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">{florist.zipCode || 'No ZIP'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">4.8</span>
                            <span className="text-xs text-gray-500">(24 reviews)</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {florist.createdAt ? new Date(florist.createdAt).toLocaleDateString('en-US', {
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
                              <Settings className="h-4 w-4" />
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
                  <Store className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No florist businesses found</h3>
                <p className="text-gray-500 mb-6">No businesses match your search criteria. Try adjusting your filters.</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Florist
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}