"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, QrCode, Download } from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
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
    qrCodeValue: string;
    status: string;
    ticketType: {
      name: string;
      price: number;
    };
  }>;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please log in to view your bookings');
          return;
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
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
              qrCodeValue,
              status,
              ticketType:ticket_types(
                name,
                price
              )
            )
          `)
          .eq('userId', user.id)
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
  }, []);

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
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">View and manage your event registrations</p>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">You haven't registered for any events yet.</p>
              <Button asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{booking.event.title}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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

                  {/* Booking Details */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Paid:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₱{booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Booked on {formatDate(booking.createdAt)}
                    </div>
                  </div>

                  {/* Tickets */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Your Tickets ({booking.tickets.length})</h4>
                    <div className="space-y-2">
                      {booking.tickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <QrCode className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{ticket.ticketType.name}</p>
                              <p className="text-sm text-gray-600">
                                ₱{ticket.ticketType.price} • {ticket.status}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4 flex justify-end space-x-3">
                    <Button variant="outline" asChild>
                      <Link href={`/event/${booking.event.id}`}>
                        View Event
                      </Link>
                    </Button>
                    {booking.status === 'pending' && (
                      <Button variant="outline">
                        Upload Payment Proof
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

