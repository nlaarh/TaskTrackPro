import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flower2, Mail, Lock, Eye, EyeOff, User, Store, MapPin, Phone, Globe, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const customerRegisterSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  role: z.literal("customer"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const floristRegisterSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.literal("florist"),
  
  // Business Information
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  
  // Professional Information
  profileSummary: z.string().min(50, "Profile summary must be at least 50 characters").optional().or(z.literal("")),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or more").max(50, "Years of experience must be 50 or less").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type CustomerRegisterForm = z.infer<typeof customerRegisterSchema>;
type FloristRegisterForm = z.infer<typeof floristRegisterSchema>;

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [userRole, setUserRole] = useState<"customer" | "florist">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Check URL parameters to determine initial mode
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, []);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const customerRegisterForm = useForm<CustomerRegisterForm>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "customer",
    },
  });

  const floristRegisterForm = useForm<FloristRegisterForm>({
    resolver: zodResolver(floristRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "florist",
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      website: "",
      profileSummary: "",
      yearsOfExperience: 0,
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
      
      if (data.token) {
        localStorage.setItem('customerToken', data.token);
        console.log('🔐 LOGIN MUTATION: Token stored in localStorage');
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });

      // Redirect based on user role
      if (data.user?.role === 'admin') {
        setLocation('/admin-list');
      } else if (data.user?.role === 'florist') {
        setLocation('/florist-dashboard');
      } else {
        setLocation('/');
      }
    },
    onError: (error: any) => {
      console.error('🔐 LOGIN MUTATION: onError', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const customerRegisterMutation = useMutation({
    mutationFn: async (data: CustomerRegisterForm) => {
      console.log('📝 CUSTOMER REGISTER: Starting registration for', data.email);
      
      const response = await fetch('/api/auth/register', {
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
      if (data.token) {
        localStorage.setItem('customerToken', data.token);
      }
      
      toast({
        title: "Welcome to FloriHub!",
        description: "Your customer account has been created successfully.",
      });
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const floristRegisterMutation = useMutation({
    mutationFn: async (data: FloristRegisterForm) => {
      console.log('🏪 FLORIST REGISTER: Starting registration for', data.email);
      
      const response = await fetch('/api/auth/florist/register', {
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
      if (data.token) {
        localStorage.setItem('florist_token', data.token);
        localStorage.setItem('florist_data', JSON.stringify(data.florist));
      }
      
      toast({
        title: "Welcome to FloriHub!",
        description: "Your florist business has been registered successfully.",
      });
      setLocation('/florist-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onCustomerRegisterSubmit = (data: CustomerRegisterForm) => {
    customerRegisterMutation.mutate(data);
  };

  const onFloristRegisterSubmit = (data: FloristRegisterForm) => {
    floristRegisterMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-full">
                  <Flower2 className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {isLogin ? "Welcome Back" : "Join FloriHub"}
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  {isLogin 
                    ? "Sign in to your account to continue" 
                    : "Create your account to get started"
                  }
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Toggle between Login and Register */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isLogin
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !isLogin
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {isLogin ? (
                /* Login Form */
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        {...loginForm.register("email")}
                      />
                    </div>
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-600 mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                /* Register Form */
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <Label>I want to join as:</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setUserRole("customer")}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          userRole === "customer"
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <User className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Customer</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserRole("florist")}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          userRole === "florist"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Store className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-sm font-medium">Florist</div>
                      </button>
                    </div>
                  </div>

                  {userRole === "customer" ? (
                    /* Customer Registration Form */
                    <form onSubmit={customerRegisterForm.handleSubmit(onCustomerRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="First name"
                            {...customerRegisterForm.register("firstName")}
                          />
                          {customerRegisterForm.formState.errors.firstName && (
                            <p className="text-sm text-red-600 mt-1">
                              {customerRegisterForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Last name"
                            {...customerRegisterForm.register("lastName")}
                          />
                          {customerRegisterForm.formState.errors.lastName && (
                            <p className="text-sm text-red-600 mt-1">
                              {customerRegisterForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            {...customerRegisterForm.register("email")}
                          />
                        </div>
                        {customerRegisterForm.formState.errors.email && (
                          <p className="text-sm text-red-600 mt-1">
                            {customerRegisterForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password"
                            className="pl-10 pr-10"
                            {...customerRegisterForm.register("password")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {customerRegisterForm.formState.errors.password && (
                          <p className="text-sm text-red-600 mt-1">
                            {customerRegisterForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10"
                            {...customerRegisterForm.register("confirmPassword")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {customerRegisterForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-600 mt-1">
                            {customerRegisterForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                        disabled={customerRegisterMutation.isPending}
                      >
                        {customerRegisterMutation.isPending ? "Creating Account..." : "Create Customer Account"}
                      </Button>
                    </form>
                  ) : (
                    /* Florist Registration Form */
                    <form onSubmit={floristRegisterForm.handleSubmit(onFloristRegisterSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              placeholder="First name"
                              {...floristRegisterForm.register("firstName")}
                            />
                            {floristRegisterForm.formState.errors.firstName && (
                              <p className="text-sm text-red-600 mt-1">
                                {floristRegisterForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              placeholder="Last name"
                              {...floristRegisterForm.register("lastName")}
                            />
                            {floristRegisterForm.formState.errors.lastName && (
                              <p className="text-sm text-red-600 mt-1">
                                {floristRegisterForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              {...floristRegisterForm.register("email")}
                            />
                          </div>
                          {floristRegisterForm.formState.errors.email && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="(555) 123-4567"
                              className="pl-10"
                              {...floristRegisterForm.register("phone")}
                            />
                          </div>
                          {floristRegisterForm.formState.errors.phone && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              {...floristRegisterForm.register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {floristRegisterForm.formState.errors.password && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-10 pr-10"
                              {...floristRegisterForm.register("confirmPassword")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {floristRegisterForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Business Information */}
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-medium text-gray-900">Business Information</h3>
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <div className="relative">
                            <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="businessName"
                              placeholder="Your flower shop name"
                              className="pl-10"
                              {...floristRegisterForm.register("businessName")}
                            />
                          </div>
                          {floristRegisterForm.formState.errors.businessName && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.businessName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="address">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="address"
                              placeholder="Street address"
                              className="pl-10"
                              {...floristRegisterForm.register("address")}
                            />
                          </div>
                          {floristRegisterForm.formState.errors.address && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.address.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="City"
                              {...floristRegisterForm.register("city")}
                            />
                            {floristRegisterForm.formState.errors.city && (
                              <p className="text-sm text-red-600 mt-1">
                                {floristRegisterForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              placeholder="State"
                              {...floristRegisterForm.register("state")}
                            />
                            {floristRegisterForm.formState.errors.state && (
                              <p className="text-sm text-red-600 mt-1">
                                {floristRegisterForm.formState.errors.state.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code</Label>
                            <Input
                              id="zipCode"
                              placeholder="ZIP"
                              {...floristRegisterForm.register("zipCode")}
                            />
                            {floristRegisterForm.formState.errors.zipCode && (
                              <p className="text-sm text-red-600 mt-1">
                                {floristRegisterForm.formState.errors.zipCode.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="website">Website (Optional)</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="website"
                              type="url"
                              placeholder="https://yourflowershop.com"
                              className="pl-10"
                              {...floristRegisterForm.register("website")}
                            />
                          </div>
                          {floristRegisterForm.formState.errors.website && (
                            <p className="text-sm text-red-600 mt-1">
                              {floristRegisterForm.formState.errors.website.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        disabled={floristRegisterMutation.isPending}
                      >
                        {floristRegisterMutation.isPending ? "Creating Account..." : "Create Florist Account"}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Connect with Professional Florists
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              FloriHub is your premier destination for discovering talented florists and beautiful floral arrangements. 
              Whether you're a customer seeking the perfect flowers or a florist ready to showcase your artistry, 
              we bring the floral community together.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <User className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">For Customers</h3>
              <p className="text-gray-600 text-sm">
                Discover local florists, browse stunning arrangements, and find the perfect flowers for any occasion.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <Store className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">For Florists</h3>
              <p className="text-gray-600 text-sm">
                Showcase your floral artistry, connect with customers, and grow your business in our thriving marketplace.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 rounded-xl text-white">
            <Star className="h-8 w-8 mb-3" />
            <h3 className="font-semibold mb-2">Join Our Growing Community</h3>
            <p className="text-blue-100 text-sm">
              Over 500+ professional florists and thousands of satisfied customers trust FloriHub 
              for their floral needs. Be part of something beautiful.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}