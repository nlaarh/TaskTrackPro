import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistance, formatRating, getImageUrl, generateStars } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  MapPin, 
  Star, 
  StarHalf,
  Eye, 
  MessageSquare,
  Clock,
  Phone,
  Mail
} from "lucide-react";
import type { FloristWithDetails } from "@shared/schema";

interface FloristCardProps {
  florist: FloristWithDetails;
  viewMode: 'grid' | 'list' | 'map';
}

export default function FloristCard({ florist, viewMode }: FloristCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  // Priority 1: Use stored base64 image data, Priority 2: Use URL, Priority 3: Default from images array
  const getFloristImage = () => {
    // Priority 1: Use stored base64 image data 
    if (florist.profileImageData && florist.profileImageData.trim() !== '') {
      return { url: florist.profileImageData, alt: florist.businessName };
    }
    
    // Priority 2: Use profileImageUrl
    if (florist.profileImageUrl && florist.profileImageUrl.trim() !== '') {
      return { url: florist.profileImageUrl, alt: florist.businessName };
    }
    
    // Priority 3: Use first image from images array
    if (florist.images && florist.images.length > 0) {
      return { url: florist.images[0].url, alt: florist.businessName };
    }
    
    return null;
  };
  
  const primaryImage = getFloristImage();
  
  // Debug: log the image data to see what we're getting
  console.log('🖼️ Florist:', florist.businessName);
  console.log('  - Has profileImageData:', !!florist.profileImageData);
  console.log('  - Has profileImageUrl:', !!florist.profileImageUrl);
  console.log('  - Primary image source:', primaryImage ? 'found' : 'none');
  if (primaryImage?.url) {
    console.log('  - Image starts with:', primaryImage.url.substring(0, 50));
  }
  const stars = generateStars(parseFloat(florist.averageRating || '0'));

  const saveFloristMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return apiRequest('DELETE', `/api/florists/${florist.id}/save`);
      } else {
        return apiRequest('POST', `/api/florists/${florist.id}/save`);
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast({
        title: isSaved ? "Removed from favorites" : "Added to favorites",
        description: isSaved 
          ? "Florist removed from your saved list."
          : "Florist saved to your favorites!",
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
        description: "Failed to update saved florists. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save florists.",
        variant: "destructive",
      });
      return;
    }
    saveFloristMutation.mutate();
  };

  if (viewMode === 'list') {
    return (
      <Card className="card-hover bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="md:flex">
          {/* Image */}
          <div className="md:w-80 h-64 md:h-auto relative">
            <img
              src={getImageUrl(primaryImage?.url)}
              alt={`${florist.businessName} storefront`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleSaveClick}
              disabled={saveFloristMutation.isPending}
              className="absolute top-4 right-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-sm"
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isSaved ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-500"
                )} 
              />
            </button>
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-gray-900 text-white">
                <Star className="h-3 w-3 mr-1" />
                {formatRating(parseFloat(florist.averageRating || '0'))}
              </Badge>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-foreground">
                    {florist.businessName}
                  </h3>
                  {florist.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {florist.distance ? formatDistance(florist.distance) + " away" : florist.city}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {florist.address}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center mb-1">
                  <div className="flex text-yellow-400 text-sm mr-2">
                    {stars.map((star, i) => (
                      star === 'full' ? (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ) : star === 'half' ? (
                        <StarHalf key={i} className="h-4 w-4 fill-current" />
                      ) : (
                        <Star key={i} className="h-4 w-4 text-gray-300" />
                      )
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({florist.reviewCount || 0} reviews)</span>
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Open now</span>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {florist.profileSummary || florist.description || "A professional florist dedicated to creating beautiful arrangements for all your special occasions."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {(florist.services || []).slice(0, 3).map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
              {(florist.services || []).length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(florist.services || []).length - 3} more
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="btn-primary flex-1">
                <Link href={`/florist/${florist.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Listing
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/florist/${florist.id}#contact`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden group">
      {/* Image */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={getImageUrl(primaryImage?.url)}
          alt={`${florist.businessName} storefront`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleSaveClick}
          disabled={saveFloristMutation.isPending}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all duration-200"
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors duration-200",
              isSaved ? "text-primary fill-primary" : "text-muted-foreground hover:text-primary"
            )} 
          />
        </button>
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-green-600 text-white">
            <Star className="h-3 w-3 mr-1" />
            {formatRating(parseFloat(florist.averageRating || '0'))}
          </Badge>
        </div>
      </div>
      
      {/* Content */}
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                {florist.businessName}
              </h3>
              {florist.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              <span>
                {florist.distance ? formatDistance(florist.distance) + " away" : florist.city}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-yellow-400 text-sm">
            {stars.map((star, i) => (
              star === 'full' ? (
                <Star key={i} className="h-4 w-4 fill-current" />
              ) : star === 'half' ? (
                <StarHalf key={i} className="h-4 w-4 fill-current" />
              ) : (
                <Star key={i} className="h-4 w-4 text-gray-300" />
              )
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({florist.reviewCount || 0})</span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {florist.profileSummary || florist.description || "A professional florist dedicated to creating beautiful arrangements for all your special occasions."}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {florist.services.slice(0, 2).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {florist.services.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{florist.services.length - 2}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <Button asChild className="btn-primary w-full">
            <Link href={`/florist/${florist.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Listing
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={`/florist/${florist.id}#contact`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
