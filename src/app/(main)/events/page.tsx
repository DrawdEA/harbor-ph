"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Calendar } from "lucide-react";
import { fetchEvents, Event } from "@/lib/event-query";
import EventCard from "@/components/event/EventCard";
import EventCardSkeleton from "@/components/event/EventCardSkeleton";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories') ? searchParams.get('categories')!.split(',') : []
  );
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  // Available categories (should match your database)
  const categories = ["Parties", "Flea Markets", "Concerts", "Running", "Other"];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, searchTerm, selectedDate, location, selectedCategories]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result = await fetchEvents({ pageParam: 0 });
      setEvents(result.events || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (selectedDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeekend = new Date(today);
      thisWeekend.setDate(thisWeekend.getDate() + (6 - today.getDay()));

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        if (selectedDate === 'today') {
          return eventDate.toDateString() === today.toDateString();
        } else if (selectedDate === 'weekend') {
          return eventDate >= today && eventDate <= thisWeekend;
        }
        return true;
      });
    }

         // Location filter
     if (location) {
       filtered = filtered.filter(event => {
         // Handle both array and single object cases
         if (Array.isArray(event.venues)) {
           return event.venues.some((venue) => 
             venue.name?.toLowerCase().includes(location.toLowerCase()) ||
             venue.city?.toLowerCase().includes(location.toLowerCase()) ||
             venue.province?.toLowerCase().includes(location.toLowerCase()) ||
             venue.postalCode?.toLowerCase().includes(location.toLowerCase()) ||
             venue.country?.toLowerCase().includes(location.toLowerCase())
           );
         } else if (event.venues) {
           // Single venue object
           return event.venues.name?.toLowerCase().includes(location.toLowerCase()) ||
                  event.venues.city?.toLowerCase().includes(location.toLowerCase()) ||
                  event.venues.province?.toLowerCase().includes(location.toLowerCase()) ||
                  event.venues.postalCode?.toLowerCase().includes(location.toLowerCase()) ||
                  event.venues.country?.toLowerCase().includes(location.toLowerCase());
         }
         return false;
       });
     }

         // Categories filter
     if (selectedCategories.length > 0) {
       filtered = filtered.filter(event => {
         if (Array.isArray(event.categories_on_events)) {
           return event.categories_on_events.some((catRel) => 
             catRel.categories && selectedCategories.includes(catRel.categories.name)
           );
         }
         return false;
       });
     }

    setFilteredEvents(filtered);
  };





  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setLocation('');
    setSelectedCategories([]);
    router.push('/events');
  };

  const hasActiveFilters = searchTerm || selectedDate || location || selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events</h1>
          <p className="text-gray-600">
            {hasActiveFilters 
              ? `Found ${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} matching your filters`
              : `Browse all ${events.length} events`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
                         <Card className="sticky top-20 font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
                                            <CardHeader className="px-6 pt-6">
                 <CardTitle className="flex items-center gap-2">
                   <Filter className="h-4 w-4" />
                   Filters
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-6 pt-0">

                {/* Date Filter */}
                <div className="space-y-3">
                  <Label className="font-semibold text-sm text-muted-foreground">Date</Label>
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

                 {/* Location Filter */}
                 <div className="space-y-4">
                   <Label className="font-semibold text-sm text-muted-foreground">Location</Label>
                   <Input
                     placeholder="Search by location..."
                     value={location}
                     onChange={(e) => setLocation(e.target.value)}
                   />
                 </div>

                 <Separator className="my-6" />

                 {/* Categories Filter */}
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

                                 {/* Clear Filters Button - Animated when filters are active */}
                 {hasActiveFilters && (
                   <div className="pt-4">
                     <Button 
                       onClick={clearFilters} 
                       variant="outline" 
                       className="w-full transition-all duration-200 ease-in-out animate-in slide-in-from-top-2"
                     >
                       Clear Filters
                     </Button>
                   </div>
                 )}
               </CardContent>
            </Card>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
                <EventCardSkeleton />
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? "Try adjusting your filters or search terms"
                    : "No events are currently available"
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
