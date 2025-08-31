import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFlorist, setSelectedFlorist] = useState<Florist | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isFloristDialogOpen, setIsFloristDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const { data: florists = [], isLoading: floristsLoading } = useQuery({
    queryKey: ['/api/admin/florists'],
    queryFn: async () => {
      const response = await fetch('/api/admin/florists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('customerToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch florists');
      return response.json();
    },
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
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: User, b: User) => {
      if (!sortField) return 0;
      const aValue = a[sortField as keyof User] || "";
      const bValue = b[sortField as keyof User] || "";
      return sortDirection === "asc" 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const filteredFlorists = florists
    .filter((florist: Florist) => 
      florist.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      florist.state.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, florists, and system settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="florists" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Florists
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
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
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
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

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('firstName')}
                        >
                          Name <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('email')}
                        >
                          Email <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer"
                          onClick={() => handleSort('role')}
                        >
                          Role <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Status</TableHead>
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
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user: User) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.firstName} {user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={getRoleBadgeVariant(user.role)}
                                className="flex items-center gap-1 w-fit"
                              >
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
                                  <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600"
                                  >
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
          </TabsContent>

          {/* Florists Tab */}
          <TabsContent value="florists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Florist Management
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}