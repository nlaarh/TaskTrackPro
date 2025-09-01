import { useLocation } from "wouter";
import { ReactNode, useEffect, useState } from "react";

// Simple auth status check based on localStorage
export function useAuthStatus() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('customerToken');
      const userStr = localStorage.getItem('customerUser');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          // Validate token isn't expired
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const isExpired = tokenPayload.exp * 1000 < Date.now();
          
          if (isExpired) {
            localStorage.removeItem('customerToken');
            localStorage.removeItem('customerUser');
            setAuthState({
              isAuthenticated: false,
              user: null,
              isLoading: false,
            });
          } else {
            setAuthState({
              isAuthenticated: true,
              user,
              isLoading: false,
            });
          }
        } catch (error) {
          // Invalid user data or token
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerUser');
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    };

    checkAuth();
  }, []);

  return authState;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireFlorist = false 
}: { 
  children: ReactNode;
  requireAdmin?: boolean;
  requireFlorist?: boolean;
}) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStatus();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation('/auth');
        return;
      }

      if (requireAdmin && user?.role !== 'admin') {
        setLocation('/auth');
        return;
      }

      if (requireFlorist && user?.role !== 'florist') {
        setLocation('/auth');
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requireAdmin, requireFlorist, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  if (requireFlorist && user?.role !== 'florist') {
    return null;
  }

  return <>{children}</>;
}