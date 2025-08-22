"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FeedFiltersProps {
  onFiltersChange: (filters: FeedFilters) => void;
}

export interface FeedFilters {
  status: string;
  dateRange: string;
  category: string;
  location: string;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'LIVE', label: 'Live' },
  { value: 'COMPLETED', label: 'Completed' }
];

const DATE_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'TODAY', label: 'Today' },
  { value: 'TOMORROW', label: 'Tomorrow' },
  { value: 'THIS_WEEK', label: 'Week' },
  { value: 'THIS_MONTH', label: 'Month' },
  { value: 'UPCOMING', label: 'Upcoming' }
];

export default function FeedFilters({ onFiltersChange }: FeedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FeedFilters>({
    status: searchParams.get('status') || 'ALL',
    dateRange: searchParams.get('dateRange') || 'ALL',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || ''
  });

  // Only apply filters when Apply Filters button is clicked
  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    
    if (filters.status !== 'ALL') params.set('status', filters.status);
    if (filters.dateRange !== 'ALL') params.set('dateRange', filters.dateRange);
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);

    const newUrl = params.toString() ? `?${params.toString()}` : '/events';
    router.push(newUrl, { scroll: false });
    
    onFiltersChange(filters);
  };

  const handleFilterChange = (key: keyof FeedFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: 'ALL',
      dateRange: 'ALL',
      category: '',
      location: ''
    };
    setFilters(clearedFilters);
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
            {STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filters.status === option.value ? 'default' : 'secondary'}
                size="sm"
                className="text-xs h-8"
                onClick={() => handleFilterChange('status', option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter Section - Horizontal */}
        <div className="space-y-2">
          <Label className="font-semibold text-sm text-muted-foreground">Date Range</Label>
          <div className="grid grid-cols-3 gap-2">
            {DATE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={filters.dateRange === option.value ? 'default' : 'secondary'}
                size="sm"
                className="text-xs h-8"
                onClick={() => handleFilterChange('dateRange', option.value)}
              >
                {option.label}
              </Button>
            ))}
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
