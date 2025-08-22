"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { fetchEvents, Event } from "@/lib/event-query";
import EventCard from "@/components/event/EventCard";
import EventCardSkeleton from "@/components/event/EventCardSkeleton";
import FeedFilters, { FeedFilters as FeedFiltersType } from "@/components/feed/FeedFilters";

export default function EventsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Filter state
  const [filters, setFilters] = useState<FeedFiltersType>({
    status: searchParams.get('status') || 'ALL',
    dateRange: searchParams.get('dateRange') || 'ALL',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters, searchTerm]);

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

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'ALL') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const thisWeek = new Date(today);
      thisWeek.setDate(thisWeek.getDate() + 7);
      
      const thisMonth = new Date(today);
      thisMonth.setMonth(thisMonth.getMonth() + 1);

      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startTime);
        
        switch (filters.dateRange) {
          case 'TODAY':
            return eventDate.toDateString() === today.toDateString();
          case 'TOMORROW':
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'THIS_WEEK':
            return eventDate >= today && eventDate <= thisWeek;
          case 'THIS_MONTH':
            return eventDate >= today && eventDate <= thisMonth;
          case 'UPCOMING':
            return eventDate >= today;
          default:
            return true;
        }
      });
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(event => {
        if (!event.categories_on_events) return false;
        return event.categories_on_events.some(cat => 
          cat.categories?.name?.toLowerCase().includes(filters.category.toLowerCase())
        );
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(event => {
        if (!event.venues) return false;
        
        // Handle both array and single object cases
        const venues = Array.isArray(event.venues) ? event.venues : [event.venues];
        return venues.some((venue) => 
          venue.name?.toLowerCase().includes(filters.location.toLowerCase()) ||
          venue.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
          venue.province?.toLowerCase().includes(filters.location.toLowerCase()) ||
          venue.postalCode?.toLowerCase().includes(filters.location.toLowerCase()) ||
          venue.country?.toLowerCase().includes(filters.location.toLowerCase())
        );
      });
    }

    setFilteredEvents(filtered);
  };





  const clearFilters = () => {
    setFilters({
      status: 'ALL',
      dateRange: 'ALL',
      category: '',
      location: ''
    });
    setSearchTerm('');
    router.push('/events');
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'ALL') || searchTerm;

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
          {/* Enhanced Filters Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <FeedFilters onFiltersChange={setFilters} />
            </div>
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
