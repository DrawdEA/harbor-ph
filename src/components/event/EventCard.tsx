import { MapPin, Clock, Users, Image as ImageIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type FeedEventCardData = {
	id: string | number;
	title?: string;
	description?: string;
	imageUrl?: string | null;
	imageSrc?: string; // For mock data
	imageAlt?: string; // For mock data
	startTime?: string;
	endTime?: string;
	status?: string;
	createdAt?: string;
	eventName?: string; // For mock data
	eventType?: string; // For mock data
	host?: string; // For mock data
	date?: string; // For mock data
	time?: string; // For mock data
	detailsUrl?: string; // For mock data
	isLive?: boolean; // For mock data
	venues?: {
		name: string;
		city: string;
		province: string;
	}[] | null;
	ticket_types?: Array<{
		name: string;
		price: number;
	}> | null;
};

interface FeedEventCardProps {
	event: FeedEventCardData;
}

export default function EventCard({ event }: FeedEventCardProps) {
	if (!event) {
		console.warn('EventCard received undefined/null event');
		return null;
	}

	const title = event.title || event.eventName || 'Event';
	const description = event.description || event.eventType || 'No description available';
	const imageUrl = event.imageUrl || event.imageSrc;
	const imageAlt = event.imageAlt || title;
	
	const hasRealData = event.startTime && event.endTime;
	const hasMockData = event.date && event.time;
	
	const formatDate = (dateString: string) => {
		try {
			return new Date(dateString).toLocaleDateString();
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
	
	return (
		<div className="flex flex-col space-y-3 rounded-lg bg-white p-4 shadow-sm">
			{/* Image */}
			{imageUrl ? (
				<img 
					src={imageUrl} 
					alt={imageAlt}
					className="h-40 w-full rounded-lg object-cover"
					onError={(e) => {
						console.warn('Failed to load image:', imageUrl);
					}}
				/>
			) : (
				<div className="h-40 w-full rounded-lg bg-muted flex items-center justify-center">
					<ImageIcon className="w-16 h-16 text-muted-foreground" />
				</div>
			)}
			
			<div className="space-y-2">
				{/* Event Title */}
				<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
				
				{/* Description */}
				<p className="text-sm text-gray-600 line-clamp-2">{description}</p>
				
				{/* Event Details */}
				<div className="flex items-center space-x-4 text-sm text-gray-500">
					{/* Date/Time - Handle both data structures */}
					<div className="flex items-center space-x-1">
						<Clock className="h-4 w-4" />
						<span>
							{hasRealData ? (
								`${formatDate(event.startTime!)} - ${formatDate(event.endTime!)}`
							) : hasMockData ? (
								`${event.date} - ${event.time}`
							) : (
								'Date TBA'
							)}
						</span>
					</div>
					
					{/* Venue - Only show for real data */}
					{event.venues && event.venues.length > 0 && event.venues[0]?.city && (
						<div className="flex items-center space-x-1">
							<MapPin className="h-4 w-4" />
							<span>{event.venues[0].city}</span>
						</div>
					)}
					
					{/* Host - Only show for mock data */}
					{event.host && (
						<div className="flex items-center space-x-1">
							<Users className="h-4 w-4" />
							<span>{event.host}</span>
						</div>
					)}
					
					{/* Ticket types - Only show for real data */}
					{minTicketPrice !== null && (
						<div className="flex items-center space-x-1">
							<Users className="h-4 w-4" />
							<span>From ${minTicketPrice}</span>
						</div>
					)}
				</div>
				
				{/* Status Badge and View Details Button */}
				<div className="flex justify-between items-center">
					{event.status ? (
						<span className={`px-2 py-1 text-xs rounded-full ${
							event.status === 'PUBLISHED' 
								? 'bg-green-100 text-green-800' 
								: 'bg-yellow-100 text-yellow-800'
						}`}>
							{event.status}
						</span>
					) : event.isLive !== undefined ? (
						<span className={`px-2 py-1 text-xs rounded-full ${
							event.isLive 
								? 'bg-green-100 text-green-800' 
								: 'bg-gray-100 text-gray-800'
						}`}>
							{event.isLive ? 'LIVE' : 'UPCOMING'}
						</span>
					) : null}

					{/* View Details Button - Navigate to event page */}
					<Button 
						variant="default" 
						size="sm" 
						asChild
						className="flex items-center gap-2 text-xs"
					>
						<Link href={`/event/${event.id}`}>
							<Calendar className="h-3 w-3" />
							View Details
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
