import { Link } from "wouter";
import { Heart, Facebook, Instagram, Twitter, Phone, Mail } from "lucide-react";

const footerSections = [
  {
    title: "Quick Links",
    links: [
      { href: "/search", label: "Find Florists" },
      { href: "/search?services=Wedding%20Flowers", label: "Browse Categories" },
      { href: "#", label: "Local Events" },
      { href: "#", label: "Special Deals" },
      { href: "#community", label: "Community" },
    ]
  },
  {
    title: "For Florists",
    links: [
      { href: "/register", label: "Get Listed Today" },
      { href: "#", label: "Business Resources" },
      { href: "#", label: "Success Stories" },
      { href: "#", label: "Marketing Tools" },
      { href: "#", label: "Support Center" },
    ]
  },
  {
    title: "Support",
    links: [
      { href: "#", label: "Help Center" },
      { href: "#", label: "Contact Us" },
      { href: "#", label: "Privacy Policy" },
      { href: "#", label: "Terms of Service" },
      { href: "#", label: "Cookie Policy" },
    ]
  }
];

const socialLinks = [
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Twitter, label: "Twitter" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">FloriHub</span>
                <span className="text-xs text-neutral-400">Find Local Florists</span>
              </div>
            </Link>
            <p className="text-neutral-300 text-sm mb-6 leading-relaxed">
              Connecting flower lovers with the best local florists. Discover beautiful arrangements, 
              professional services, and build lasting relationships in your community.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center hover:bg-primary transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <div className="space-y-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-neutral-300 hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-neutral-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm mb-4 md:mb-0">
              © 2024 FloriHub. All rights reserved. Made with ❤️ for the floral community.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-neutral-400 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center text-neutral-400 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>hello@florihub.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
