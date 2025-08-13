import { Skeleton } from "@/components/ui/skeleton";

export const EventCardSkeleton = () => {
	return (
		<div className="flex flex-col space-y-3 rounded-lg bg-white p-4 shadow-sm">
			{/* Image Placeholder */}
			<Skeleton className="h-40 w-full rounded-lg" />
			<div className="space-y-2">
				{/* Text Placeholders */}
				<Skeleton className="h-6 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
				<Skeleton className="h-4 w-1/4" />
			</div>
		</div>
	);
};