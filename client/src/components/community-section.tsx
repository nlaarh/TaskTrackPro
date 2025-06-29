import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, NotebookPen, UserPlus, Star, MessageSquare } from "lucide-react";
import { Link } from "wouter";

export default function CommunitySection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const { toast } = useToast();

  const newsletterMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/newsletter/subscribe', { email });
    },
    onSuccess: () => {
      toast({
        title: "Subscribed successfully!",
        description: "You'll receive updates about floral trends and tips.",
      });
      setEmail("");
      setConsent(false);
    },
    onError: () => {
      toast({
        title: "Subscription failed",
        description: "Please try again or check if you're already subscribed.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please agree to receive marketing emails.",
        variant: "destructive",
      });
      return;
    }
    newsletterMutation.mutate(email);
  };

  return (
    <section id="community" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Community Info */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Join Our Florist Community
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Connect with flower lovers, share your expertise, and grow your business in our 
              thriving community of professional florists and flower enthusiasts.
            </p>
            
            {/* 3-Step Guide */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Register Your Account</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your professional florist profile in minutes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Create Your Listing</h3>
                  <p className="text-muted-foreground text-sm">
                    Showcase your services, gallery, and business information
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Connect with Clients</h3>
                  <p className="text-muted-foreground text-sm">
                    Receive inquiries and build lasting relationships
                  </p>
                </div>
              </div>
            </div>
            
            <Button asChild className="btn-primary px-8 py-3 text-lg font-semibold">
              <Link href="/register">
                <UserPlus className="h-5 w-5 mr-2" />
                Get Listed Today
              </Link>
            </Button>
          </div>
          
          {/* Newsletter Signup */}
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl mb-2">Stay Connected</CardTitle>
              <p className="text-muted-foreground">
                Get the latest floral trends, business tips, and community updates delivered to your inbox.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter-consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(checked as boolean)}
                    className="mt-1"
                    required
                  />
                  <label htmlFor="newsletter-consent" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to receive marketing emails and can unsubscribe at any time.
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-primary py-3 font-semibold"
                  disabled={newsletterMutation.isPending}
                >
                  <NotebookPen className="h-4 w-4 mr-2" />
                  {newsletterMutation.isPending ? "Subscribing..." : "Subscribe Now"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Join <strong>15,000+</strong> florists and flower enthusiasts
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
