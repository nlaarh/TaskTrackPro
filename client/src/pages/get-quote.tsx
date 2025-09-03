import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Calendar, MapPin, Phone, Mail } from "lucide-react";

interface GetQuoteForm {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  budget: string;
  location: string;
  message: string;
}

export default function GetQuote() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<GetQuoteForm>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      eventType: "",
      eventDate: "",
      budget: "",
      location: "",
      message: ""
    }
  });

  const onSubmit = async (data: GetQuoteForm) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Quote request:", data);
      
      toast({
        title: "Quote Request Sent!",
        description: "We'll contact you within 24 hours with a personalized quote.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Get Your Custom Quote
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tell us about your event and we'll connect you with the perfect florist
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quote Form */}
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  Request Information
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you with a personalized quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Your full name"
                                className="bg-white/50 dark:bg-gray-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="(555) 123-4567"
                                className="bg-white/50 dark:bg-gray-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              placeholder="your.email@example.com"
                              className="bg-white/50 dark:bg-gray-700/50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                                  <SelectValue placeholder="Select event type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="wedding">Wedding</SelectItem>
                                <SelectItem value="birthday">Birthday Party</SelectItem>
                                <SelectItem value="anniversary">Anniversary</SelectItem>
                                <SelectItem value="corporate">Corporate Event</SelectItem>
                                <SelectItem value="funeral">Funeral Service</SelectItem>
                                <SelectItem value="graduation">Graduation</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="date"
                                className="bg-white/50 dark:bg-gray-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-white/50 dark:bg-gray-700/50">
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="under-100">Under $100</SelectItem>
                                <SelectItem value="100-250">$100 - $250</SelectItem>
                                <SelectItem value="250-500">$250 - $500</SelectItem>
                                <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                                <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                                <SelectItem value="over-2500">Over $2,500</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Location</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="City, State"
                                className="bg-white/50 dark:bg-gray-700/50"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Details</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Tell us more about your vision, color preferences, flower types, or any special requirements..."
                              className="bg-white/50 dark:bg-gray-700/50 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Get My Quote"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Information Card */}
            <div className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                    What Happens Next?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Review Your Request</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">We'll review your quote request and match you with the best florists in your area.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Get Connected</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Qualified florists will reach out to you within 24 hours with personalized quotes.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-white">Choose Your Florist</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Compare quotes and choose the florist that best fits your vision and budget.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5" />
                    <span>(555) 123-FLOWER</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5" />
                    <span>quotes@florihub.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5" />
                    <span>Mon-Fri 9AM-6PM EST</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}