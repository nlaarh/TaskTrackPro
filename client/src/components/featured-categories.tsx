import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: 1,
    title: "Wedding Flowers",
    description: "Beautiful bridal bouquets and ceremony decorations",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    href: "/search?services=Wedding%20Flowers",
    gradient: "from-pink-100 to-pink-200"
  },
  {
    id: 2,
    title: "Funeral Arrangements",
    description: "Respectful tributes and sympathy flowers",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    href: "/search?services=Funeral%20Arrangements",
    gradient: "from-gray-100 to-gray-200"
  },
  {
    id: 3,
    title: "Birthday & Celebrations",
    description: "Vibrant bouquets for special occasions",
    image: "https://images.unsplash.com/photo-1587334205817-c3df6abc544c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    href: "/search?services=Birthday%20Bouquets",
    gradient: "from-yellow-100 to-orange-200"
  },
  {
    id: 4,
    title: "Corporate Events",
    description: "Professional arrangements for business events",
    image: "https://images.unsplash.com/photo-1586611292717-f828b167408c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    href: "/search?services=Corporate%20Events",
    gradient: "from-green-100 to-blue-200"
  }
];

export default function FeaturedCategories() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Florists by Occasion
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether it's a wedding, funeral, or special celebration, find the perfect florist for your needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href={category.href}>
              <Card className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer h-full">
                <div className={`h-48 bg-gradient-to-br ${category.gradient} relative overflow-hidden`}>
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-primary bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm">
                    <span>Explore {category.title}</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
