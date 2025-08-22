"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Trophy, Star } from "lucide-react";

interface PastEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  venues?: Array<{
    name: string;
    city: string;
  }>;
  status: string;
  attendanceDate?: string;
  role?: string; // e.g., "Attendee", "Speaker", "Organizer"
  feedback?: {
    rating?: number;
    comment?: string;
  };
}

interface ProfileHistoryProps {
  userId: string;
}

export default function ProfileHistory({ userId }: ProfileHistoryProps) {
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        // Fetch past events the user has attended
        const { data: eventsData, error: eventsError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            event:events(
              id,
              title,
              description,
              startTime,
              endTime,
              imageUrl,
              venues(
                name,
                city
              )
            )
          `)
          .eq('userId', userId)
          .eq('status', 'CONFIRMED')
          .lt('event.startTime', new Date().toISOString())
          .order('event.startTime', { ascending: false });

        if (eventsError) {
          throw new Error(eventsError.message);
        }

        // Transform the data to match our interface
        const transformedEvents = eventsData?.map(booking => ({
          id: booking.event.id,
          title: booking.event.title,
          description: booking.event.description,
          startTime: booking.event.startTime,
          endTime: booking.event.endTime,
          imageUrl: booking.event.imageUrl,
          venues: booking.event.venues,
          status: booking.status,
          role: 'Attendee'
        })) || [];

        setPastEvents(transformedEvents);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch event history');
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (dateString: string) => {
    const eventDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - eventDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Unable to load event history at this time</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Event History</h2>
        <p className="text-gray-600 mt-1">Past events this user has attended</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{pastEvents.length}</div>
            <div className="text-sm text-gray-600">Events Attended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{pastEvents.length > 0 ? 'Active' : 'New'}</div>
            <div className="text-sm text-gray-600">Community Status</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{pastEvents.length > 5 ? 'Veteran' : 'Rising'}</div>
            <div className="text-sm text-gray-600">Experience Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Past Events List */}
      {pastEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events attended yet</h3>
            <p className="text-gray-600">This user hasn't attended any events yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pastEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {event.role}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {getTimeAgo(event.startTime)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(event.startTime)} at {formatTime(event.startTime)}
                    </span>
                  </div>
                  {event.venues && event.venues.length > 0 && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venues[0].name}, {event.venues[0].city}</span>
                    </div>
                  )}
                </div>

                {/* Event Description */}
                {event.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Attendance Badge */}
                <div className="flex items-center space-x-2 pt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Successfully attended</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
