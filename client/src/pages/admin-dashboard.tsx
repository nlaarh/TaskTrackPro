import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  Users, 
  Store, 
  User, 
  BarChart3, 
  Settings, 
  TrendingUp, 
  Activity, 
  Star,
  ChevronRight,
  Calendar,
  Eye,
  Globe
} from "lucide-react";

export default function AdminDashboard() {
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

  const customers = users.filter((user: any) => user.role === 'customer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16 bg-gradient-to-br from-gray-500 to-gray-600">
                  <AvatarFallback className="text-white text-xl font-bold">
                    <Shield className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-500 mt-1 font-medium">Welcome back, manage your platform with ease</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              <Activity className="h-4 w-4 mr-1" />
              All Systems Operational
            </Badge>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{usersLoading ? 'Loading...' : users.length}</p>
                  <p className="text-xs text-gray-600/70 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Florists</p>
                  <p className="text-3xl font-bold text-green-900">{floristsLoading ? 'Loading...' : florists.length}</p>
                  <p className="text-xs text-green-600/70 mt-1">
                    <Star className="h-3 w-3 inline mr-1" />
                    4.8 avg rating
                  </p>
                </div>
                <Store className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Customers</p>
                  <p className="text-3xl font-bold text-purple-900">{usersLoading ? 'Loading...' : customers.length}</p>
                  <p className="text-xs text-purple-600/70 mt-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    85% active this month
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Revenue</p>
                  <p className="text-3xl font-bold text-orange-900">$12.4k</p>
                  <p className="text-xs text-orange-600/70 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8.2% growth
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* User Management */}
          <Link to="/admin/users">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                      <Users className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">User Management</CardTitle>
                      <p className="text-sm text-gray-500">Manage all accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Comprehensive user account management including admins, customers, and florists with advanced filtering and bulk operations.
                </p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </Badge>
                  <span className="text-xs text-gray-400">5 users online</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Customer Management */}
          <Link to="/admin/customers">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Customer Hub</CardTitle>
                      <p className="text-sm text-gray-500">Customer relations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Manage customer accounts, track activity, handle support requests, and analyze customer behavior patterns.
                </p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                  <span className="text-xs text-gray-400">12 new this week</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Florist Management */}
          <Link to="/admin/florists">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Store className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Business Center</CardTitle>
                      <p className="text-sm text-gray-500">Florist operations</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Oversee florist businesses, verify listings, manage profiles, and monitor business performance across the platform.
                </p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                  <span className="text-xs text-gray-400">52 businesses</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Analytics */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">Analytics Suite</CardTitle>
                    <p className="text-sm text-gray-500">Performance metrics</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Comprehensive analytics dashboard with real-time insights, performance tracking, and detailed reporting capabilities.
              </p>
              <div className="flex items-center justify-between pt-3 border-t">
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Growing
                </Badge>
                <span className="text-xs text-gray-400">Updated 2min ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Website Information */}
          <Link to="/admin/website-info">
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                      <Globe className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">Website Info</CardTitle>
                      <p className="text-sm text-gray-500">Contact & settings</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Manage website contact information, social media links, business hours, and public contact details.
                </p>
                <div className="flex items-center justify-between pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Badge>
                  <span className="text-xs text-gray-400">Public info</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Settings */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">System Settings</CardTitle>
                    <p className="text-sm text-gray-500">Platform config</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Configure platform settings, manage system preferences, security settings, and platform-wide configurations.
              </p>
              <div className="flex items-center justify-between pt-3 border-t">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
                <span className="text-xs text-gray-400">Last updated today</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-500 text-sm mb-4">
                Coming soon - shortcuts to common admin tasks
              </p>
              <Button variant="outline" size="sm" className="text-gray-600">
                Request Feature
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}