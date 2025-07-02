import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import SearchResults from "@/pages/search-results";
import FloristDetail from "@/pages/florist-detail";
import FloristRegistration from "@/pages/florist-registration";
import FloristLogin from "@/pages/florist-login";
import FloristRegister from "@/pages/florist-register";
import FloristDashboard from "@/pages/florist-dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Florist authentication routes - always available */}
      <Route path="/florist-login" component={FloristLogin} />
      <Route path="/florist-register" component={FloristRegister} />
      <Route path="/florist-dashboard" component={FloristDashboard} />
      
      {/* Regular app routes based on authentication */}
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/search" component={SearchResults} />
          <Route path="/florist/:id" component={FloristDetail} />
          <Route path="/register" component={FloristRegistration} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={SearchResults} />
          <Route path="/florist/:id" component={FloristDetail} />
          <Route path="/register" component={FloristRegistration} />
        </>
      )}
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
