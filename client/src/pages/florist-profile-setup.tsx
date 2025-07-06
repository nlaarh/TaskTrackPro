import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Camera, Check, ArrowLeft } from "lucide-react";

const profileSetupSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  phone: z.string().min(10, "Phone number is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  profileSummary: z.string().min(20, "Profile summary must be at least 20 characters"),
  yearsOfExperience: z.number().min(0, "Years of experience must be positive"),
  specialties: z.array(z.string()).min(1, "Select at least one specialty"),
  services: z.array(z.string()).min(1, "Select at least one service"),
});

type ProfileSetupForm = z.infer<typeof profileSetupSchema>;

interface ReferenceItem {
  id: number;
  name: string;
  description: string;
}

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function FloristProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [floristData, setFloristData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch reference data from API
  const { data: specialtiesData = [] as ReferenceItem[], isLoading: specialtiesLoading } = useQuery<ReferenceItem[]>({
    queryKey: ['/api/reference/specialties'],
    retry: false,
  });

  const { data: servicesData = [] as ReferenceItem[], isLoading: servicesLoading } = useQuery<ReferenceItem[]>({
    queryKey: ['/api/reference/services'],
    retry: false,
  });

  const form = useForm<ProfileSetupForm>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      website: "",
      profileSummary: "",
      yearsOfExperience: 0,
      specialties: [],
      services: [],
    },
  });

  useEffect(() => {
    const token = localStorage.getItem('florist_token');
    const florist = localStorage.getItem('florist_data');
    
    if (!token || !florist) {
      setLocation('/florist-login');
      return;
    }

    try {
      const data = JSON.parse(florist);
      setFloristData(data);
      // Set form defaults with existing florist auth data
      form.setValue('phone', data.phone || '');
    } catch (error) {
      console.error('Error parsing florist data:', error);
      setLocation('/florist-login');
    }
  }, [setLocation, form]);

  // Always try to fetch existing profile data to determine edit vs create mode
  const { data: existingProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['/api/florist/profile'],
    enabled: true, // Always fetch to check if profile exists
    retry: false,
    queryFn: async () => {
      const token = localStorage.getItem('florist_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await fetch('/api/florist/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      
      return response.json();
    },
  });

  // Determine if we're in edit mode based on existing profile data
  const isEditMode = existingProfile && existingProfile.businessProfile && existingProfile.businessProfile.businessName;
  
  // Populate form with existing data when editing
  useEffect(() => {
    if (existingProfile && !isLoadingProfile && existingProfile.businessProfile && existingProfile.businessProfile.businessName) {
      const profile = existingProfile.businessProfile;
      
      form.setValue('businessName', profile.businessName || '');
      form.setValue('address', profile.address || '');
      form.setValue('city', profile.city || '');
      form.setValue('state', profile.state || '');
      form.setValue('zipCode', profile.zipCode || '');
      form.setValue('phone', profile.phone || '');
      form.setValue('website', profile.website || '');
      form.setValue('profileSummary', profile.profileSummary || '');
      form.setValue('yearsOfExperience', profile.yearsOfExperience || 0);
      form.setValue('specialties', profile.specialties || []);
      form.setValue('services', profile.services || []);
      
      // Set selected arrays for UI
      setSelectedSpecialties(profile.specialties || []);
      setSelectedServices(profile.services || []);
      
      // Set profile image if exists
      if (profile.profileImageUrl) {
        setProfileImage(profile.profileImageUrl);
      }
    }
  }, [existingProfile, isLoadingProfile, form]);

  const profileSetupMutation = useMutation({
    mutationFn: async (data: ProfileSetupForm & { profileImageUrl?: string }) => {
      const token = localStorage.getItem('florist_token');
      
      const response = await fetch('/api/florist/profile/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Profile setup failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Mark profile as complete in localStorage
      localStorage.setItem('profile_setup_complete', 'true');
      
      toast({
        title: "Profile Setup Complete!",
        description: "Your business profile has been created successfully.",
      });
      setLocation('/florist-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(updated);
    form.setValue('specialties', updated);
  };

  const handleServiceToggle = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);
    form.setValue('services', updated);
  };

  const onSubmit = (data: ProfileSetupForm) => {
    profileSetupMutation.mutate({
      ...data,
      profileImageUrl: profileImage || undefined,
    });
  };

  if (!floristData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/florist-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {(existingProfile && existingProfile.businessName) ? 'Edit Your Profile' : 'Complete Your Profile'}
              </h1>
              <p className="text-sm text-gray-600">
                {(existingProfile && existingProfile.businessName) ? 'Update your business information and services' : 'Set up your business information to start attracting customers'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Loading state for existing profile */}
      {(existingProfile && existingProfile.businessName) && isLoadingProfile && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading your profile...</span>
          </div>
        </div>
      )}

      {/* Main form */}
      {(!(existingProfile && existingProfile.businessName) || !isLoadingProfile) && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Business Photo</CardTitle>
              <CardDescription>
                Upload a professional photo of your business or arrangements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Business profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {profileImage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => setProfileImage(null)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {profileImage ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-sm text-gray-600">
                    Recommended: 400x400px, max 5MB (JPG, PNG)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Tell customers about your flower business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    {...form.register("businessName")}
                    placeholder="Beautiful Blooms Florist"
                  />
                  {form.formState.errors.businessName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...form.register("website")}
                    placeholder="https://yourflorist.com"
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    {...form.register("yearsOfExperience", { valueAsNumber: true })}
                    placeholder="5"
                  />
                  {form.formState.errors.yearsOfExperience && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.yearsOfExperience.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="profileSummary">About Your Business *</Label>
                <Textarea
                  id="profileSummary"
                  {...form.register("profileSummary")}
                  placeholder="Tell customers about your flower shop, specialties, and what makes you unique..."
                  className="h-24"
                />
                {form.formState.errors.profileSummary && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.profileSummary.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Business Location</CardTitle>
              <CardDescription>
                Where customers can find you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main Street"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="San Francisco"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => form.setValue("state", value)}>
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
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    {...form.register("zipCode")}
                    placeholder="94102"
                  />
                  {form.formState.errors.zipCode && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.zipCode.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>
                What types of arrangements do you specialize in? *
              </CardDescription>
            </CardHeader>
            <CardContent>
              {specialtiesLoading ? (
                <p className="text-gray-500">Loading specialties...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {specialtiesData.map((specialty) => (
                    <Button
                      key={specialty.id}
                      type="button"
                      variant={selectedSpecialties.includes(specialty.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSpecialtyToggle(specialty.name)}
                      className="justify-start text-left h-auto py-2 px-3"
                      title={specialty.description}
                    >
                      {selectedSpecialties.includes(specialty.name) && (
                        <Check className="h-3 w-3 mr-2" />
                      )}
                      {specialty.name}
                    </Button>
                  ))}
                </div>
              )}
              {form.formState.errors.specialties && (
                <p className="text-sm text-red-600 mt-2">
                  {form.formState.errors.specialties.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>
                What services do you provide to customers? *
              </CardDescription>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <p className="text-gray-500">Loading services...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {servicesData.map((service) => (
                    <Button
                      key={service.id}
                      type="button"
                      variant={selectedServices.includes(service.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleServiceToggle(service.name)}
                      className="justify-start text-left h-auto py-2 px-3"
                      title={service.description}
                    >
                      {selectedServices.includes(service.name) && (
                        <Check className="h-3 w-3 mr-2" />
                      )}
                      {service.name}
                    </Button>
                  ))}
                </div>
              )}
              {form.formState.errors.services && (
                <p className="text-sm text-red-600 mt-2">
                  {form.formState.errors.services.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/florist-dashboard')}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={profileSetupMutation.isPending}
              className="min-w-[120px]"
            >
              {profileSetupMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {(existingProfile && existingProfile.businessName) ? 'Updating...' : 'Setting up...'}
                </div>
              ) : (
                (existingProfile && existingProfile.businessName) ? 'Update Profile' : 'Complete Setup'
              )}
            </Button>
          </div>
        </form>
        </div>
      )}
    </div>
  );
}