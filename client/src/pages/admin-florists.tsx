import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Store, Plus } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/admin-dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Store className="h-8 w-8 text-purple-600" />
            Florist Management
          </h1>
          <p className="text-gray-600">Manage florist businesses and listings</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm text-gray-500">Total Florists</span>
            <div className="text-xl font-bold">{florists.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm text-gray-500">Active</span>
            <div className="text-xl font-bold">{florists.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow border">
            <span className="text-sm text-gray-500">This Month</span>
            <div className="text-xl font-bold">
              {florists.filter((f: Florist) => {
                const created = new Date(f.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Florists ({filteredFlorists.length})</span>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Florist
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search florists by business name, email, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Florists Table */}
            {filteredFlorists.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell>{florist.email}</TableCell>
                      <TableCell>
                        <div>{florist.city || 'Unknown'}, {florist.state || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{florist.zipCode || 'No ZIP'}</div>
                      </TableCell>
                      <TableCell>
                        {florist.phone ? (
                          <div className="text-sm">{florist.phone}</div>
                        ) : (
                          <span className="text-sm text-gray-400">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>{florist.createdAt ? new Date(florist.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">View</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Store className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No florists found</h3>
                <p>No florists match your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}