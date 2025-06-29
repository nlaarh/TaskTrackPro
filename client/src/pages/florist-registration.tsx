import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star,
  Check,
  X,
  Plus
} from "lucide-react";

const floristSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  phone: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  services: z.array(z.string()).min(1, "Select at least one service"),
  specialties: z.array(z.string()).optional(),
});

const availableServices = [
  "Wedding Flowers",
  "Funeral Arrangements", 
  "Birthday Bouquets",
  "Anniversary Flowers",
  "Corporate Events",
  "Same Day Delivery",
  "Custom Arrangements",
  "Bridal Consultation",
  "Event Planning",
  "Flower Subscriptions",
];

const availableSpecialties = [
  "Roses",
  "Lilies", 
  "Orchids",
  "Wildflowers",
  "Seasonal Arrangements",
  "Eco-friendly Options",
  "Luxury Designs",
  "Minimalist Style",
  "Vintage Arrangements",
  "Modern Contemporary",
];

export default function FloristRegistration() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const form = useForm<z.infer<typeof floristSchema>>({
    resolver: zodResolver(floristSchema),
    defaultValues: {
      businessName: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      website: "",
      email: user?.email || "",
      services: [],
      specialties: [],
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof floristSchema>) => {
      return apiRequest('POST', '/api/florists', data);
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful!",
        description: "Your florist listing has been created. It may take up to 24 hours for verification.",
      });
      setLocation(`/florist/${data.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to register your business.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Registration failed",
        description: "There was an error creating your listing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleServiceToggle = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    setSelectedServices(updated);
    form.setValue('services', updated);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = selectedSpecialties.includes(specialty)
      ? selectedSpecialties.filter(s => s !== specialty)
      : [...selectedSpecialties, specialty];
    setSelectedSpecialties(updated);
    form.setValue('specialties', updated);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <Store className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
                <p className="text-muted-foreground mb-6">
                  Please sign in to register your florist business on FloriHub.
                </p>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="btn-primary"
                >
                  Sign In to Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/5 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Join FloriHub Today
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create your professional florist listing and start connecting with customers in your area.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Local Visibility</h3>
              <p className="text-sm text-muted-foreground">
                Get discovered by customers searching for florists in your area
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Build Your Reputation</h3>
              <p className="text-sm text-muted-foreground">
                Showcase your work and collect reviews from satisfied customers
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Manage Inquiries</h3>
              <p className="text-sm text-muted-foreground">
                Receive and respond to customer inquiries directly through the platform
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Your Florist Listing</CardTitle>
              <p className="text-muted-foreground">
                Fill out the information below to create your professional florist profile.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => registrationMutation.mutate(data))} className="space-y-8">
                  {/* Business Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Business Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Flower Shop Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your florist business, your experience, and what makes you special..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ZIP Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="info@yourflowershop.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://yourflowershop.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Services */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Services Offered *</h3>
                    <p className="text-sm text-muted-foreground">
                      Select all services that your business provides
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableServices.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <label
                            htmlFor={service}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map((service) => (
                          <Badge key={service} variant="secondary" className="gap-1">
                            {service}
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(service)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {form.formState.errors.services && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.services.message}
                      </p>
                    )}
                  </div>

                  {/* Specialties */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Specialties</h3>
                    <p className="text-sm text-muted-foreground">
                      What types of flowers or arrangements do you specialize in?
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                      {availableSpecialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={specialty}
                            checked={selectedSpecialties.includes(specialty)}
                            onCheckedChange={() => handleSpecialtyToggle(specialty)}
                          />
                          <label
                            htmlFor={specialty}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {specialty}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    {selectedSpecialties.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSpecialties.map((specialty) => (
                          <Badge key={specialty} variant="outline" className="gap-1">
                            {specialty}
                            <button
                              type="button"
                              onClick={() => handleSpecialtyToggle(specialty)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation('/')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="btn-primary px-8"
                      disabled={registrationMutation.isPending}
                    >
                      {registrationMutation.isPending ? (
                        "Creating Listing..."
                      ) : (
                        "Create Listing"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
