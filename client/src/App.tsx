import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import FloristDetail from "@/pages/florist-detail";
import FloristRegistration from "@/pages/florist-registration";
import FloristLogin from "@/pages/florist-login";
import FloristRegister from "@/pages/florist-register";
import FloristDashboard from "@/pages/florist-dashboard";
import FloristProfileSetup from "@/pages/florist-profile-setup";
import Auth from "@/pages/auth";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsers from "@/pages/admin-users";
import AdminCustomers from "@/pages/admin-customers";
import AdminFlorists from "@/pages/admin-florists";
import AdminClean from "@/pages/admin-clean";
import AdminList from "@/pages/admin-list";
import AdminMessagesRedesign from "@/pages/admin-messages-redesign";
import AdminWebsiteInfo from "@/pages/admin-website-info";
import Contact from "@/pages/contact";
import CustomerProfile from "@/pages/customer-profile";
import GetQuote from "@/pages/get-quote";
import AdminQuoteRequests from "@/pages/admin-quote-requests";
// Task management pages removed

function Router() {
  return (
    <Switch>
      {/* Authentication routes - always available */}
      <Route path="/auth" component={Auth} />
      <Route path="/admin-dashboard" component={() => {
        // Check admin authentication before rendering
        const token = localStorage.getItem('customerToken');
        const user = localStorage.getItem('customerUser');
        
        if (!token || !user) {
          window.location.href = '/auth';
          return <div>Redirecting to login...</div>;
        }
        
        try {
          const userData = JSON.parse(user);
          if (userData.role !== 'admin') {
            window.location.href = '/';
            return <div>Access denied. Admin role required.</div>;
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          window.location.href = '/auth';
          return <div>Invalid session. Redirecting...</div>;
        }
        
        return <AdminDashboard />;
      }} />
      <Route path="/admin" component={() => {
        // Redirect /admin to /admin-list
        window.location.href = '/admin-list';
        return <div>Redirecting...</div>;
      }} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/users" component={() => <ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/customers" component={() => <ProtectedRoute requireAdmin><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/florists" component={() => <ProtectedRoute requireAdmin><AdminFlorists /></ProtectedRoute>} />
      <Route path="/admin-clean" component={() => <ProtectedRoute requireAdmin><AdminClean /></ProtectedRoute>} />
      <Route path="/admin-list" component={() => <ProtectedRoute requireAdmin><AdminList /></ProtectedRoute>} />
      <Route path="/admin/website-info" component={() => <ProtectedRoute requireAdmin><AdminWebsiteInfo /></ProtectedRoute>} />
      <Route path="/admin/quote-requests" component={() => <ProtectedRoute requireAdmin><AdminQuoteRequests /></ProtectedRoute>} />
      {/* Task management routes removed */}
      <Route path="/messages" component={() => <ProtectedRoute requireAdmin><AdminMessagesRedesign /></ProtectedRoute>} />
      
      {/* Public Florist Routes */}
      <Route path="/florist-login" component={FloristLogin} />
      <Route path="/florist-register" component={FloristRegister} />
      
      {/* Protected Florist Routes */}
      <Route path="/florist-dashboard" component={() => <ProtectedRoute requireFlorist><FloristDashboard /></ProtectedRoute>} />
      <Route path="/florist-profile-setup" component={() => <ProtectedRoute requireFlorist><FloristProfileSetup /></ProtectedRoute>} />
      
      {/* Protected Customer Profile Route */}
      <Route path="/customer-profile" component={() => <ProtectedRoute><CustomerProfile /></ProtectedRoute>} />
      
      {/* Public Routes - Always Available */}
      <Route path="/" component={Landing} />
      <Route path="/search" component={SearchResults} />
      <Route path="/get-quote" component={GetQuote} />
      <Route path="/contact" component={Contact} />
      <Route path="/florist/:id" component={FloristDetail} />
      <Route path="/register" component={FloristRegistration} />
      
      {/* Catch all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
