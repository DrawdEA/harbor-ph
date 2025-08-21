import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EventStatusBadge from "./EventStatusBadge";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EventStatusManagerProps {
  event: any;
  onStatusChange: (newStatus: string) => void;
}

export function EventStatusManager({ event, onStatusChange }: EventStatusManagerProps) {
  const [isChanging, setIsChanging] = useState(false);
  
  const getAvailableTransitions = (currentStatus: string) => {
    const transitions = {
      'DRAFT': ['PUBLISHED', 'CANCELED'],
      'PUBLISHED': ['ACTIVE', 'DRAFT', 'CANCELED'],
      'ACTIVE': ['LIVE', 'COMPLETED', 'CANCELED'],
      'LIVE': ['COMPLETED', 'CANCELED'],
      'COMPLETED': [],
      'CANCELED': ['DRAFT']
    };
    
    return transitions[currentStatus as keyof typeof transitions] || [];
  };
  
  const handleStatusChange = async (newStatus: string) => {
    setIsChanging(true);
    try {
      const supabase = createClient();
      
      const response = await fetch(`/api/events/${event.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus })
      });
      
      if (response.ok) {
        onStatusChange(newStatus);
      } else {
        const error = await response.json();
        console.error('Failed to update status:', error);
        alert(`Failed to update status: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status. Please try again.');
    } finally {
      setIsChanging(false);
    }
  };
  
  const availableTransitions = getAvailableTransitions(event.status);
  
  return (
    <div className="flex items-center gap-2">
      <EventStatusBadge status={event.status} />
      
      {availableTransitions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isChanging}>
              {isChanging ? 'Changing...' : 'Change Status'}
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {availableTransitions.map(status => (
              <DropdownMenuItem 
                key={status}
                onClick={() => handleStatusChange(status)}
                className="cursor-pointer"
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
