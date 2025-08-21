"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatusDisplay } from "./EventStatusDisplay";
import EventEditModal from "./EventEditModal";

interface ExtendedEventViewProps {
  event: any;
}

export function ExtendedEventView({ event }: ExtendedEventViewProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEventUpdated = () => {
    // Refresh the event data or redirect
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Status Display Section */}
      <EventStatusDisplay 
        event={event} 
        onEditClick={handleEditClick}
      />

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold">{event.title}</h3>
            <p className="text-muted-foreground mt-2">{event.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Date & Time</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(event.startTime).toLocaleDateString()} at{' '}
                {new Date(event.startTime).toLocaleTimeString()}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Venue</h4>
              <p className="text-sm text-muted-foreground">
                {event.venues?.[0]?.name}, {event.venues?.[0]?.city}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <EventEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        event={event}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}
