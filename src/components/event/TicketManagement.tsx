"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Edit2, Save, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  salesStartDate?: string;
  salesEndDate?: string;
  eventId: string;
  updatedAt: string;
}

interface TicketManagementProps {
  eventId: string;
  onTicketsChange?: (hasTickets: boolean) => void;
}

export default function TicketManagement({ eventId, onTicketsChange }: TicketManagementProps) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [newTicket, setNewTicket] = useState({
    name: "",
    price: "",
    quantity: "",
    salesStartDate: new Date().toISOString().slice(0, 16),
    salesEndDate: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 16)
  });
  const [isAddingTicket, setIsAddingTicket] = useState(false);

  const supabase = createClient();

  // Fetch existing ticket types
  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  const fetchTicketTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('eventId', eventId)
        .order('createdAt', { ascending: true });

      if (error) throw error;
      
      setTicketTypes(data || []);
      onTicketsChange?.(data && data.length > 0);
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTicketType = async () => {
    console.log('addTicketType called with:', newTicket);
    console.log('eventId:', eventId);
    
    if (!newTicket.name || !newTicket.price || !newTicket.quantity || !newTicket.salesStartDate || !newTicket.salesEndDate) {
      console.log('Validation failed - missing fields');
      alert('Please fill in all required fields (Name, Price, Quantity, Sales Start Date, and Sales End Date)');
      return;
    }

    try {
      console.log('Starting ticket creation...');
      
      // Ensure we have valid dates - if not provided, use current date for start and end of year for end
      const salesStartDate = newTicket.salesStartDate || new Date().toISOString();
      const salesEndDate = newTicket.salesEndDate || new Date(new Date().getFullYear(), 11, 31).toISOString();
      
      console.log('Dates prepared:', { salesStartDate, salesEndDate });

      const insertData = {
        id: crypto.randomUUID(), // Generate a unique ID
        name: newTicket.name,
        price: parseFloat(newTicket.price),
        quantity: parseInt(newTicket.quantity),
        availableQuantity: parseInt(newTicket.quantity),
        eventId: eventId,
        salesStartDate: salesStartDate,
        salesEndDate: salesEndDate,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Inserting data:', insertData);

      const { data, error } = await supabase
        .from('ticket_types')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Ticket created successfully:', data);

      setTicketTypes([...ticketTypes, data]);
      setNewTicket({ 
        name: "", 
        price: "", 
        quantity: "", 
        salesStartDate: new Date().toISOString().slice(0, 16),
        salesEndDate: new Date(new Date().getFullYear(), 11, 31).toISOString().slice(0, 16)
      });
      setIsAddingTicket(false);
      onTicketsChange?.(true);
      
      console.log('State updated, form closed');
    } catch (error) {
      console.error('Error adding ticket type:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      alert(`Failed to add ticket type: ${error.message}`);
    }
  };

  const updateTicketType = async (ticketId: string, updates: Partial<TicketType>) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTicketTypes(ticketTypes.map(ticket => 
        ticket.id === ticketId ? { ...ticket, ...updates } : ticket
      ));
      setEditingTicket(null);
      
      // Notify parent component that tickets have changed
      onTicketsChange?.(true);
    } catch (error) {
      console.error('Error updating ticket type:', error);
      alert('Failed to update ticket type');
    }
  };

  const deleteTicketType = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;

    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      const updatedTickets = ticketTypes.filter(ticket => ticket.id !== ticketId);
      setTicketTypes(updatedTickets);
      onTicketsChange?.(updatedTickets.length > 0);
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      alert('Failed to delete ticket type');
    }
  };

  const startEditing = (ticket: TicketType) => {
    setEditingTicket(ticket.id);
  };

  const cancelEditing = () => {
    setEditingTicket(null);
  };

  const saveEditing = (ticket: TicketType) => {
    const updatedTicket = { ...ticket };
    updateTicketType(ticket.id, updatedTicket);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading tickets...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ticket Types</CardTitle>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsAddingTicket(true)}
            disabled={isAddingTicket}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Ticket Type
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Ticket Form */}
        {isAddingTicket && (
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">New Ticket Type</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingTicket(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">* Required fields</p>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm">Ticket Name *</Label>
                  <Input
                    placeholder="e.g., General Admission"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTicket.price}
                    onChange={(e) => setNewTicket({ ...newTicket, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm">Quantity *</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={newTicket.quantity}
                    onChange={(e) => setNewTicket({ ...newTicket, quantity: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm">Sales Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={newTicket.salesStartDate}
                    onChange={(e) => setNewTicket({ ...newTicket, salesStartDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm">Sales End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={newTicket.salesEndDate}
                    onChange={(e) => setNewTicket({ ...newTicket, salesEndDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
                             <div className="flex gap-2">
                 <Button 
                   onClick={() => {
                     console.log('Add Ticket button clicked!');
                     addTicketType();
                   }} 
                   size="sm"
                 >
                   <Save className="h-4 w-4 mr-2" />
                   Add Ticket
                 </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingTicket(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Tickets */}
        {ticketTypes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No ticket types configured yet.</p>
            <p className="text-sm">Add ticket types to allow event registration.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ticketTypes.map((ticket) => (
              <Card key={ticket.id} className="border">
                <CardContent className="p-4">
                  {editingTicket === ticket.id ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <Label className="text-sm">Ticket Name</Label>
                          <Input
                            value={ticket.name}
                            onChange={(e) => {
                              const updated = { ...ticket, name: e.target.value };
                              setTicketTypes(ticketTypes.map(t => t.id === ticket.id ? updated : t));
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => {
                              const updated = { ...ticket, price: parseFloat(e.target.value) || 0 };
                              setTicketTypes(ticketTypes.map(t => t.id === ticket.id ? updated : t));
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Quantity</Label>
                          <Input
                            type="number"
                            value={ticket.quantity}
                            onChange={(e) => {
                              const updated = { ...ticket, quantity: parseInt(e.target.value) || 0 };
                              setTicketTypes(ticketTypes.map(t => t.id === ticket.id ? updated : t));
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label className="text-sm">Sales Start Date</Label>
                          <Input
                            type="datetime-local"
                            value={ticket.salesStartDate ? new Date(ticket.salesStartDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const updated = { ...ticket, salesStartDate: e.target.value };
                              setTicketTypes(ticketTypes.map(t => t.id === ticket.id ? updated : t));
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Sales End Date</Label>
                          <Input
                            type="datetime-local"
                            value={ticket.salesEndDate ? new Date(ticket.salesEndDate).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                              const updated = { ...ticket, salesEndDate: e.target.value };
                              setTicketTypes(ticketTypes.map(t => t.id === ticket.id ? updated : t));
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEditing(ticket)}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-medium">{ticket.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ${ticket.price.toFixed(2)} • {ticket.availableQuantity}/{ticket.quantity} available
                            </p>
                          </div>
                          {(ticket.salesStartDate || ticket.salesEndDate) && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              {ticket.salesStartDate && (
                                <p>Sales Start: {new Date(ticket.salesStartDate).toLocaleDateString()}</p>
                              )}
                              {ticket.salesEndDate && (
                                <p>Sales End: {new Date(ticket.salesEndDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(ticket)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTicketType(ticket.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
