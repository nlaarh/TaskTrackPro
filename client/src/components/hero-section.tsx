import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ChevronDown } from "lucide-react";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocationInput, setSearchLocationInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword) params.append('keyword', searchKeyword);
    if (searchLocationInput) params.append('location', searchLocationInput);
    setLocation(`/search?${params.toString()}`);
  };

  const handlePopularSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    if (searchLocationInput) params.append('location', searchLocationInput);
    setLocation(`/search?${params.toString()}`);
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center parallax-bg"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(233, 30, 99, 0.8) 0%, rgba(233, 30, 99, 0.6) 100%), url('https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Beautiful
            <span className="block text-yellow-300">Local Florists</span>
          </h1>
          <p className="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed">
            Find the perfect florist for your special moments. Browse local flower shops, 
            compare services, and create unforgettable floral arrangements.
          </p>
        </div>
        
        {/* Search Form */}
        <div className="glass-effect rounded-2xl p-6 md:p-8 max-w-2xl mx-auto animate-slide-up">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium text-left">
                  What do you need?
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Wedding flowers, birthday bouquet..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-white text-sm font-medium text-left">
                  Search by location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="ZIP code or city name"
                    value={searchLocationInput}
                    onChange={(e) => setSearchLocationInput(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            <Button type="submit" className="btn-primary w-full py-4 text-white font-semibold rounded-lg text-lg">
              <Search className="h-5 w-5 mr-2" />
              Find Florists Near Me
            </Button>
          </form>
          
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-white text-sm">Popular searches:</span>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white hover:bg-white/30 transition-all duration-200 cursor-pointer"
              onClick={() => handlePopularSearch("Wedding Flowers")}
            >
              Wedding Flowers
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white hover:bg-white/30 transition-all duration-200 cursor-pointer"
              onClick={() => handlePopularSearch("Funeral Arrangements")}
            >
              Funeral Arrangements
            </Badge>
            <Badge 
              variant="secondary" 
              className="bg-white/20 text-white hover:bg-white/30 transition-all duration-200 cursor-pointer"
              onClick={() => handlePopularSearch("Valentine's Day")}
            >
              Valentine's Day
            </Badge>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">2,500+</div>
            <div className="text-white text-sm">Verified Florists</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">150+</div>
            <div className="text-white text-sm">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">50K+</div>
            <div className="text-white text-sm">Happy Customers</div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white" />
      </div>
    </section>
  );
}
