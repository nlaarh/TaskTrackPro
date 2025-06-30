import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Store, Plus, X, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Expanded menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          <Link href="/florist-register">
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-50 shadow-lg border border-gray-200 rounded-full h-12 px-6 flex items-center space-x-2 whitespace-nowrap"
              onClick={() => setIsExpanded(false)}
            >
              <Store className="h-4 w-4" />
              <span>Join as Florist</span>
            </Button>
          </Link>
          <Link href="/florist-login">
            <Button 
              className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg rounded-full h-12 px-6 flex items-center space-x-2 whitespace-nowrap"
              onClick={() => setIsExpanded(false)}
            >
              <User className="h-4 w-4" />
              <span>Florist Login</span>
            </Button>
          </Link>
        </div>
      )}
      
      {/* Main FAB */}
      <Button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "bg-gray-900 hover:bg-gray-800 text-white rounded-full h-14 w-14 shadow-lg transition-all duration-300",
          isExpanded && "rotate-45"
        )}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}