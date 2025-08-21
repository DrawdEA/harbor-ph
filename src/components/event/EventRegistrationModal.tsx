"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  salesStartDate?: string;
  salesEndDate?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  venues?: Array<{
    name: string;
    address: string;
    city: string;
    province: string;
    country: string;
  }>;
  ticket_types: TicketType[];
}

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

export default function EventRegistrationModal({ isOpen, onClose, event }: EventRegistrationModalProps) {
  const router = useRouter();
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback ticket data for testing if event doesn't have tickets
  const fallbackTickets = [
    {
      id: 'fallback-1',
      name: 'General Admission',
      price: 100,
      quantity: 100,
      availableQuantity: 100,
      salesStartDate: new Date().toISOString(),
      salesEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  // Use event tickets if available, otherwise use fallback
  const eventTickets = event.ticket_types && event.ticket_types.length > 0 
    ? event.ticket_types.map((ticket, index) => ({
        ...ticket,
        id: ticket.id || `ticket-${index + 1}`,
        name: ticket.name || `Ticket ${index + 1}`,
        price: ticket.price || 0,
        quantity: ticket.quantity || 100,
        availableQuantity: ticket.availableQuantity || 100
      }))
    : fallbackTickets;

  // Validate that we have proper ticket IDs
  const validTickets = eventTickets.filter(ticket => ticket.id && ticket.id !== '');
  
  if (validTickets.length === 0) {
    console.error('No valid tickets found:', eventTickets);
  }

  // Debug logging for ticket data
  console.log('Event tickets:', event.ticket_types);
  console.log('Fallback tickets:', fallbackTickets);
  console.log('Final eventTickets:', eventTickets);
  console.log('Valid tickets:', validTickets);
  console.log('Selected ticket type:', selectedTicketType);

  const selectedTicket = eventTickets.find(t => t.id === selectedTicketType);
  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

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

  const handleRegistration = async () => {
    if (!selectedTicketType || quantity < 1) {
      setError('Please select a ticket type and quantity');
      return;
    }

    // Validate that the selected ticket type exists and has a valid ID
    const selectedTicketData = validTickets.find(t => t.id === selectedTicketType);
    if (!selectedTicketData) {
      setError('Invalid ticket type selected. Please try again.');
      return;
    }

    if (!selectedTicketData.id || selectedTicketData.id === '') {
      setError('Ticket type has invalid ID. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Please log in to register for events');
      }

      // Check if user is already registered for this event
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('eventId', event.id)
        .eq('userId', user.id)
        .single();

      if (existingBooking) {
        throw new Error('You are already registered for this event');
      }

      // Calculate total price
      const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: crypto.randomUUID(),
          eventId: event.id,
          userId: user.id,
          totalPrice: totalPrice,
          status: 'PENDING', // Changed to valid enum value
          paymentMethod: 'GCASH_MANUAL', // Changed to valid enum value
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      // Create individual tickets
      const ticketsToCreate = [];
      for (let i = 0; i < quantity; i++) {
        ticketsToCreate.push({
          id: crypto.randomUUID(),
          bookingId: booking.id,
          ticketTypeId: selectedTicketType, // This should match the actual ticket type ID from database
          qrCodeValue: crypto.randomUUID(), // Generate unique QR code
          status: 'VALID', // Changed to valid enum value
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      console.log('Creating tickets with data:', ticketsToCreate);
      console.log('Selected ticket type ID:', selectedTicketType);
      console.log('Available ticket types:', eventTickets);

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsToCreate);

      if (ticketsError) {
        // Rollback booking if tickets creation fails
        await supabase.from('bookings').delete().eq('id', booking.id);
        throw new Error(`Failed to create tickets: ${ticketsError.message}`);
      }

      // Update ticket type availability
      const { error: updateError } = await supabase
        .from('ticket_types')
        .update({ 
          availableQuantity: (selectedTicket?.availableQuantity || 0) - quantity,
          updatedAt: new Date().toISOString()
        })
        .eq('id', selectedTicketType);

      if (updateError) {
        console.error('Failed to update ticket availability:', updateError);
      }

      // Success! Close modal and redirect to user's bookings
      onClose();
      router.push('/bookings');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error types
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.message?.includes('payment_options')) {
        errorMessage = 'Payment method not supported. Please try again.';
      } else if (err.message?.includes('already registered')) {
        errorMessage = 'You are already registered for this event.';
      } else if (err.message?.includes('log in')) {
        errorMessage = 'Please log in to register for events.';
      } else if (err.message?.includes('booking_status')) {
        errorMessage = 'Invalid booking status. Please try again.';
      } else if (err.message?.includes('ticket_status')) {
        errorMessage = 'Invalid ticket status. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Register for Event</span>
          </DialogTitle>
          <DialogDescription>
            Complete your registration for "{event.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
              </div>
              {event.venues && event.venues.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venues[0].name}, {event.venues[0].city}</span>
                </div>
              )}
              <p className="text-sm text-gray-600">{event.description}</p>
            </CardContent>
          </Card>

          {/* Ticket Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Select Tickets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eventTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No tickets available for this event.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="ticket-type">Ticket Type *</Label>
                    <select
                      id="ticket-type"
                      value={selectedTicketType}
                      onChange={(e) => {
                        console.log('Selected ticket type:', e.target.value);
                        setSelectedTicketType(e.target.value);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">-- Choose a ticket type --</option>
                      {validTickets.map((ticket) => (
                        <option key={ticket.id} value={ticket.id}>
                          {ticket.name} - ₱{ticket.price}
                        </option>
                      ))}
                    </select>
                    
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mt-2">
                      <p>Available tickets: {validTickets.length}</p>
                      <p>Selected: {selectedTicketType || 'None'}</p>
                      <p>Selected ticket: {selectedTicket ? `${selectedTicket.name} - ₱${selectedTicket.price}` : 'None'}</p>
                    </div>
                  </div>

                  {selectedTicket && (
                    <div className="space-y-3">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={selectedTicket.availableQuantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setQuantity(Math.min(selectedTicket.availableQuantity, quantity + 1))}
                          disabled={quantity >= selectedTicket.availableQuantity}
                        >
                          +
                        </Button>
                        <span className="text-sm text-gray-600">
                          {selectedTicket.availableQuantity} available
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  {selectedTicket && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">₱{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleRegistration} 
              disabled={!selectedTicketType || quantity < 1 || isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Registering...' : 'Complete Registration'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
