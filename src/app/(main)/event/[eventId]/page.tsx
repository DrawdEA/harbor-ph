"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Calendar, Share2, Bookmark, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { fetchEventById, Event } from "@/lib/event-query";
import Link from "next/link";
import { BackButton } from "@/components/ui/back-button";
import Image from "next/image";

export default function EventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.eventId as string;
	
	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isRegistering, setIsRegistering] = useState(false);

	useEffect(() => {
		const loadEvent = async () => {
			if (!eventId) return;
			
			try {
				setLoading(true);
				const eventData = await fetchEventById(eventId);
				setEvent(eventData);
			} catch (err) {
				console.error('Error loading event:', err);
				setError('Failed to load event details');
			} finally {
				setLoading(false);
			}
		};

		loadEvent();
	}, [eventId]);

	const handleRegister = async () => {
		if (!event) return;
		
		setIsRegistering(true);
		try {
			// TODO: Implement actual registration logic
			console.log('Registering for event:', event.id);
			
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			alert('Successfully registered for the event!');
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

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="h-96 bg-muted rounded"></div>
						<div className="space-y-4">
							<div className="h-4 bg-muted rounded w-3/4"></div>
							<div className="h-4 bg-muted rounded w-1/2"></div>
							<div className="h-4 bg-muted rounded w-2/3"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
					<p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
					<Button asChild>
						<Link href="/">Back to Feed</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background relative">
			{/* Back Button - hidden on mobile, visible on desktop */}
			<div className="hidden md:block">
				<BackButton />
			</div>
			
			{/* Event Content */}
			<div className="max-w-4xl mx-auto px-4 py-8">
				{/* Main Event Card */}
				<div className="bg-white rounded-lg shadow-sm border border-muted overflow-hidden">
					<div className="grid grid-cols-1 lg:grid-cols-2">
						{/* Event Image */}
						<div className="relative p-6">
							{event.imageUrl ? (
								<Image 
									src={event.imageUrl} 
									alt={event.title}
									className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
								/>
							) : (
								<div className="w-full h-96 lg:h-[500px] bg-muted rounded-lg flex items-center justify-center">
									<ImageIcon className="w-24 h-24 text-muted-foreground" />
								</div>
							)}
						</div>

						{/* Event Info */}
						<div className="p-6 space-y-6">
							<div>
								<h1 className="text-4xl font-bold text-gray-900 mb-3">
									{event.title}
								</h1>
								<p className="text-xl text-gray-600 leading-relaxed">
									{event.description}
								</p>
							</div>

							{/* Status Badge */}
							<div>
								<span className={`px-4 py-2 text-sm rounded-full font-medium ${
									event.status === 'PUBLISHED' 
										? 'bg-green-100 text-green-800' 
										: 'bg-yellow-100 text-yellow-800'
								}`}>
									{event.status}
								</span>
							</div>

							{/* Date & Time */}
							<div className="space-y-3">
								<div className="flex items-center space-x-3 text-gray-700">
									<Calendar className="h-6 w-6" />
									<div>
										<span className="font-medium">Date</span>
										<p className="text-lg">{formatDate(event.startTime)}</p>
									</div>
								</div>
								<div className="flex items-center space-x-3 text-gray-700">
									<Clock className="h-6 w-6" />
									<div>
										<span className="font-medium">Time</span>
										<p className="text-lg">
											{formatTime(event.startTime)} - {formatTime(event.endTime)}
										</p>
									</div>
								</div>
							</div>

							{/* Venue Information */}
							{event.venues && event.venues.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center space-x-3 text-gray-700">
										<MapPin className="h-6 w-6" />
										<div>
											<span className="font-medium">Venue</span>
											<p className="text-lg">{event.venues[0].name}</p>
											<p className="text-gray-600">
												{event.venues[0].city}, {event.venues[0].province}
												{event.venues[0].country && `, ${event.venues[0].country}`}
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Ticket Information */}
							{event.ticket_types && event.ticket_types.length > 0 && (
								<div className="space-y-3">
									<div className="flex items-center space-x-3 text-gray-700">
										<Users className="h-6 w-6" />
										<div className="flex-1">
											<span className="font-medium">Tickets Available</span>
											<div className="space-y-2 mt-2">
												{event.ticket_types.map((ticket, index) => (
													<div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
														<div>
															<p className="font-medium">{ticket.name}</p>
															<p className="text-sm text-gray-600">
																{ticket.availableQuantity} available
															</p>
														</div>
														<div className="text-right">
															<p className="text-2xl font-bold text-primary">
																${ticket.price}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="space-y-4 pt-6">
								<Button 
									onClick={handleRegister} 
									disabled={isRegistering}
									className="w-full bg-primary hover:bg-primary/90 text-white"
									size="lg"
								>
									{isRegistering ? 'Registering...' : 'Register for Event'}
								</Button>
								
								<div className="flex gap-3">
									<Button variant="outline" className="flex-1">
										<Share2 className="h-4 w-4 mr-2" />
										Share
									</Button>
									<Button variant="outline" className="flex-1">
										<Bookmark className="h-4 w-4 mr-2" />
										Save
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* About This Event Section */}
					<div className="px-6 py-6 border-t border-muted/50">
						<h2 className="text-2xl font-bold mb-4 text-gray-900">About This Event</h2>
						<p className="text-gray-600 leading-relaxed text-lg">
							{event.description}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
