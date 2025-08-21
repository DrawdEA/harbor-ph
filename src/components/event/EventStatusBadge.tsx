import { Badge } from "@/components/ui/badge";

interface EventStatusBadgeProps {
  status: string;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return { 
          variant: 'secondary' as const, 
          text: 'Draft', 
          color: 'bg-gray-100 text-gray-800 border-gray-200' 
        };
      case 'PUBLISHED':
        return { 
          variant: 'outline' as const, 
          text: 'Published', 
          color: 'bg-blue-50 text-blue-700 border-blue-200' 
        };
      case 'ACTIVE':
        return { 
          variant: 'default' as const, 
          text: 'Active', 
          color: 'bg-green-100 text-green-800 border-green-200' 
        };
      case 'LIVE':
        return { 
          variant: 'destructive' as const, 
          text: 'LIVE NOW', 
          color: 'bg-red-100 text-red-800 border-red-200 animate-pulse' 
        };
      case 'COMPLETED':
        return { 
          variant: 'secondary' as const, 
          text: 'Completed', 
          color: 'bg-purple-100 text-purple-800 border-purple-200' 
        };
      case 'CANCELED':
        return { 
          variant: 'destructive' as const, 
          text: 'Canceled', 
          color: 'bg-red-100 text-red-800 border-red-200' 
        };
      default:
        return { 
          variant: 'secondary' as const, 
          text: status, 
          color: 'bg-gray-100 text-gray-800 border-gray-200' 
        };
    }
  };
  
  const config = getStatusConfig(status);
  
  return (
    <Badge 
      variant={config.variant} 
      className={`${config.color} ${className}`}
    >
      {config.text}
    </Badge>
  );
}
