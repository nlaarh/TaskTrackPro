import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

// Form schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function CustomerAuth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      console.log('🔐 LOGIN MUTATION: Starting login for', data.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      console.log('🔐 LOGIN MUTATION: Response status', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('🔐 LOGIN MUTATION: Error', error);
        throw new Error(error.message || 'Login failed');
      }
      
      const result = await response.json();
      console.log('🔐 LOGIN MUTATION: Success - Token received:', !!result.token);
      console.log('🔐 LOGIN MUTATION: User role:', result.user?.role);
      
      return result;
    },
    onSuccess: (data) => {
      console.log('🔐 LOGIN MUTATION: onSuccess - Token:', !!data.token, 'Role:', data.user?.role);
      
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      
      // Verify storage immediately
      const storedToken = localStorage.getItem('customerToken');
      const storedUser = localStorage.getItem('customerUser');
      console.log('🔐 LOGIN MUTATION: Token stored:', !!storedToken);
      console.log('🔐 LOGIN MUTATION: User stored:', !!storedUser);
      
      toast({
        title: "Welcome back!",
        description: `Hello ${data.user.firstName}, you're now logged in.`,
      });
      
      // Force a small delay before redirect to ensure localStorage is written
      setTimeout(() => {
        if (data.user.role === 'admin') {
          console.log('🔐 LOGIN MUTATION: Redirecting to /admin-dashboard');
          window.location.href = '/admin-dashboard'; // Use window.location for hard redirect
        } else {
          console.log('🔐 LOGIN MUTATION: Redirecting to /');
          setLocation('/');
        }
      }, 100);
    },
    onError: (error: Error) => {
      console.error('🔐 LOGIN MUTATION: onError -', error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.user));
      toast({
        title: "Account created!",
        description: `Welcome to FloriHub, ${data.user.firstName}!`,
      });
      
      // Redirect admin users to admin dashboard
      if (data.user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/');
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="flex min-h-[600px] max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Left side - Form */}
          <div className="flex-1 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  {isLogin ? "Welcome Back" : "Join FloriHub"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isLogin 
                    ? "Sign in to find the perfect florist for your special occasion"
                    : "Create your account to discover amazing florists in your area"
                  }
                </p>
              </div>

              {isLogin ? (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your email and password to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    {...field} 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full btn-primary"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Join thousands of customers who trust FloriHub
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input {...field} placeholder="John" className="pl-10" />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Doe" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input {...field} type="email" placeholder="your@email.com" className="pl-10" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    {...field} 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Choose a strong password"
                                    className="pl-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                  <Input 
                                    {...field} 
                                    type={showConfirmPassword ? "text" : "password"} 
                                    placeholder="Confirm your password"
                                    className="pl-10 pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                  >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full btn-primary"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Hero */}
          <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-pink-100 to-purple-100 p-12 items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cpath d='M100 20c30 0 60 20 60 50s-20 40-30 60c-5 10-15 30-30 30s-25-20-30-30c-10-20-30-30-30-60s30-50 60-50z' fill='%23ec4899'/%3E%3Cpath d='M100 80c15 0 25 10 25 25s-10 25-25 25-25-10-25-25 10-25 25-25z' fill='%23ffffff'/%3E%3C/svg%3E"
                  alt="Flower illustration"
                  className="w-32 h-32"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Beautiful Flowers
              </h2>
              <p className="text-gray-600 text-lg">
                Connect with local florists and find the perfect arrangements for your special moments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}