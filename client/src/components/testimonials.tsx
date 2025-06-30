import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Emily & James",
    business: "Wedding Couple",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "FloriHub helped us find the most talented florist for our dream wedding. The arrangements were breathtaking and exceeded all our expectations. Truly magical!"
  },
  {
    id: 2,
    name: "Isabella Martinez",
    business: "Garden of Grace Florals",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "As a wedding florist, FloriHub connects me with couples who truly appreciate artistry in floral design. The platform showcases my work beautifully and brings quality clients."
  },
  {
    id: 3,
    name: "Robert & Catherine",
    business: "Anniversary Celebration",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    rating: 5,
    content: "For our 25th anniversary, we wanted something special. FloriHub led us to a florist who created the most elegant arrangements that made our celebration unforgettable."
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Celebrating Love Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            Discover how FloriHub connects couples with talented florists to create unforgettable moments through exceptional floral artistry.
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
