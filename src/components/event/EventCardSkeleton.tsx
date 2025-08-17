export default function EventCardSkeleton() {
	return (
		<div className="flex flex-col space-y-3 rounded-lg bg-white p-4 shadow-sm animate-pulse">
			{/* Image Skeleton */}
			<div className="h-40 w-full rounded-lg bg-muted"></div>
			
			<div className="space-y-2">
				{/* Event Title Skeleton */}
				<div className="h-6 bg-muted rounded w-3/4"></div>
				
				{/* Description Skeleton */}
				<div className="space-y-1">
					<div className="h-4 bg-muted rounded w-full"></div>
					<div className="h-4 bg-muted rounded w-2/3"></div>
				</div>
				
				{/* Event Details Skeleton */}
				<div className="flex items-center space-x-4 pt-2">
					{/* Date/Time skeleton */}
					<div className="flex items-center space-x-1">
						<div className="h-4 w-4 bg-muted rounded"></div>
						<div className="h-4 bg-muted rounded w-24"></div>
					</div>
					
					{/* Venue skeleton */}
					<div className="flex items-center space-x-1">
						<div className="h-4 w-4 bg-muted rounded"></div>
						<div className="h-4 bg-muted rounded w-16"></div>
					</div>
					
					{/* Price skeleton */}
					<div className="flex items-center space-x-1">
						<div className="h-4 w-4 bg-muted rounded"></div>
						<div className="h-4 bg-muted rounded w-12"></div>
					</div>
				</div>
				
				{/* Status Badge and Button Skeleton */}
				<div className="flex justify-between items-center pt-2">
					{/* Status badge skeleton */}
					<div className="h-6 bg-muted rounded-full w-16"></div>
					
					{/* View Details Button skeleton */}
					<div className="h-8 bg-muted rounded w-24"></div>
				</div>
			</div>
		</div>
	);
}