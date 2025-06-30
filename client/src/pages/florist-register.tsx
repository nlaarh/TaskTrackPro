import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Eye, EyeOff, User, Store, MapPin, Phone, Globe, Star, Upload, X, Flower2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  
  // Business Information
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  
  // Professional Information
  profileSummary: z.string().min(50, "Profile summary must be at least 50 characters"),
  yearsOfExperience: z.number().min(0, "Years of experience must be 0 or more").max(50, "Years of experience must be 50 or less"),
  specialties: z.array(z.string()).min(1, "Please select at least one specialty"),
  
  // Profile Image
  profileImageUrl: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const SPECIALTIES = [
  "Wedding Arrangements",
  "Funeral Services",
  "Corporate Events",
  "Birthday Celebrations",
  "Anniversary Flowers",
  "Baby Showers",
  "Graduation Events",
  "Holiday Decorations",
  "Bridal Bouquets",
  "Centerpieces",
  "Sympathy Arrangements",
  "Exotic Flowers",
  "Organic/Natural Arrangements",
  "Modern/Contemporary Style",
  "Traditional/Classic Style",
  "Seasonal Arrangements",
];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function FloristRegister() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      website: "",
      profileSummary: "",
      yearsOfExperience: 0,
      specialties: [],
      profileImageUrl: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const response = await fetch('/api/auth/florist/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: "Welcome to FloriHub! You can now start managing your business.",
      });
      setLocation('/florist-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    
    setSelectedSpecialties(updated);
    form.setValue('specialties', updated);
  };

  const onSubmit = (data: RegistrationForm) => {
    const formData = { ...data, specialties: selectedSpecialties };
    registerMutation.mutate(formData);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Flower2 className="h-8 w-8 text-gray-900 mr-2" />
            <span className="text-2xl font-bold text-gray-900">FloriHub</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h1>
          <p className="text-gray-600">Register your florist business and connect with customers</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-gray-900' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentStep === 1 && "Personal Information"}
              {currentStep === 2 && "Business Details"}
              {currentStep === 3 && "Professional Profile"}
            </CardTitle>
            <CardDescription className="text-center">
              {currentStep === 1 && "Tell us about yourself"}
              {currentStep === 2 && "Your business information"}
              {currentStep === 3 && "Your expertise and experience"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          className="pl-10"
                          {...form.register("firstName")}
                        />
                      </div>
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          className="pl-10"
                          {...form.register("lastName")}
                        />
                      </div>
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        {...form.register("email")}
                      />
                    </div>
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...form.register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          {...form.register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        className="pl-10"
                        {...form.register("phone")}
                      />
                    </div>
                    {form.formState.errors.phone && (
                      <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Business Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="businessName"
                        placeholder="Blooming Gardens Florist"
                        className="pl-10"
                        {...form.register("businessName")}
                      />
                    </div>
                    {form.formState.errors.businessName && (
                      <p className="text-sm text-red-600">{form.formState.errors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        placeholder="123 Main Street"
                        className="pl-10"
                        {...form.register("address")}
                      />
                    </div>
                    {form.formState.errors.address && (
                      <p className="text-sm text-red-600">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        {...form.register("city")}
                      />
                      {form.formState.errors.city && (
                        <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select onValueChange={(value) => form.setValue('state', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.state && (
                        <p className="text-sm text-red-600">{form.formState.errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        placeholder="10001"
                        {...form.register("zipCode")}
                      />
                      {form.formState.errors.zipCode && (
                        <p className="text-sm text-red-600">{form.formState.errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="website"
                        placeholder="https://www.yourbusiness.com"
                        className="pl-10"
                        {...form.register("website")}
                      />
                    </div>
                    {form.formState.errors.website && (
                      <p className="text-sm text-red-600">{form.formState.errors.website.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Professional Profile */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="profileSummary">Profile Summary</Label>
                    <Textarea
                      id="profileSummary"
                      placeholder="Tell potential customers about your experience, style, and what makes your floral designs special..."
                      className="min-h-24"
                      {...form.register("profileSummary")}
                    />
                    <p className="text-sm text-gray-500">
                      Describe your experience, specialties, and what makes your floral work unique.
                    </p>
                    {form.formState.errors.profileSummary && (
                      <p className="text-sm text-red-600">{form.formState.errors.profileSummary.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="5"
                      {...form.register("yearsOfExperience", { valueAsNumber: true })}
                    />
                    {form.formState.errors.yearsOfExperience && (
                      <p className="text-sm text-red-600">{form.formState.errors.yearsOfExperience.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Specialties</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Select all that apply to your expertise
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {SPECIALTIES.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => handleSpecialtyToggle(specialty)}
                          />
                          <Label
                            htmlFor={specialty}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {form.formState.errors.specialties && (
                      <p className="text-sm text-red-600">{form.formState.errors.specialties.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profileImageUrl">Profile Picture URL (Optional)</Label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="profileImageUrl"
                        placeholder="https://example.com/your-photo.jpg"
                        className="pl-10"
                        {...form.register("profileImageUrl")}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload your photo to a service like Imgur or use an existing URL
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep} className="ml-auto">
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="ml-auto bg-gray-900 hover:bg-gray-800"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/florist-login" className="text-gray-900 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Back to FloriHub
          </Link>
        </div>
      </div>
    </div>
  );
}