import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  categoryName: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export default function CategoryBadge({ 
  categoryName, 
  variant = "secondary",
  className = ""
}: CategoryBadgeProps) {
  return (
    <Badge 
      variant={variant} 
      className={`text-xs ${className}`}
    >
      {categoryName}
    </Badge>
  );
}
