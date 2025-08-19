"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DashboardEventCard, { DashboardEventCardData } from "@/components/event/DashboardEventCard";
import { Button } from "@/components/ui/button";
import { useCreateEventModal } from "@/components/event/CreateEventModalContext";
import EventsPageSkeleton from "@/components/event/EventsPageSkeleton";

// Use the imported DashboardEventCardData type
type FetchedEvent = DashboardEventCardData;

export default function EventsPage() {
	const [events, setEvents] = useState<FetchedEvent[] | null>(null);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const { openModal } = useCreateEventModal();

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
					),
					categories_on_events (
						categories (
							id,
							name
						)
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
		<div className="space-y-6 p-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Events</h1>
					<p className="text-muted-foreground">
						Create and manage your organization&apos;s events.
					</p>
				</div>
				<Button onClick={openModal} className="flex items-center gap-2">
					<Plus className="h-4 w-4" />
					Create Event
				</Button>
			</div>

			{/* Events Section */}
			<div className="space-y-4">
				{/* Events Grid */}
				{isLoadingEvents ? (
					<EventsPageSkeleton />
				) : events === null ? (
					<EventsPageSkeleton />
				) : events.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
						<p>No events created yet</p>
						<p className="text-sm">Create your first event to get started!</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{events.map((event) => (
							<DashboardEventCard 
								key={event.id} 
								event={event} 
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
