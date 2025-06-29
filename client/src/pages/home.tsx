import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedCategories from "@/components/featured-categories";
import CommunitySection from "@/components/community-section";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageSquare, Calendar, Star } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  const { data: userFlorist } = useQuery({
    queryKey: ["/api/user/florist"],
    retry: false,
  });

  const { data: savedFlorists } = useQuery({
    queryKey: ["/api/user/saved-florists"],
  });

  const { data: userInquiries } = useQuery({
    queryKey: ["/api/user/inquiries"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Welcome back, {user?.firstName || 'Friend'}! 👋
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover beautiful flowers, connect with local florists, and make every occasion special.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Saved Florists */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Florists</CardTitle>
                <Heart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{savedFlorists?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Your favorite florists</p>
              </CardContent>
            </Card>

            {/* Inquiries Sent */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userInquiries?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Messages sent</p>
              </CardContent>
            </Card>

            {/* Your Listing */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Listing</CardTitle>
                <Star className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userFlorist ? '1' : '0'}</div>
                <p className="text-xs text-muted-foreground">
                  {userFlorist ? 'Active listing' : 'No listing yet'}
                </p>
              </CardContent>
            </Card>

            {/* This Month */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">New discoveries</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Customers */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Find Your Perfect Florist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Browse local florists, compare services, and find the perfect match for your special occasion.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="btn-primary flex-1">
                    <Link href="/search">
                      Search Florists
                    </Link>
                  </Button>
                  {savedFlorists && savedFlorists.length > 0 && (
                    <Button variant="outline" className="flex-1">
                      View Saved ({savedFlorists.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* For Florists */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>
                  {userFlorist ? 'Manage Your Business' : 'Start Your Florist Journey'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {userFlorist 
                    ? 'Update your listing, manage inquiries, and grow your business.'
                    : 'Join thousands of florists and start connecting with customers today.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {userFlorist ? (
                    <>
                      <Button asChild className="btn-primary flex-1">
                        <Link href={`/florist/${userFlorist.id}`}>
                          View Your Listing
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Manage Business
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="btn-primary w-full">
                      <Link href="/register">
                        Get Listed Today
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <HeroSection />
      <FeaturedCategories />
      <CommunitySection />
      <Testimonials />
      <Footer />
    </div>
  );
}
