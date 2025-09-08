import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Menu, Phone, User, LogOut, Store, Search, Shield, Users, ChevronDown, MessageSquare, Bell, Globe, BarChart3, FileText, CheckSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
// Logo removed - using text logo instead

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin or florist to show messages
  const isAdminOrFlorist = () => {
    const token = localStorage.getItem('customerToken');
    const userData = localStorage.getItem('customerUser');
    
    if (!token || !userData) return false;
    
    try {
      const user = JSON.parse(userData);
      return user.role === 'admin';
    } catch {
      // Check if it's a florist token
      const floristToken = localStorage.getItem('floristToken');
      return !!floristToken;
    }
  };

  // Check if user is admin specifically
  const isAdmin = () => {
    const token = localStorage.getItem('customerToken');
    const userData = localStorage.getItem('customerUser');
    
    if (!token || !userData) return false;
    
    try {
      const user = JSON.parse(userData);
      return user.role === 'admin';
    } catch {
      return false;
    }
  };

  // Get unread message count
  const { data: unreadCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    queryFn: async () => {
      if (!isAdminOrFlorist()) return { unreadCount: 0 };
      
      const token = localStorage.getItem('customerToken') || localStorage.getItem('floristToken');
      const response = await fetch('/api/messages/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return { unreadCount: 0 };
      return response.json();
    },
    enabled: isAdminOrFlorist(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Always visible navigation items
  const publicNavItems = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search Members" },
    { href: "/get-quote", label: "Get Event Quote" },
    { href: "/contact", label: "Contact" },
  ];

  // Protected navigation items (only visible when authenticated)
  const protectedNavItems = [
    { href: "#", label: "Local Events" },
    { href: "#", label: "Local Deals" },
  ];

  const categories = [
    { href: "/search?services=Wedding%20Flowers", label: "Wedding Flowers" },
    { href: "/search?services=Funeral%20Arrangements", label: "Funeral Arrangements" },
    { href: "/search?services=Birthday%20Bouquets", label: "Birthday Bouquets" },
    { href: "/search?services=Anniversary%20Flowers", label: "Anniversary Flowers" },
    { href: "/search?services=Corporate%20Events", label: "Corporate Events" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">FloriHub</span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Professional Florist Directory
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2",
                location === "/" && "text-gray-900 bg-gray-50"
              )}
            >
              <Link href="/">Home</Link>
            </Button>
            
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2",
                location.startsWith("/search") && "text-gray-900 bg-gray-50"
              )}
            >
              <Link href="/search">Search Members</Link>
            </Button>
            
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2",
                location.startsWith("/get-quote") && "text-gray-900 bg-gray-50"
              )}
            >
              <Link href="/get-quote">
                <FileText className="h-4 w-4 mr-2" />
                Get Event Quote
              </Link>
            </Button>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2 h-auto">
                    Categories
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-56 p-2">
                      {categories.map((category) => (
                        <NavigationMenuLink key={category.href} asChild>
                          <Link
                            href={category.href}
                            className="block px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
                          >
                            {category.label}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            
            {/* Messages Link - Only for Admin/Florist */}
            {isAdminOrFlorist() && (
              <Button 
                asChild
                variant="ghost" 
                className={cn(
                  "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2 relative",
                  location.startsWith("/messages") && "text-gray-900 bg-gray-50"
                )}
              >
                <Link href="/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                  {unreadCount?.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadCount.unreadCount > 9 ? '9+' : unreadCount.unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Messages Button - Only for Admin/Florist */}
                {isAdminOrFlorist() && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="relative flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Messages</span>
                        {unreadCount?.unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {unreadCount.unreadCount > 9 ? '9+' : unreadCount.unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="end">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-2 py-1">
                          <h3 className="font-semibold text-sm">Messages</h3>
                          {unreadCount?.unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {unreadCount.unreadCount} unread
                            </Badge>
                          )}
                        </div>
                        <Button 
                          asChild
                          variant="ghost" 
                          className="w-full justify-start text-left h-auto p-2"
                        >
                          <Link href="/admin-messages">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium text-sm">View All Messages</div>
                              <div className="text-xs text-gray-500">
                                Send and receive messages
                              </div>
                            </div>
                          </Link>
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

              </div>
            ) : (
              <Button 
                asChild
                variant="ghost" 
                size="sm"
                className="text-gray-700 hover:text-gray-900 hidden sm:flex"
              >
                <Link href="/auth">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
            
            {/* Admin Dropdown - Only for admins */}
            {isAdmin() && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 hover:text-gray-900 hidden md:flex"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Panel</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin-list" className="cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/florists" className="cursor-pointer">
                      <Store className="h-4 w-4 mr-2" />
                      Manage Florists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/website-info" className="cursor-pointer">
                      <Globe className="h-4 w-4 mr-2" />
                      Website Info
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/quote-requests" className="cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Quote Requests
                    </Link>
                  </DropdownMenuItem>
                  {/* Task Management removed */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin-dashboard" className="cursor-pointer">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Account Dropdown - For authenticated users */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={user?.role === 'florist' ? '/florist-profile-setup' : '/customer-profile'} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => {
                      // Clear all authentication tokens
                      localStorage.removeItem('customerToken');
                      localStorage.removeItem('customerUser');
                      localStorage.removeItem('floristToken');
                      localStorage.removeItem('florist_token');
                      localStorage.removeItem('florist_data');
                      
                      // Redirect to login page
                      window.location.href = '/auth';
                    }}
                    className="cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isAuthenticated && (
              <Button 
                asChild 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 ml-2"
                size="sm"
              >
                <Link href="/auth?mode=register">
                  <Users className="h-4 w-4 mr-2" />
                  Join
                </Link>
              </Button>
            )}
            
            {/* Contact Button - Always visible */}
            <Button 
              asChild
              variant="ghost" 
              className={cn(
                "text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2",
                location === "/contact" && "text-gray-900 bg-gray-50"
              )}
            >
              <Link href="/contact">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </Button>
            
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">F</span>
                    </div>
                    FloriHub
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* Always visible public navigation */}
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-gray-700 hover:text-gray-900 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Protected navigation items - only visible when authenticated */}
                  {isAdminOrFlorist() && protectedNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-gray-700 hover:text-gray-900 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-foreground mb-3">Categories</p>
                    {categories.map((category) => (
                      <Link
                        key={category.href}
                        href={category.href}
                        className="block py-2 text-sm text-gray-700 hover:text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    {!isAuthenticated ? (
                      <>
                        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                            <Users className="h-4 w-4 mr-2" />
                            Join
                          </Link>
                        </Button>
                        
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full"
                        >
                          <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            Login
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full"
                        >
                          <Link href={user?.role === 'florist' ? '/florist-profile-setup' : '/customer-profile'} onClick={() => setMobileMenuOpen(false)}>
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Link>
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            // Clear all authentication tokens
                            localStorage.removeItem('customerToken');
                            localStorage.removeItem('customerUser');
                            localStorage.removeItem('floristToken');
                            localStorage.removeItem('florist_token');
                            localStorage.removeItem('florist_data');
                            
                            setMobileMenuOpen(false);
                            
                            // Redirect to login page
                            window.location.href = '/auth';
                          }}
                          variant="outline" 
                          className="w-full"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
