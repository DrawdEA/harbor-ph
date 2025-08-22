import { Badge } from "@/components/ui/badge";
import { Clock, Radio, CheckCircle, FileText, Eye, XCircle } from "lucide-react";

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
          color: 'bg-gray-100 text-gray-800',
          icon: FileText
        };
      case 'PUBLISHED':
        return {
          variant: 'default' as const,
          text: 'Published',
          color: 'bg-blue-100 text-blue-800',
          icon: Eye
        };
      case 'ACTIVE':
        return {
          variant: 'default' as const,
          text: 'COMING SOON',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: Clock
        };
      case 'LIVE':
        return {
          variant: 'default' as const,
          text: 'LIVE',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: Radio
        };
      case 'COMPLETED':
        return {
          variant: 'secondary' as const,
          text: 'FINISHED',
          color: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: CheckCircle
        };
      case 'CANCELED':
        return {
          variant: 'destructive' as const,
          text: 'Canceled',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      default:
        return {
          variant: 'secondary' as const,
          text: status,
          color: 'bg-gray-100 text-gray-800',
          icon: FileText
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.color} font-raleway font-bold flex items-center gap-1.5 ${className}`}
    >
      <IconComponent className="h-3.5 w-3.5" />
      {config.text}
    </Badge>
  );
}
