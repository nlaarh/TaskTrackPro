import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedCategories from "@/components/featured-categories";
import CommunitySection from "@/components/community-section";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/footer";
import FloatingActionButton from "@/components/floating-action-button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <FeaturedCategories />
      <CommunitySection />
      <Testimonials />
      <Footer />
      <FloatingActionButton />
    </div>
  );
}
