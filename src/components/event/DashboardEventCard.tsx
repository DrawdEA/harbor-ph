import { useState } from "react";
import { MapPin, Clock, Users, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

// Type for dashboard event data
export type DashboardEventCardData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  venues: {
    name: string;
    city: string;
    province: string;
  }[] | null;
  ticket_types: Array<{
    name: string;
    price: number;
  }> | null;
};

interface DashboardEventCardProps {
  event: DashboardEventCardData;
  onEventUpdate?: () => void; // Callback to refresh events after update
}

export default function DashboardEventCard({ event, onEventUpdate }: DashboardEventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    imageUrl: event.imageUrl || '',
    startTime: event.startTime.slice(0, 16), // Format for datetime-local input
    endTime: event.endTime.slice(0, 16),
    status: event.status
  });

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      title: event.title,
      description: event.description,
      imageUrl: event.imageUrl || '',
      startTime: event.startTime.slice(0, 16),
      endTime: event.endTime.slice(0, 16),
      status: event.status
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          status: formData.status,
          updatedAt: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) throw error;

      setIsEditing(false);
      onEventUpdate?.(); // Refresh events
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Failed to update event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', event.id);

      if (error) throw error;

      setIsModalOpen(false);
      onEventUpdate?.(); // Refresh events
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div 
        className="flex flex-col space-y-3 rounded-lg bg-white p-4 shadow-sm cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        {event.imageUrl ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="h-40 w-full rounded-lg object-cover"
          />
        ) : (
          <div className="h-40 w-full rounded-lg bg-muted flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-muted-foreground" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              event.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(event.startTime).toLocaleDateString()} - {new Date(event.endTime).toLocaleDateString()}
              </span>
            </div>
            
            {event.venues && event.venues.length > 0 && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.venues[0].name}, {event.venues[0].city}
                </span>
              </div>
            )}
            
            {event.ticket_types && event.ticket_types.length > 0 && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>
                  {event.ticket_types.length} ticket type{event.ticket_types.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Event' : event.title}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {isEditing ? (
                // Edit Form
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 w-full p-2 border rounded-md"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  {event.imageUrl ? (
                    <img 
                      src={event.imageUrl} 
                      alt={event.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-muted-foreground mt-1">{event.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Start:</span>
                      <p className="text-muted-foreground">
                        {new Date(event.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">End:</span>
                      <p className="text-muted-foreground">
                        {new Date(event.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {event.venues && event.venues.length > 0 && (
                    <div>
                      <span className="font-medium">Venue:</span>
                      <p className="text-muted-foreground">
                        {event.venues[0].name}, {event.venues[0].city}, {event.venues[0].province}
                      </p>
                    </div>
                  )}
                  {event.ticket_types && event.ticket_types.length > 0 && (
                    <div>
                      <span className="font-medium">Ticket Types:</span>
                      <div className="mt-1 space-y-1">
                        {event.ticket_types.map((ticket, index) => (
                          <p key={index} className="text-muted-foreground">
                            {ticket.name} - ${ticket.price}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={isLoading} className="flex-1">
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={handleEdit} className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isLoading ? 'Deleting...' : 'Delete Event'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
