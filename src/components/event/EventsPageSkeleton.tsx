import { Skeleton } from "@/components/ui/skeleton";

export default function EventsPageSkeleton() {
  // Create an array of 6 skeleton items to show a realistic loading state
  const skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {skeletonItems.map((item) => (
        <div key={item} className="border rounded-lg p-4 space-y-4">
          {/* Event Image Skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />
          
          {/* Event Content Skeleton */}
          <div className="space-y-3">
            {/* Title Skeleton */}
            <Skeleton className="h-6 w-3/4" />
            
            {/* Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            {/* Simple Event Details Skeleton */}
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
