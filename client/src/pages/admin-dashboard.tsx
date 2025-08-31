import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Store, User, BarChart3, Settings } from "lucide-react";

export default function AdminDashboard() {

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
          <p className="text-gray-600">Manage your florist directory platform</p>
        </div>

        {/* Management Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  User Management
                </CardTitle>
                <Users className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">All Users</div>
                <p className="text-sm text-gray-600">
                  View, edit, and manage all user accounts including admins, customers, and florists.
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Manage Users
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Customers Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/customers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Customer Management  
                </CardTitle>
                <User className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">Customers</div>
                <p className="text-sm text-gray-600">
                  Manage customer accounts, view activity, and handle customer support requests.
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Manage Customers
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Florists Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/admin/florists">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  Florist Management
                </CardTitle>
                <Store className="h-6 w-6 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">Florists</div>
                <p className="text-sm text-gray-600">
                  Manage florist businesses, verify listings, and oversee business profiles.
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Manage Florists
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Analytics
              </CardTitle>
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">Reports</div>
              <p className="text-sm text-gray-600">
                View platform statistics, user activity, and business performance metrics.
              </p>
              <Button className="w-full mt-4" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">
                Platform Settings
              </CardTitle>
              <Settings className="h-6 w-6 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">Settings</div>
              <p className="text-sm text-gray-600">
                Configure platform settings, manage system preferences, and update configurations.
              </p>
              <Button className="w-full mt-4" variant="outline">
                Manage Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-bold text-lg">Loading...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Florists</span>
                  <span className="font-bold text-lg">Loading...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Customers</span>
                  <span className="font-bold text-lg">Loading...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}