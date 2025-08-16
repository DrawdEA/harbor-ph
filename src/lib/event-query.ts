import { createClient } from "@/lib/supabase/client";

// Define the shape of a single event from the database
export interface Event {
	id: string;
	title: string;
	description: string;
	imageUrl: string | null;
	startTime: string;
	endTime: string;
	status: string;
	createdAt: string;
	organizerId: string;
	venueId: string;
	venues: {
		name: string;
		city: string;
		province: string;
		country: string;
	} | null;
	ticket_types: Array<{
		name: string;
		price: number;
		quantity: number;
		availableQuantity: number;
	}> | null;
}

// This function fetches real events from Supabase
export const fetchEvents = async ({ pageParam = 0 }: { pageParam?: number }) => {
	console.log(`Fetching events starting from index: ${pageParam}`);

	try {
		const supabase = createClient();
		
		// Simulate a network delay (optional - remove in production)
		// await new Promise((resolve) => setTimeout(resolve, 1000));

		const pageSize = 6; // Return 6 events per "page"
		const start = pageParam;
		
		// Fetch events with venue and ticket information
		// Temporarily removing filters for testing - will add back once we confirm data structure
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
				organizerId,
				venueId,
				venues (
					name,
					city,
					province,
					country
				),
				ticket_types (
					name,
					price,
					quantity,
					availableQuantity
				)
			`)
			// .eq('status', 'PUBLISHED') // Temporarily commented out for testing
			// .gte('endTime', new Date().toISOString()) // Temporarily commented out for testing
			.order('createdAt', { ascending: false }) // Order by creation date for now
			.range(start, start + pageSize - 1);

		if (error) {
			console.error('Error fetching events:', error);
			throw error;
		}

		// Debug: Log the raw data structure
		console.log('Raw events data:', eventsData);
		console.log('First event structure:', eventsData?.[0]);

		// Get total count for pagination
		const { count: totalCount } = await supabase
			.from('events')
			.select('*', { count: 'exact', head: true });
			// .eq('status', 'PUBLISHED') // Temporarily commented out
			// .gte('endTime', new Date().toISOString()); // Temporarily commented out

		const events = eventsData || [];
		console.log(`Fetched ${events.length} events from database`);
		console.log('Total events in database:', totalCount);

		// The `nextCursor` is the crucial part for `useInfiniteQuery`.
		// If there are more events to fetch, we return the next index.
		// If not, we return `undefined`.
		const nextCursor = totalCount && (start + pageSize) < totalCount ? start + pageSize : undefined;

		return {
			events: events,
			nextCursor: nextCursor,
		};
	} catch (error) {
		console.error('Error in fetchEvents:', error);
		throw error;
	}
};

// Additional utility function to fetch a single event by ID
export const fetchEventById = async (eventId: string) => {
	try {
		const supabase = createClient();
		
		const { data: event, error } = await supabase
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
				organizerId,
				venueId,
				venues (
					name,
					address,
					city,
					province,
					country,
					postalCode
				),
				ticket_types (
					id,
					name,
					price,
					quantity,
					availableQuantity,
					salesStartDate,
					salesEndDate
				)
			`)
			.eq('id', eventId)
			.single();

		if (error) {
			console.error('Error fetching event by ID:', error);
			throw error;
		}

		return event;
	} catch (error) {
		console.error('Error in fetchEventById:', error);
		throw error;
	}
};

// Function to fetch events by organization
export const fetchEventsByOrganization = async (organizationId: string) => {
	try {
		const supabase = createClient();
		
		const { data: events, error } = await supabase
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
				organizerId,
				venueId,
				venues (
					name,
					city,
					province,
					country
				),
				ticket_types (
					name,
					price,
					quantity,
					availableQuantity
				)
			`)
			.eq('organizerId', organizationId)
			.order('createdAt', { ascending: false });

		if (error) {
			console.error('Error fetching organization events:', error);
			throw error;
		}

		return events || [];
	} catch (error) {
		console.error('Error in fetchEventsByOrganization:', error);
		throw error;
	}
};

// Function to search events by title or description
export const searchEvents = async (searchTerm: string) => {
	try {
		const supabase = createClient();
		
		const { data: events, error } = await supabase
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
				organizerId,
				venueId,
				venues (
					name,
					city,
					province,
					country
				),
				ticket_types (
					name,
					price,
					quantity,
					availableQuantity
				)
			`)
			.eq('status', 'PUBLISHED')
			.gte('endTime', new Date().toISOString())
			.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
			.order('startTime', { ascending: true });

		if (error) {
			console.error('Error searching events:', error);
			throw error;
		}

		return events || [];
	} catch (error) {
		console.error('Error in searchEvents:', error);
		throw error;
	}
};