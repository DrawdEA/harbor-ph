"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Filter } from "lucide-react";

export default function RightSidebar() {
  const router = useRouter();
  
  // Filter state - matching FeedFilters exactly
  const [filters, setFilters] = useState({
    status: 'ALL',
    dateRange: 'ALL',
    category: '',
    location: ''
  });

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.dateRange !== 'ALL') params.set('dateRange', filters.dateRange);
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    
    const newURL = params.toString() ? `/events?${params.toString()}` : '/events';
    router.push(newURL);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      dateRange: 'ALL',
      category: '',
      location: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'ALL');

  return (
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
      <CardHeader className="px-4 pt-4 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {/* Status Filter Section - Horizontal */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm text-muted-foreground">Status</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={filters.status === 'ALL' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('status', 'ALL')}
            >
              All
            </Button>
            <Button
              variant={filters.status === 'ACTIVE' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('status', 'ACTIVE')}
            >
              Active
            </Button>
            <Button
              variant={filters.status === 'LIVE' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('status', 'LIVE')}
            >
              Live
            </Button>
            <Button
              variant={filters.status === 'COMPLETED' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('status', 'COMPLETED')}
            >
              Completed
            </Button>
          </div>
        </div>

        {/* Date Range Filter Section - Horizontal */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm text-muted-foreground">Date Range</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filters.dateRange === 'ALL' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'ALL')}
            >
              All
            </Button>
            <Button
              variant={filters.dateRange === 'TODAY' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'TODAY')}
            >
              Today
            </Button>
            <Button
              variant={filters.dateRange === 'TOMORROW' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'TOMORROW')}
            >
              Tomorrow
            </Button>
            <Button
              variant={filters.dateRange === 'THIS_WEEK' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'THIS_WEEK')}
            >
              Week
            </Button>
            <Button
              variant={filters.dateRange === 'THIS_MONTH' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'THIS_MONTH')}
            >
              Month
            </Button>
            <Button
              variant={filters.dateRange === 'UPCOMING' ? 'default' : 'secondary'}
              size="sm"
              className="text-xs h-8"
              onClick={() => handleFilterChange('dateRange', 'UPCOMING')}
            >
              Upcoming
            </Button>
          </div>
        </div>

        {/* Category Filter Section */}
        <div className="space-y-2">
          <Label htmlFor="category" className="font-semibold text-sm text-muted-foreground">Category</Label>
          <Input
            id="category"
            placeholder="Enter category..."
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Location Filter Section */}
        <div className="space-y-2">
          <Label htmlFor="location" className="font-semibold text-sm text-muted-foreground">Location</Label>
          <Input
            id="location"
            placeholder="City, province, or venue..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button onClick={handleApplyFilters} size="sm" className="w-full h-8">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="outline" size="sm" className="w-full h-8">
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}