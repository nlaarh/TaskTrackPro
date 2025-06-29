import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistance, formatRating, getImageUrl, generateStars, getBusinessHours } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  DollarSign,
  StarHalf,
} from "lucide-react";

const inquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  budget: z.string().optional(),
});

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export default function FloristDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const { data: florist, isLoading } = useQuery({
    queryKey: [`/api/florists/${id}/reviews`],
    enabled: !!id,
  });

  const saveFloristMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/florists/${id}/save`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Florist saved to your favorites!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/saved-florists'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to save florists.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save florist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const inquiryForm = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      phone: '',
      message: '',
      eventType: '',
      eventDate: '',
      budget: '',
    },
  });

  const reviewForm = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inquirySchema>) => {
      return apiRequest('POST', `/api/florists/${id}/inquiries`, data);
    },
    onSuccess: () => {
      toast({
        title: "Inquiry sent!",
        description: "The florist will receive your message and respond soon.",
      });
      setIsInquiryOpen(false);
      inquiryForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: z.infer<typeof reviewSchema>) => {
      return apiRequest('POST', `/api/florists/${id}/reviews`, data);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setIsReviewOpen(false);
      reviewForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/florists/${id}/reviews`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Sign in required",
          description: "Please sign in to leave a review.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded-lg" />
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded-lg" />
                <div className="h-32 bg-muted rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!florist) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Florist not found</h1>
            <p className="text-muted-foreground mb-6">
              The florist you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/search">Back to Search</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = florist.images.find(img => img.isPrimary) || florist.images[0];
  const stars = generateStars(parseFloat(florist.rating));
  const businessHours = getBusinessHours(florist.hours);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {florist.businessName}
              </h1>
              {florist.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Verified
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{florist.address}</span>
              </div>
              {florist.distance && (
                <span className="text-sm">{formatDistance(florist.distance)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {stars.map((star, i) => (
                  star === 'full' ? (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ) : star === 'half' ? (
                    <StarHalf key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star key={i} className="h-5 w-5 text-gray-300" />
                  )
                ))}
                <span className="font-medium ml-2">{formatRating(parseFloat(florist.rating))}</span>
                <span className="text-muted-foreground">({florist.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => saveFloristMutation.mutate()}
              variant="outline"
              disabled={saveFloristMutation.isPending}
            >
              <Heart className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Inquiry to {florist.businessName}</DialogTitle>
                </DialogHeader>
                <Form {...inquiryForm}>
                  <form onSubmit={inquiryForm.handleSubmit((data) => inquiryMutation.mutate(data))} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={inquiryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={inquiryForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={inquiryForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone (Optional)</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={inquiryForm.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="wedding">Wedding</SelectItem>
                                <SelectItem value="funeral">Funeral</SelectItem>
                                <SelectItem value="birthday">Birthday</SelectItem>
                                <SelectItem value="anniversary">Anniversary</SelectItem>
                                <SelectItem value="corporate">Corporate Event</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={inquiryForm.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={inquiryForm.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-100">Under $100</SelectItem>
                              <SelectItem value="100-300">$100 - $300</SelectItem>
                              <SelectItem value="300-500">$300 - $500</SelectItem>
                              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                              <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                              <SelectItem value="2500-plus">$2,500+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={inquiryForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe your floral needs, preferences, and any special requirements..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsInquiryOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="btn-primary" disabled={inquiryMutation.isPending}>
                        {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {florist.images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={getImageUrl(primaryImage?.imageUrl)}
                      alt={florist.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {florist.images.length > 1 && (
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-2">
                        {florist.images.slice(1, 5).map((image) => (
                          <div key={image.id} className="aspect-square relative overflow-hidden rounded-lg">
                            <img
                              src={getImageUrl(image.imageUrl)}
                              alt={image.caption || florist.businessName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {florist.images.length > 5 && (
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-medium">
                            +{florist.images.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {florist.businessName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {florist.description || "A professional florist dedicated to creating beautiful arrangements for all your special occasions."}
                </p>
                
                {florist.specialties && florist.specialties.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {florist.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {florist.services && florist.services.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {florist.services.map((service) => (
                        <Badge key={service} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Reviews ({florist.reviewCount})</CardTitle>
                {isAuthenticated && (
                  <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Write Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                      </DialogHeader>
                      <Form {...reviewForm}>
                        <form onSubmit={reviewForm.handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-6">
                          <FormField
                            control={reviewForm.control}
                            name="rating"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent</SelectItem>
                                      <SelectItem value="4">⭐⭐⭐⭐ Very Good</SelectItem>
                                      <SelectItem value="3">⭐⭐⭐ Good</SelectItem>
                                      <SelectItem value="2">⭐⭐ Fair</SelectItem>
                                      <SelectItem value="1">⭐ Poor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={reviewForm.control}
                            name="comment"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Review</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    placeholder="Share your experience with this florist..."
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsReviewOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" className="btn-primary" disabled={reviewMutation.isPending}>
                              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {florist.reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet. Be the first to review this florist!
                    </p>
                  ) : (
                    florist.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {review.user.firstName?.[0] || review.user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {review.user.firstName} {review.user.lastName}
                              </span>
                              <div className="flex items-center gap-1">
                                {generateStars(review.rating).map((star, i) => (
                                  star === 'full' ? (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ) : star === 'half' ? (
                                    <StarHalf key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <Star key={i} className="h-4 w-4 text-gray-300" />
                                  )
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{florist.address}</p>
                  </div>
                </div>
                
                {florist.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${florist.phone}`} className="text-sm text-primary hover:underline">
                        {florist.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {florist.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${florist.email}`} className="text-sm text-primary hover:underline">
                        {florist.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {florist.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={florist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Business Hours */}
            {businessHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {businessHours.map(({ day, time }) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="font-medium">{day}</span>
                        <span className="text-muted-foreground">{time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{formatRating(parseFloat(florist.rating))}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium">{florist.reviewCount}</span>
                </div>
                
                {florist.distance && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium">{formatDistance(florist.distance)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={florist.isActive ? "default" : "secondary"}>
                    {florist.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
