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
import { Heart, Menu, Phone, User, LogOut, Store, Search, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="bg-white/95 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="/attached_assets/image_1756685957746.png" 
              alt="FloriHub Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">FloriHub</span>
              <span className="text-xs text-gray-600 hidden sm:block font-medium">
                Connecting Your Special Moments
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/" 
              className={cn(
                "text-muted-foreground hover:text-primary transition-colors duration-200 font-medium",
                location === "/" && "text-primary"
              )}
            >
              Home
            </Link>
            
            <Link 
              href="/search" 
              className={cn(
                "text-muted-foreground hover:text-primary transition-colors duration-200 font-medium",
                location.startsWith("/search") && "text-primary"
              )}
            >
              Search Members
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                    Categories
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      {categories.map((category) => (
                        <NavigationMenuLink key={category.href} asChild>
                          <Link
                            href={category.href}
                            className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors duration-200"
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
            
            <Link 
              href="#community" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Community
            </Link>
            
            <Link 
              href="#" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Blog
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {user?.firstName || 'Account'}
                  </span>
                </Button>
                
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/florist-login">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Florist Login
                  </Button>
                </Link>
                
                <Link href="/auth">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Customer Login
                  </Button>
                </Link>
              </div>
            )}
            
            <Link href="/admin-list">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
            
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white">
              <Link href="/florist-register">
                <Store className="h-4 w-4 mr-2" />
                Join as Florist
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
                      src="/attached_assets/image_1756685957746.png" 
                      alt="FloriHub" 
                      className="h-8 w-8 object-contain"
                    />
                    FloriHub
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-muted-foreground hover:text-primary font-medium"
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
                        className="block py-2 text-sm text-muted-foreground hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {category.label}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <Button asChild className="w-full btn-primary">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Store className="h-4 w-4 mr-2" />
                        Get Listed Today
                      </Link>
                    </Button>
                    
                    {!isAuthenticated && (
                      <Button 
                        onClick={() => {
                          setMobileMenuOpen(false);
                          window.location.href = "/api/login";
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Login
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
