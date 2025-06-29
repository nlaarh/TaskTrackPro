import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    business: "Petals & Stems Florist",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "FloriHub has transformed my business! I've connected with so many new customers and the platform makes it easy to showcase my work. Highly recommended for any florist."
  },
  {
    id: 2,
    name: "Mike & Lisa Chen",
    business: "Happy Customers",
    image: "https://images.unsplash.com/photo-1521119989659-a83eee488004?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "Found the perfect florist for our wedding through FloriHub. The search was so easy and we could compare different options in our area. Amazing service!"
  },
  {
    id: 3,
    name: "David Rodriguez",
    business: "Bloom Artistry",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "As a new florist, FloriHub helped me establish my business and reach customers I never would have found otherwise. The community support is incredible!"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from florists and customers who have found success through FloriHub.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex text-yellow-400 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={`${testimonial.name} testimonial`}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.business}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
