import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Globe, Facebook, Instagram, Twitter, Linkedin, Youtube, ExternalLink } from "lucide-react";

interface WebsiteInfo {
  id: number;
  siteName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  description?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  updatedAt: string;
}

export default function Contact() {
  const { data: websiteInfo, isLoading, error } = useQuery<WebsiteInfo>({
    queryKey: ['/api/website-info'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !websiteInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-gray-600 mb-8">Get in touch with our team</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-yellow-800">Contact information is currently unavailable. Please check back later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } catch {
      return time;
    }
  };

  const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  const socialColors = {
    facebook: "text-blue-600 hover:text-blue-700",
    instagram: "text-pink-600 hover:text-pink-700",
    twitter: "text-blue-400 hover:text-blue-500",
    linkedin: "text-blue-700 hover:text-blue-800",
    youtube: "text-red-600 hover:text-red-700",
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {websiteInfo.description || "Get in touch with our team for any questions or support."}
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${websiteInfo.email}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {websiteInfo.email}
                  </a>
                </div>
              </div>

              {websiteInfo.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href={`tel:${websiteInfo.phone}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {websiteInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              {websiteInfo.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={websiteInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {websiteInfo.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          {(websiteInfo.address || websiteInfo.city) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Our Location
                </CardTitle>
                <CardDescription>
                  Visit us at our office location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{websiteInfo.ownerName}</p>
                  {websiteInfo.address && <p className="text-gray-600">{websiteInfo.address}</p>}
                  {(websiteInfo.city || websiteInfo.state || websiteInfo.zipCode) && (
                    <p className="text-gray-600">
                      {[websiteInfo.city, websiteInfo.state, websiteInfo.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Hours */}
          {websiteInfo.businessHours && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
                <CardDescription>
                  Our operating hours throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {days.map(({ key, label }) => {
                    const hours = websiteInfo.businessHours?.[key as keyof typeof websiteInfo.businessHours];
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium">{label}</span>
                        {hours?.closed ? (
                          <Badge variant="secondary" className="text-gray-500">Closed</Badge>
                        ) : (
                          <span className="text-gray-600">
                            {formatTime(hours?.open || '09:00')} - {formatTime(hours?.close || '17:00')}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {websiteInfo.socialMedia && Object.keys(websiteInfo.socialMedia).some(key => websiteInfo.socialMedia?.[key as keyof typeof websiteInfo.socialMedia]) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Follow Us
                </CardTitle>
                <CardDescription>
                  Connect with us on social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(websiteInfo.socialMedia)
                    .filter(([_, url]) => url)
                    .map(([platform, url]) => {
                      const Icon = socialIcons[platform as keyof typeof socialIcons];
                      const colorClass = socialColors[platform as keyof typeof socialColors];
                      
                      if (!Icon) return null;
                      
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 transition-colors ${colorClass}`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="capitalize font-medium">{platform}</span>
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </a>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Form Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Send us a Message</CardTitle>
            <CardDescription>
              Have a question or need assistance? We'd love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800 mb-2">
                <Mail className="h-6 w-6 mx-auto mb-2" />
                Ready to get in touch?
              </p>
              <p className="text-blue-700">
                Please email us at{' '}
                <a 
                  href={`mailto:${websiteInfo.email}`}
                  className="font-semibold hover:underline"
                >
                  {websiteInfo.email}
                </a>
                {' '}or call{' '}
                {websiteInfo.phone && (
                  <a 
                    href={`tel:${websiteInfo.phone}`}
                    className="font-semibold hover:underline"
                  >
                    {websiteInfo.phone}
                  </a>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}