import { Button } from "@/components/ui/button";
import EventStatusBadge from "./EventStatusBadge";
import { Edit } from "lucide-react";

interface EventStatusDisplayProps {
  event: any;
  onEditClick: () => void;
}

export default function EventStatusDisplay({ event, onEditClick }: EventStatusDisplayProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <EventStatusBadge status={event.status} />
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onEditClick}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Edit Event
      </Button>
    </div>
  );
}
