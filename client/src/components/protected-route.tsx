import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireFlorist?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  requireFlorist = false,
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Check general authentication
    if (requireAuth && !isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    // Check admin requirement
    if (requireAdmin) {
      const token = localStorage.getItem('customerToken');
      const userData = localStorage.getItem('customerUser');
      
      if (!token || !userData) {
        setLocation(redirectTo);
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        if (user.role !== 'admin') {
          setLocation('/');
          return;
        }
      } catch {
        setLocation(redirectTo);
        return;
      }
    }

    // Check florist requirement
    if (requireFlorist) {
      const floristToken = localStorage.getItem('floristToken');
      if (!floristToken) {
        setLocation('/florist-login');
        return;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, requireAdmin, requireFlorist, redirectTo, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Return null if redirecting
  if (requireAuth && !isAuthenticated) return null;
  if (requireAdmin && !isAdminUser()) return null;
  if (requireFlorist && !isFloristUser()) return null;

  return <>{children}</>;
}

// Helper functions to check user types
function isAdminUser(): boolean {
  try {
    const token = localStorage.getItem('customerToken');
    const userData = localStorage.getItem('customerUser');
    
    if (!token || !userData) return false;
    
    const user = JSON.parse(userData);
    return user.role === 'admin';
  } catch {
    return false;
  }
}

function isFloristUser(): boolean {
  const floristToken = localStorage.getItem('floristToken');
  return !!floristToken;
}

// Utility function to check if user is authenticated
export function useAuthStatus() {
  const isAdmin = isAdminUser();
  const isFlorist = isFloristUser();
  const isAuthenticated = isAdmin || isFlorist;
  
  return {
    isAuthenticated,
    isAdmin,
    isFlorist
  };
}