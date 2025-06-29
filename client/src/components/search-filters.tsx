import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
  currentFilters: {
    services: string[];
  };
}

const availableServices = [
  "Wedding Flowers",
  "Funeral Arrangements",
  "Birthday Bouquets",
  "Anniversary Flowers",
  "Corporate Events",
  "Same Day Delivery",
  "Custom Arrangements",
  "Bridal Consultation",
  "Event Planning",
  "Flower Subscriptions",
];

const distanceOptions = [
  { value: "5", label: "Within 5 miles" },
  { value: "10", label: "Within 10 miles" },
  { value: "25", label: "Within 25 miles" },
  { value: "50", label: "Within 50 miles" },
];

const ratingOptions = [
  { value: "4", label: "4+ Stars" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "5", label: "5 Stars Only" },
];

export default function SearchFilters({ onFilterChange, currentFilters }: SearchFiltersProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(currentFilters.services);
  const [selectedDistance, setSelectedDistance] = useState<string>("25");
  const [selectedRating, setSelectedRating] = useState<string>("");

  const handleServiceChange = (service: string, checked: boolean) => {
    const updated = checked
      ? [...selectedServices, service]
      : selectedServices.filter(s => s !== service);
    setSelectedServices(updated);
  };

  const applyFilters = () => {
    onFilterChange({
      services: selectedServices,
      radius: parseInt(selectedDistance),
      minRating: selectedRating ? parseFloat(selectedRating) : undefined,
    });
  };

  const clearFilters = () => {
    setSelectedServices([]);
    setSelectedDistance("25");
    setSelectedRating("");
    onFilterChange({
      services: [],
      radius: 25,
      minRating: undefined,
    });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Refine Search</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Distance Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Distance</h4>
          <RadioGroup value={selectedDistance} onValueChange={setSelectedDistance}>
            {distanceOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`distance-${option.value}`} />
                <Label htmlFor={`distance-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Services Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Services</h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {availableServices.map((service) => (
              <div key={service} className="flex items-center space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={(checked) => handleServiceChange(service, checked as boolean)}
                />
                <Label htmlFor={`service-${service}`} className="text-sm leading-relaxed">
                  {service}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rating Filter */}
        <div>
          <h4 className="font-medium text-foreground mb-3">Rating</h4>
          <RadioGroup value={selectedRating} onValueChange={setSelectedRating}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="rating-all" />
              <Label htmlFor="rating-all" className="text-sm">All Ratings</Label>
            </div>
            {ratingOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`rating-${option.value}`} />
                <Label htmlFor={`rating-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={applyFilters} className="w-full btn-primary">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear All
          </Button>
        </div>

        {/* Active Filters Summary */}
        {(selectedServices.length > 0 || selectedRating) && (
          <div className="pt-3 border-t">
            <h5 className="text-sm font-medium text-foreground mb-2">Active Filters:</h5>
            <div className="space-y-1 text-xs text-muted-foreground">
              {selectedServices.length > 0 && (
                <div>Services: {selectedServices.length} selected</div>
              )}
              {selectedRating && (
                <div>Rating: {selectedRating}+ stars</div>
              )}
              <div>Distance: Within {selectedDistance} miles</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
