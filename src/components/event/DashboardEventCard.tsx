import { MapPin, Clock, Users, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

// Default placeholder image for events without custom images
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

export type DashboardEventCardData = {
	id: string | number;
	title?: string;
	description?: string;
	imageUrl?: string | null;
	startTime?: string;
	endTime?: string;
	status?: string;
	createdAt?: string;
	venues?: {
		name: string;
		city: string;
		province: string;
	}[] | null;
	ticket_types?: Array<{
		name: string;
		price: number;
	}> | null;
	categories_on_events?: Array<{
		categories: {
			id: string;
			name: string;
		};
	}> | null;
};

interface DashboardEventCardProps {
	event: DashboardEventCardData;
	onEdit?: (eventId: string | number) => void;
	onDelete?: (eventId: string | number) => void;
}

export default function DashboardEventCard({ event, onEdit, onDelete }: DashboardEventCardProps) {
	if (!event) {
		console.warn('DashboardEventCard received undefined/null event');
		return null;
	}

	const title = event.title || 'Event';
	const description = event.description || 'No description available';
	const imageUrl = event.imageUrl;
	
	// Use custom image if available, otherwise use default
	const displayImageUrl = imageUrl || DEFAULT_EVENT_IMAGE;

	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch (error) {
			console.warn('Invalid date string:', dateString);
			return 'Date TBA';
		}
	};

	const formatTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		} catch (error) {
			return 'Time TBA';
		}
	};

	const getMinTicketPrice = () => {
		if (!event.ticket_types || event.ticket_types.length === 0) return null;
		try {
			const prices = event.ticket_types.map(t => t.price).filter(p => typeof p === 'number' && !isNaN(p));
			return prices.length > 0 ? Math.min(...prices) : null;
		} catch (error) {
			console.warn('Error calculating ticket price:', error);
			return null;
		}
	};

	const minTicketPrice = getMinTicketPrice();
	
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'PUBLISHED':
				return 'bg-green-50 text-green-700 border-green-200';
			case 'DRAFT':
				return 'bg-amber-50 text-amber-700 border-amber-200';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-200';
		}
	};

	return (
		<Card className="font-roboto border-muted bg-background hover:shadow-md transition-all duration-200 group">
			<CardContent className="px-6">
				{/* Banner Image */}
				<div className="relative h-44 w-full overflow-hidden rounded-lg mb-3">
					<Image 
						src={displayImageUrl} 
						alt={title}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						onError={(e) => {
							console.warn('Failed to load image:', displayImageUrl);
						}}
					/>
					<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
					
					{/* Status Badge Overlay */}
					{event.status && (
						<div className="absolute top-3 right-3">
							<Badge 
								variant="outline" 
								className={`${getStatusColor(event.status)} text-xs font-medium backdrop-blur-sm bg-white/90`}
							>
								{event.status}
							</Badge>
						</div>
					)}
				</div>
				{/* Header with Title */}
				<div className="mb-2">
					<h3 className="text-xl font-bold text-foreground truncate">
						{title}
					</h3>
					<p className="text-muted-foreground text-sm mt-1 line-clamp-2">
						{description}
					</p>
				</div>

				{/* Categories */}
				{event.categories_on_events && event.categories_on_events.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-3">
						{event.categories_on_events.map((catRelation) => (
							<Badge 
								key={catRelation.categories.id} 
								variant="outline" 
								className="text-xs px-2 py-1"
							>
								{catRelation.categories.name}
							</Badge>
						))}
					</div>
				)}

				{/* Event Info */}
				<div>
					{/* Event Info Row */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground mb-[-3 ]">
						<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
							{/* Date & Time */}
							{event.startTime && (
								<div className="flex items-center gap-2">
									<Clock className="w-4 h-4 text-primary" />
									<span className="font-medium text-foreground">
										{formatDate(event.startTime)} at {formatTime(event.startTime)}
									</span>
								</div>
							)}
							
							{/* Venue */}
							{event.venues && event.venues.length > 0 && event.venues[0]?.city && (
								<div className="flex items-center gap-2">
									<MapPin className="w-4 h-4 text-blue-600" />
									<span className="font-medium text-foreground">{event.venues[0].city}</span>
								</div>
							)}
							
							{/* Ticket Price */}
							{minTicketPrice !== null && (
								<div className="flex items-center gap-2">
									<Users className="w-4 h-4 text-green-600" />
									<span className="font-medium text-foreground">From ${minTicketPrice}</span>
								</div>
							)}
						</div>

						{/* View Details Button - Hidden on mobile, shown on sm+ */}
						<Button 
							variant="default" 
							size="sm" 
							asChild
							className="hidden sm:flex items-center gap-2 text-xs h-8 flex-shrink-0"
						>
							<Link href={`/dashboard/events/${event.id}`}>
								<Eye className="h-3 w-3" />
								View Details
							</Link>
						</Button>
					</div>

					{/* Mobile View Details Button - Only shown on mobile */}
					<div className="sm:hidden">
						<Button 
							variant="default" 
							size="sm" 
							asChild
							className="w-full flex items-center justify-center gap-2 text-xs"
						>
							<Link href={`/dashboard/events/${event.id}`}>
								<Eye className="h-3 w-3" />
								View Details
							</Link>
						</Button>
					</div>
				</div>


			</CardContent>
		</Card>
	);
}
