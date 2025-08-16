// src/app/page.tsx

"use client";

import React, { useRef, useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import EventCard from "@/components/event/EventCard";
import { fetchEvents } from "@/lib/event-query";
import { EventCardSkeleton } from "@/components/event/EventCardSkeleton";
import { FeedEventCardData } from "@/components/event/EventCard";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Calendar, Share2, Bookmark, Image as ImageIcon } from "lucide-react";

export default function Feed() {
	const [expandedEvent, setExpandedEvent] = useState<FeedEventCardData | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);

	const {
		data,
		error,
		status,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ["events"],
		queryFn: fetchEvents,
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});

	const observerRef = useRef<HTMLDivElement>(null);

	// The Intersection Observer logic remains exactly the same.
	useEffect(() => {
		if (!hasNextPage || !observerRef.current) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				fetchNextPage();
			}
		});

		observer.observe(observerRef.current);
		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [hasNextPage, fetchNextPage]);

	const handleExpandEvent = (event: FeedEventCardData) => {
		setExpandedEvent(event);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setExpandedEvent(null);
	};

	const handleRegister = async () => {
		if (!expandedEvent) return;
		
		setIsRegistering(true);
		try {
			// TODO: Implement actual registration logic
			console.log('Registering for event:', expandedEvent.id);
			
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			alert('Successfully registered for the event!');
			closeModal();
		} catch (error) {
			console.error('Registration failed:', error);
			alert('Registration failed. Please try again.');
		} finally {
			setIsRegistering(false);
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (error) {
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

	return (
		<>
			<div className="mx-auto max-w-3xl">
				<div className="grid grid-cols-1 gap-4 sm:gap-6">
					{status === "pending" ? (
						// Show ShadCN skeletons on initial load
						<>
							<EventCardSkeleton />
							<EventCardSkeleton />
							<EventCardSkeleton />
						</>
					) : status === "error" ? (
						<p className="col-span-full text-center text-primary">Error: {error.message}</p>
					) : (
						// Render the loaded pages
						data.pages.map((page, i) => (
							<React.Fragment key={i}>
								{page.events && page.events.length > 0 ? (
									page.events.map((event) => (
										<EventCard 
											key={event.id} 
											event={event} 
											onExpand={handleExpandEvent}
										/>
									))
								) : (
									<p className="col-span-full text-center text-gray-500 py-8">
										No events found. Create the first event at Harbor!
									</p>
								)}
							</React.Fragment>
						))
					)}

					{/* Show ShadCN skeletons while the *next* page is fetching */}
					{isFetchingNextPage && (
						<>
							<EventCardSkeleton />
							<EventCardSkeleton />
							<EventCardSkeleton />
						</>
					)}
				</div>

				{/* The invisible trigger element (no changes here) */}
				<div ref={observerRef} style={{ height: "1px" }}></div>

				{/* End of content message (no changes here) */}
				{!hasNextPage && status === "success" && (
					<p className="mt-8 text-center text-gray-500">
						You&apos;ve reached the last event! Host yours at Harbor.
					</p>
				)}
			</div>

			{/* Expanded Event Modal */}
			{isModalOpen && expandedEvent && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between p-6 border-b">
							<h2 className="text-2xl font-semibold">Event Details</h2>
							<button
								onClick={closeModal}
								className="text-gray-400 hover:text-gray-600 transition-colors"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						<div className="p-6 space-y-6">
							{/* Event Header with Image */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Event Image */}
								<div className="relative">
									{expandedEvent.imageUrl ? (
										<img 
											src={expandedEvent.imageUrl} 
											alt={expandedEvent.title || expandedEvent.eventName}
											className="w-full h-64 lg:h-80 object-cover rounded-lg"
										/>
									) : (
										<div className="w-full h-64 lg:h-80 bg-muted rounded-lg flex items-center justify-center">
											<ImageIcon className="w-24 h-24 text-muted-foreground" />
										</div>
									)}
								</div>

								{/* Event Info */}
								<div className="space-y-4">
									<div>
										<h3 className="text-3xl font-bold text-gray-900 mb-2">
											{expandedEvent.title || expandedEvent.eventName}
										</h3>
										<p className="text-lg text-gray-600">
											{expandedEvent.description || expandedEvent.eventType}
										</p>
									</div>

									{/* Status Badge */}
									<div>
										<span className={`px-3 py-1 text-sm rounded-full font-medium ${
											expandedEvent.status === 'PUBLISHED' 
												? 'bg-green-100 text-green-800' 
												: expandedEvent.status === 'DRAFT'
												? 'bg-yellow-100 text-yellow-800'
												: expandedEvent.isLive 
												? 'bg-green-100 text-green-800' 
												: 'bg-gray-100 text-gray-800'
										}`}>
											{expandedEvent.status || (expandedEvent.isLive ? 'LIVE' : 'UPCOMING')}
										</span>
									</div>

									{/* Date & Time */}
									<div className="space-y-2">
										<div className="flex items-center space-x-2 text-gray-700">
											<Calendar className="h-5 w-5" />
											<span className="font-medium">
												{expandedEvent.startTime ? formatDate(expandedEvent.startTime) : 'Date TBA'}
											</span>
										</div>
										<div className="flex items-center space-x-2 text-gray-700">
											<Clock className="h-5 w-5" />
											<span>
												{expandedEvent.startTime && expandedEvent.endTime 
													? `${formatTime(expandedEvent.startTime)} - ${formatTime(expandedEvent.endTime)}`
													: 'Time TBA'
												}
											</span>
										</div>
									</div>

									{/* Venue Information */}
									{expandedEvent.venues && expandedEvent.venues.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center space-x-2 text-gray-700">
												<MapPin className="h-5 w-5" />
												<div>
													<p className="font-medium">{expandedEvent.venues[0].name}</p>
													<p className="text-sm text-gray-600">
														{expandedEvent.venues[0].city}, {expandedEvent.venues[0].province}
													</p>
												</div>
											</div>
										</div>
									)}

									{/* Ticket Information */}
									{expandedEvent.ticket_types && expandedEvent.ticket_types.length > 0 && (
										<div className="space-y-2">
											<div className="flex items-center space-x-2 text-gray-700">
												<Users className="h-5 w-5" />
												<div>
													<p className="font-medium">Tickets Available</p>
													<div className="space-y-1">
														{expandedEvent.ticket_types.map((ticket, index) => (
															<div key={index} className="text-sm text-gray-600">
																{ticket.name}: ${ticket.price} ({ticket.availableQuantity} available)
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
								<Button 
									onClick={handleRegister} 
									disabled={isRegistering}
									className="flex-1 bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									{isRegistering ? 'Registering...' : 'Register for Event'}
								</Button>
								
								<div className="flex gap-2">
									<Button variant="outline" size="lg">
										<Share2 className="h-4 w-4 mr-2" />
										Share
									</Button>
									<Button variant="outline" size="lg">
										<Bookmark className="h-4 w-4 mr-2" />
										Save
									</Button>
								</div>
							</div>

							{/* Additional Details */}
							<div className="pt-6 border-t">
								<h4 className="text-lg font-semibold mb-3">About This Event</h4>
								<p className="text-gray-600 leading-relaxed">
									{expandedEvent.description || expandedEvent.eventType || 'No detailed description available.'}
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}