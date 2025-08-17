"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DashboardEventCard, { DashboardEventCardData } from "@/components/event/DashboardEventCard";
import CreateEventModal from "@/components/event/CreateEventModal";

// Use the imported DashboardEventCardData type
type FetchedEvent = DashboardEventCardData;

export default function EventsPage() {
	const [events, setEvents] = useState<FetchedEvent[]>([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);

	// Function to fetch events
	const fetchEvents = async () => {
		setIsLoadingEvents(true);
		try {
			const supabase = createClient();
			const { data: { user } } = await supabase.auth.getUser();
			
			if (!user) return;

			// Get organization profile
			const { data: orgProfile } = await supabase
				.from('organization_profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (!orgProfile) return;

			// Fetch events for this organization
			const { data: eventsData, error } = await supabase
				.from('events')
				.select(`
					id,
					title,
					description,
					imageUrl,
					startTime,
					endTime,
					status,
					createdAt,
					venues (
						name,
						city,
						province
					),
					ticket_types (
						name,
						price
					)
				`)
				.eq('organizerId', orgProfile.id)
				.order('createdAt', { ascending: false })
				.limit(5);

			if (error) {
				console.error('Error fetching events:', error);
				return;
			}

			setEvents(eventsData || []);
		} catch (error) {
			console.error('Error fetching events:', error);
		} finally {
			setIsLoadingEvents(false);
		}
	};

	// Fetch events on component mount
	useEffect(() => {
		fetchEvents();
	}, []);

	return (
		<div className="space-y-6 bg-muted/40 p-6 rounded-xl">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Events</h1>
					<p className="text-muted-foreground">
						Create and manage your organization&apos;s events.
					</p>
				</div>
				<CreateEventModal onEventCreated={fetchEvents} />
			</div>

			{/* Events List */}
			<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
				<CardHeader>
					<CardTitle>Your Events</CardTitle>
					<CardDescription>
						Manage and view all your organization&apos;s events.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoadingEvents ? (
						<div className="text-center py-8 text-muted-foreground">
							<Calendar className="mx-auto h-12 w-12 mb-2 opacity-50 animate-spin" />
							<p>Loading events...</p>
						</div>
					) : events.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
							<p>No events created yet</p>
							<p className="text-sm">Create your first event to get started!</p>
						</div>
					) : (
						<div className="space-y-4">
							{events.map((event) => (
								<DashboardEventCard 
									key={event.id} 
									event={event} 
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
