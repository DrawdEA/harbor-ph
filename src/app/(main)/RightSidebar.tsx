"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Filter, Calendar } from "lucide-react";

export default function RightSidebar() {
  const router = useRouter();
  const categories = ["Parties", "Flea Markets", "Concerts", "Running", "Other"];
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (selectedDate) params.set('date', selectedDate);
    if (location) params.set('location', location);
    if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
    
    const newURL = params.toString() ? `/events?${params.toString()}` : '/events';
    router.push(newURL);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  const clearFilters = () => {
    setSelectedDate("");
    setLocation("");
    setSelectedCategories([]);
  };

  const hasActiveFilters = selectedDate || location || selectedCategories.length > 0;

  return (
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        
        {/* Date Filter Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
          <div className="flex flex-col gap-2">
            <Button 
              variant={selectedDate === 'today' ? 'default' : 'secondary'} 
              className="w-full justify-start"
              onClick={() => setSelectedDate(selectedDate === 'today' ? '' : 'today')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button 
              variant={selectedDate === 'weekend' ? 'default' : 'secondary'} 
              className="w-full justify-start"
              onClick={() => setSelectedDate(selectedDate === 'weekend' ? '' : 'weekend')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              This Weekend
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Location Filter Section */}
        <div className="space-y-4">
          <Label htmlFor="location" className="font-semibold text-sm text-muted-foreground">Location</Label>
          <Input 
            id="location" 
            placeholder="Search by location..." 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <Separator className="my-6" />

        {/* Categories Filter Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Categories</h4>
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={category.toLowerCase()} 
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label htmlFor={category.toLowerCase()} className="font-normal text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button onClick={handleSearch} className="w-full">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}