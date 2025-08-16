"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { v4 as uuidv4 } from "uuid";
import DashboardEventCard, { DashboardEventCardData } from "@/components/event/DashboardEventCard";
import EventImageUpload from "@/components/event/EventImageUpload";

export default function EventsPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [events, setEvents] = useState<FetchedEvent[]>([]);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

	// Zod schema for form validation
	const eventFormSchema = z.object({
		// Event details
		title: z.string().min(1, "Event title is required").min(3, "Title must be at least 3 characters"),
		description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		status: z.enum(["DRAFT", "PUBLISHED"]),
		
		// Venue details
		venueName: z.string().min(1, "Venue name is required"),
		address: z.string().min(1, "Address is required"),
		city: z.string().min(1, "City is required"),
		province: z.string().min(1, "Province is required"),
		country: z.string().min(1, "Country is required"),
		postalCode: z.string().optional(),
		latitude: z.string().optional(),
		longitude: z.string().optional(),
		
		// Ticket type (optional)
		ticketName: z.string().optional(),
		ticketPrice: z.string().optional(),
		ticketQuantity: z.string().optional(),
		salesStartDate: z.string().optional(),
		salesEndDate: z.string().optional()
	}).refine((data) => {
		// Custom validation: end time must be after start time
		if (data.startTime && data.endTime) {
			return new Date(data.endTime) > new Date(data.startTime);
		}
		return true;
	}, {
		message: "End time must be after start time",
		path: ["endTime"]
	});

	type EventFormData = z.infer<typeof eventFormSchema>;

	// Use the imported DashboardEventCardData type
	type FetchedEvent = DashboardEventCardData;

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: "",
			description: "",
			startTime: "",
			endTime: "",
			status: "DRAFT",
			venueName: "",
			address: "",
			city: "",
			province: "",
			country: "",
			postalCode: "",
			latitude: "",
			longitude: "",
			ticketName: "",
			ticketPrice: "",
			ticketQuantity: "",
			salesStartDate: "",
			salesEndDate: ""
		}
	});

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

	const onSubmit = async (data: EventFormData) => {
		setIsLoading(true);
		
		try {
			// Validate that an image has been uploaded
			if (!uploadedImageUrl) {
				alert('Please upload an event image before creating the event.');
				setIsLoading(false);
				return;
			}
			
			console.log('Form data:', data);
			const supabase = createClient();
			const { data: { user } } = await supabase.auth.getUser();
			
			if (!user) {
				throw new Error('User not authenticated');
			}
			
			console.log('User authenticated:', user.id);

			// Get organization profile
			console.log('Looking for organization profile for user:', user.id);
			const { data: orgProfile, error: orgError } = await supabase
				.from('organization_profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (orgError) {
				console.error('Organization profile error:', orgError);
				throw new Error(`Organization profile error: ${orgError.message}`);
			}

			if (!orgProfile) {
				throw new Error('Organization profile not found');
			}
			
			console.log('Organization profile found:', orgProfile.id);

			// Create venue first
			console.log('Creating venue with data:', {
				name: data.venueName,
				address: data.address,
				city: data.city,
				province: data.province,
				country: data.country
			});
			
			// Generate a unique ID for the venue
			const venueId = uuidv4();
			console.log('Generated venue ID:', venueId);
			
			const { data: venue, error: venueError } = await supabase
				.from('venues')
				.insert({
					id: venueId,  // Add the generated ID
					name: data.venueName,
					address: data.address,
					city: data.city,
					province: data.province,
					postalCode: data.postalCode,
					country: data.country,
					latitude: parseFloat(data.latitude || '0') || 0,
					longitude: parseFloat(data.longitude || '0') || 0,
					updatedAt: new Date().toISOString()  // Set to current timestamp
				})
				.select()
				.single();

			if (venueError) {
				console.error('Venue creation error:', venueError);
				throw new Error(`Venue creation failed: ${venueError.message}`);
			}
			
			console.log('Venue created successfully:', venue.id);

			// Create event
			console.log('Creating event with data:', {
				title: data.title,
				description: data.description,
				imageUrl: uploadedImageUrl,
				startTime: data.startTime,
				endTime: data.endTime,
				status: data.status,
				organizerId: orgProfile.id,
				venueId: venue.id
			});
			
			// Generate a unique ID for the event
			const eventId = uuidv4();
			console.log('Generated event ID:', eventId);
			
			const { data: event, error: eventError } = await supabase
				.from('events')
				.insert({
					id: eventId,  // Add the generated ID
					title: data.title,
					description: data.description,
					imageUrl: uploadedImageUrl,
					startTime: new Date(data.startTime).toISOString(),
					endTime: new Date(data.endTime).toISOString(),
					status: data.status,
					organizerId: orgProfile.id,
					venueId: venue.id,
					updatedAt: new Date().toISOString() 
				})
				.select()
				.single();

			if (eventError) {
				console.error('Event creation error:', eventError);
				throw new Error(`Event creation failed: ${eventError.message}`);
			}
			
			console.log('Event created successfully:', event.id);

			// Create ticket type
			if (data.ticketName && data.ticketPrice && data.ticketQuantity) {
				// Generate a unique ID for the ticket type
				const ticketTypeId = uuidv4();
				console.log('Generated ticket type ID:', ticketTypeId);
				
				const { error: ticketError } = await supabase
					.from('ticket_types')
					.insert({
						id: ticketTypeId,  // Add the generated ID
						name: data.ticketName,
						price: parseFloat(data.ticketPrice),
						quantity: parseInt(data.ticketQuantity),
						availableQuantity: parseInt(data.ticketQuantity),
						salesStartDate: new Date(data.salesStartDate!).toISOString(),
						salesEndDate: new Date(data.salesEndDate!).toISOString(),
						eventId: event.id,
						updatedAt: new Date().toISOString() 
					});

				if (ticketError) {
					console.error('Ticket type creation error:', ticketError);
					throw new Error(`Ticket type creation failed: ${ticketError.message}`);
				}
				
				console.log('Ticket type created successfully:', ticketTypeId);
			}

			// Success! Refresh events and redirect to dashboard
			await fetchEvents();
			router.push('/dashboard');
			router.refresh();
			
		} catch (error) {
			console.error('Error creating event:', error);
			
			// More specific error messages
			if (error instanceof Error) {
				if (error.message.includes('User not authenticated')) {
					alert('Please log in again to create events.');
				} else if (error.message.includes('Organization profile not found')) {
					alert('Organization profile not found. Please check your account setup.');
				} else if (error.message.includes('duplicate key')) {
					alert('An event with this title already exists. Please use a different title.');
				} else if (error.message.includes('violates not-null constraint')) {
					alert('Please fill in all required fields.');
				} else {
					alert(`Error: ${error.message}`);
				}
			} else {
				alert('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

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
			</div>

			<div className="grid gap-6">
				{/* Create Event Form */}
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Plus className="h-5 w-5" />
									Create New Event
								</CardTitle>
								<CardDescription>
									Fill out the details below to create a new event.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
							{/* Basic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Basic Information</h3>
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="title"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Event Title *</FormLabel>
												<FormControl>
													<Input 
														placeholder="Enter event title"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Description *</FormLabel>
											<FormControl>
												<Textarea 
													placeholder="Describe your event..."
													rows={4}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								
								{/* Event Image Upload */}
								<EventImageUpload
									currentImageUrl={uploadedImageUrl}
									eventTitle={form.watch('title') || 'Event'}
									onImageUpdate={setUploadedImageUrl}
								/>
							</div>

						{/* Date & Time */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Date & Time</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="startTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Start Date & Time *</FormLabel>
											<FormControl>
												<Input 
													type="datetime-local"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="endTime"
									render={({ field }) => (
										<FormItem>
											<FormLabel>End Date & Time *</FormLabel>
											<FormControl>
												<Input 
													type="datetime-local"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Location */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Location</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="venueName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Venue Name *</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter venue name"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Address *</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter full address"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="city"
									render={({ field }) => (
										<FormItem>
											<FormLabel>City *</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter city"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="province"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Province *</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter province"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="postalCode"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Postal Code</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter postal code"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Country *</FormLabel>
											<FormControl>
												<Input 
													placeholder="Enter country"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Ticket Type */}
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Ticket Type</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="ticketName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ticket Name</FormLabel>
											<FormControl>
												<Input 
													placeholder="e.g., General Admission"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="ticketPrice"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ticket Price</FormLabel>
											<FormControl>
												<Input 
													type="number"
													step="0.01"
													placeholder="0.00"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="ticketQuantity"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Available Quantity</FormLabel>
											<FormControl>
												<Input 
													type="number"
													placeholder="Enter quantity"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="salesStartDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sales Start Date</FormLabel>
											<FormControl>
												<Input 
													type="datetime-local"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="salesEndDate"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Sales End Date</FormLabel>
											<FormControl>
												<Input 
													type="datetime-local"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex gap-3 pt-4">
							<Button type="submit" className="w-full" disabled={isLoading}>
								<Plus className="mr-2 h-4 w-4" />
								{isLoading ? 'Creating Event...' : 'Create Event'}
							</Button>
						</div>
					</CardContent>
				</Card>
				</form>
				</Form>

				{/* Recent Events */}
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle>Recent Events</CardTitle>
						<CardDescription>
							Your recently created events will appear here.
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
										onEventUpdate={fetchEvents}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
