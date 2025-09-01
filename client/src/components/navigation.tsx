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
import { Heart, Menu, Phone, User, LogOut, Store, Search, Shield, Users, ChevronDown, MessageSquare, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import logoImage from "@assets/image_1756685957746.png";

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

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/search", label: "Search Members" },
    { href: "#", label: "Local Events" },
    { href: "#", label: "Local Deals" },
    { href: "#", label: "Blog" },
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
            <img 
              src={logoImage} 
              alt="FloriHub Logo" 
              className="h-10 w-auto object-contain"
            />
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
            
            <Button 
              asChild
              variant="ghost" 
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2"
            >
              <Link href="#community">Community</Link>
            </Button>
            
            <Button 
              asChild
              variant="ghost" 
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2"
            >
              <Link href="#">Blog</Link>
            </Button>
            
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

            <Button 
              asChild
              variant="ghost" 
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium px-4 py-2"
            >
              <Link href="#contact">
                <Phone className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </Button>
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

                <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Account
                  </span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
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
            
            <Button 
              asChild
              variant="ghost" 
              size="sm" 
              className="text-gray-700 hover:text-gray-900 hidden md:flex"
            >
              <Link href="/admin-list">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
            
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
                    <img 
                      src={logoImage} 
                      alt="FloriHub" 
                      className="h-8 w-auto object-contain"
                    />
                    FloriHub
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {navItems.map((item) => (
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
                      <Button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          window.location.href = "/api/logout";
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
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
