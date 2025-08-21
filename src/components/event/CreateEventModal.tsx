"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCreateEventModal } from "./CreateEventModalContext";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import EventImageUpload from "./EventImageUpload";
import CategorySelector from "./CategorySelector";

const eventFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	status: z.string().default("DRAFT"),
	categories: z.array(z.string()).min(1, "At least one category is required"),
	venueName: z.string().min(1, "Venue name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	province: z.string().min(1, "Province is required"),
	country: z.string().min(1, "Country is required"),
	postalCode: z.string().optional(),
	latitude: z.string().optional(),
	longitude: z.string().optional(),
	
	// Multiple ticket types
	ticketTypes: z.array(z.object({
		name: z.string().min(1, "Ticket name is required"),
		price: z.string().min(1, "Price is required"),
		quantity: z.string().min(1, "Quantity is required"),
		salesStartDate: z.string().optional(),
		salesEndDate: z.string().optional()
	})).optional(),
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

// Default placeholder image for events without custom images
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

export default function CreateEventModal() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
	const [ticketTypes, setTicketTypes] = useState([
		{
			name: "",
			price: "",
			quantity: "",
			salesStartDate: "",
			salesEndDate: ""
		}
	]);
	const { isOpen, closeModal } = useCreateEventModal();

	// Helper functions for managing ticket types
	const addTicketType = () => {
		setTicketTypes([...ticketTypes, {
			name: "",
			price: "",
			quantity: "",
			salesStartDate: "",
			salesEndDate: ""
		}]);
	};

	const removeTicketType = (index: number) => {
		if (ticketTypes.length > 1) {
			setTicketTypes(ticketTypes.filter((_, i) => i !== index));
		}
	};

	const updateTicketType = (index: number, field: string, value: string) => {
		const updated = [...ticketTypes];
		updated[index] = { ...updated[index], [field]: value };
		setTicketTypes(updated);
	};

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventFormSchema),
		defaultValues: {
			title: "",
			description: "",
			startTime: "",
			endTime: "",
			status: "DRAFT",
			categories: [],
			venueName: "",
			address: "",
			city: "",
			province: "",
			country: "",
			postalCode: "",
			latitude: "",
			longitude: "",
			ticketTypes: [],
		}
	});

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
				imageUrl: uploadedImageUrl || DEFAULT_EVENT_IMAGE,
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
					imageUrl: uploadedImageUrl || DEFAULT_EVENT_IMAGE, // Always provide an image URL
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

			// Create ticket types if any are configured
			if (ticketTypes.length > 0 && ticketTypes.some(t => t.name && t.price && t.quantity)) {
				console.log('Creating ticket types for event:', event.id);
				
				const ticketTypePromises = ticketTypes.map(async (ticketData) => {
					if (ticketData.name && ticketData.price && ticketData.quantity) {
						const ticketTypeId = uuidv4();
						console.log(`Creating ticket type: ${ticketData.name}`, ticketTypeId);
						
						const { error: ticketError } = await supabase
							.from('ticket_types')
							.insert({
								id: ticketTypeId,
								name: ticketData.name,
								price: parseFloat(ticketData.price),
								quantity: parseInt(ticketData.quantity),
								availableQuantity: parseInt(ticketData.quantity),
								eventId: event.id,
								salesStartDate: ticketData.salesStartDate ? new Date(ticketData.salesStartDate).toISOString() : new Date().toISOString(),
								salesEndDate: ticketData.salesEndDate ? new Date(ticketData.salesEndDate).toISOString() : data.endTime,
								updatedAt: new Date().toISOString()
							});

						if (ticketError) {
							console.error(`Ticket type creation error for ${ticketData.name}:`, ticketError);
							throw new Error(`Ticket type creation failed for ${ticketData.name}: ${ticketError.message}`);
						}
						
						console.log(`Ticket type created successfully: ${ticketData.name}`, ticketTypeId);
						return ticketTypeId;
					}
				});

				await Promise.all(ticketTypePromises);
				console.log('All ticket types created successfully');
			}

			// Create category associations
			if (data.categories && data.categories.length > 0) {
				console.log('Creating category associations for event:', event.id);
				
				const categoryAssociations = data.categories.map(categoryId => ({
					eventId: event.id,
					categoryId: categoryId,
					assignedAt: new Date().toISOString()
				}));

				const { error: categoryError } = await supabase
					.from('categories_on_events')
					.insert(categoryAssociations);

				if (categoryError) {
					console.error('Category association error:', categoryError);
					throw new Error(`Category association failed: ${categoryError.message}`);
				}
				
				console.log('Category associations created successfully');
			}

			// Success! Close modal, reset form, and redirect to events page
			closeModal();
			form.reset();
			setUploadedImageUrl(null);
			setTicketTypes([{
				name: "",
				price: "",
				quantity: "",
				salesStartDate: "",
				salesEndDate: ""
			}]);
			
			// Redirect to events page and refresh to show the new event
			router.push('/dashboard/events');
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
		<Dialog open={isOpen} onOpenChange={closeModal}>
			<DialogContent className="max-w-5xl max-h-[90vh] border-0 shadow-xl p-0 flex flex-col">
				<div className="p-6 pb-0 flex-shrink-0">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5" />
							Create New Event
						</DialogTitle>
						<DialogDescription>
							Fill out the details below to create a new event for your organization.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
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
							
															<FormField
									control={form.control}
									name="categories"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Categories *</FormLabel>
											<FormControl>
												<CategorySelector
													selectedCategories={field.value}
													onCategoriesChange={field.onChange}
													placeholder="Select event categories..."
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							
							{/* Event Status */}
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Event Status</FormLabel>
										<FormControl>
											<select
												{...field}
												className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											>
												<option value="DRAFT">Draft (Private - Only you can see)</option>
												<option value="PUBLISHED">Published (Public - Everyone can see, no registration yet)</option>
											</select>
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

						{/* Ticket Types */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Ticket Types</h3>
								<Button 
									type="button" 
									variant="outline" 
									size="sm"
									onClick={addTicketType}
								>
									<Plus className="h-4 w-4 mr-2" />
									Add Ticket
								</Button>
							</div>
							
							<div className="space-y-4">
								{ticketTypes.map((ticket, index) => (
									<div key={index} className="p-4 border rounded-lg space-y-4">
										<div className="flex items-center justify-between">
											<h4 className="font-medium text-sm text-muted-foreground">
												Ticket Type {index + 1}
											</h4>
											{ticketTypes.length > 1 && (
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeTicketType(index)}
													className="text-destructive hover:text-destructive"
												>
													<X className="h-4 w-4" />
												</Button>
											)}
										</div>
										
										<div className="grid gap-4 md:grid-cols-3">
											<div>
												<Label className="text-sm">Ticket Name</Label>
												<Input
													placeholder="e.g., General Admission"
													value={ticket.name}
													onChange={(e) => updateTicketType(index, 'name', e.target.value)}
												/>
											</div>
											<div>
												<Label className="text-sm">Price</Label>
												<Input
													type="number"
													step="0.01"
													placeholder="0.00"
													value={ticket.price}
													onChange={(e) => updateTicketType(index, 'price', e.target.value)}
												/>
											</div>
											<div>
												<Label className="text-sm">Quantity</Label>
												<Input
													type="number"
													placeholder="Enter quantity"
													value={ticket.quantity}
													onChange={(e) => updateTicketType(index, 'quantity', e.target.value)}
												/>
											</div>
										</div>
										
										<div className="grid gap-4 md:grid-cols-2">
											<div>
												<Label className="text-sm">Sales Start Date</Label>
												<Input
													type="datetime-local"
													value={ticket.salesStartDate}
													onChange={(e) => updateTicketType(index, 'salesStartDate', e.target.value)}
												/>
											</div>
											<div>
												<Label className="text-sm">Sales End Date</Label>
												<Input
													type="datetime-local"
													value={ticket.salesEndDate}
													onChange={(e) => updateTicketType(index, 'salesEndDate', e.target.value)}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
							
							{/* Optional: Configure Later Button */}
							<div className="text-center pt-2">
								<Button 
									type="button" 
									variant="ghost" 
									size="sm"
									onClick={() => setTicketTypes([])}
								>
									Skip tickets for now
								</Button>
							</div>
						</div>

						</div>
						
						{/* Submit Button */}
						<div className="flex gap-3 p-6 pt-4 bg-background border-t border-border/5 flex-shrink-0">
							<Button 
								type="button" 
								variant="outline" 
								className="flex-1"
								onClick={closeModal}
								disabled={isLoading}
							>
								Cancel
							</Button>
							<Button type="submit" className="flex-1" disabled={isLoading}>
								<Plus className="mr-2 h-4 w-4" />
								{isLoading ? 'Creating Event...' : 'Create Event'}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
