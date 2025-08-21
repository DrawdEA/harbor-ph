import { Badge } from "@/components/ui/badge";

interface EventStatusBadgeProps {
  status: string;
  className?: string;
}

export default function EventStatusBadge({ status, className = "" }: EventStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return {
          variant: 'secondary' as const,
          text: 'Draft',
          color: 'bg-gray-100 text-gray-800'
        };
      case 'PUBLISHED':
        return {
          variant: 'default' as const,
          text: 'Published',
          color: 'bg-blue-100 text-blue-800'
        };
      case 'ACTIVE':
        return {
          variant: 'default' as const,
          text: 'Active',
          color: 'bg-green-100 text-green-800'
        };
      case 'LIVE':
        return {
          variant: 'default' as const,
          text: 'Live',
          color: 'bg-orange-100 text-orange-800'
        };
      case 'COMPLETED':
        return {
          variant: 'secondary' as const,
          text: 'Completed',
          color: 'bg-purple-100 text-purple-800'
        };
      case 'CANCELED':
        return {
          variant: 'destructive' as const,
          text: 'Canceled',
          color: 'bg-red-100 text-red-800'
        };
      default:
        return {
          variant: 'secondary' as const,
          text: status,
          color: 'bg-gray-100 text-gray-800'
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
