"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, QrCode, Ticket } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    imageUrl?: string;
    venues?: Array<{
      name: string;
      city: string;
    }>;
  };
  tickets: Array<{
    id: string;
    status: string;
    ticketType: {
      name: string;
    };
  }>;
}

interface ProfileBookingsProps {
  userId: string;
}

export default function ProfileBookings({ userId }: ProfileBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            createdAt,
            event:events(
              id,
              title,
              startTime,
              endTime,
              imageUrl,
              venues(
                name,
                city
              )
            ),
            tickets(
              id,
              status,
              ticketType:ticket_types(
                name
              )
            )
          `)
          .eq('userId', userId)
          .order('createdAt', { ascending: false });

        if (bookingsError) {
          throw new Error(bookingsError.message);
        }

        setBookings(bookingsData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AWAITING_VERIFICATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
        <div className="text-gray-500">Unable to load event registrations at this time</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
        <p className="text-gray-600 mt-1">Events this user has registered for</p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No event registrations yet</h3>
            <p className="text-gray-600">This user hasn't registered for any events yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{booking.event.title}</CardTitle>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(booking.event.startTime)} at {formatTime(booking.event.startTime)}
                    </span>
                  </div>
                  {booking.event.venues && booking.event.venues.length > 0 && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.event.venues[0].name}, {booking.event.venues[0].city}</span>
                    </div>
                  )}
                </div>

                {/* Tickets Summary */}
                <div className="pt-4">
                  <h4 className="font-medium mb-3">Tickets ({booking.tickets.length})</h4>
                  <div className="space-y-2">
                    {booking.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                        <QrCode className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{ticket.ticketType.name}</p>
                          <p className="text-sm text-gray-600">
                            Status: {ticket.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
