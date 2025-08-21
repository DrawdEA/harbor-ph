"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CategorySelector from "@/components/event/CategorySelector";
import EventImageUpload from "@/components/event/EventImageUpload";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// Default placeholder image for events without custom images
const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";

// Zod schema for form validation
const eventEditSchema = z.object({
	// Event details
	title: z.string().min(1, "Event title is required").min(3, "Title must be at least 3 characters"),
	description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	status: z.enum(["DRAFT", "PUBLISHED", "ACTIVE", "LIVE", "COMPLETED", "CANCELED"]),
	categories: z.array(z.string()).min(1, "Please select at least one category"),
	
	// Venue details
	venueName: z.string().min(1, "Venue name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	province: z.string().min(1, "Province is required"),
	country: z.string().min(1, "Country is required"),
	postalCode: z.string().optional(),
	
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

type EventEditFormData = z.infer<typeof eventEditSchema>;

interface EventEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	event: any;
	onEventUpdated: () => void;
}

export default function EventEditModal({ isOpen, onClose, event, onEventUpdated }: EventEditModalProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(event?.imageUrl || null);

	const form = useForm<EventEditFormData>({
		resolver: zodResolver(eventEditSchema),
		defaultValues: {
			title: event?.title || "",
			description: event?.description || "",
			startTime: event?.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
			endTime: event?.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "",
			status: event?.status || "DRAFT",
			categories: event?.categories_on_events?.map((cat: any) => cat.categories.id) || [],
			venueName: event?.venues?.[0]?.name || "",
			address: event?.venues?.[0]?.address || "",
			city: event?.venues?.[0]?.city || "",
			province: event?.venues?.[0]?.province || "",
			country: event?.venues?.[0]?.country || "",
			postalCode: event?.venues?.[0]?.postalCode || "",
			ticketName: event?.ticket_types?.[0]?.name || "",
			ticketPrice: event?.ticket_types?.[0]?.price?.toString() || "",
			ticketQuantity: event?.ticket_types?.[0]?.quantity?.toString() || "",
			salesStartDate: event?.ticket_types?.[0]?.salesStartDate ? new Date(event.ticket_types[0].salesStartDate).toISOString().slice(0, 16) : "",
			salesEndDate: event?.ticket_types?.[0]?.salesEndDate ? new Date(event.ticket_types[0].salesEndDate).toISOString().slice(0, 16) : ""
		}
	});

	// Update form when event changes
	useEffect(() => {
		if (event) {
			form.reset({
				title: event.title || "",
				description: event.description || "",
				startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : "",
				endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : "",
				status: event.status || "DRAFT",
				categories: event.categories_on_events?.map((cat: any) => cat.categories.id) || [],
				venueName: event.venues?.[0]?.name || "",
				address: event.venues?.[0]?.address || "",
				city: event.venues?.[0]?.city || "",
				province: event.venues?.[0]?.province || "",
				country: event.venues?.[0]?.country || "",
				postalCode: event.venues?.[0]?.postalCode || "",
				ticketName: event.ticket_types?.[0]?.name || "",
				ticketPrice: event.ticket_types?.[0]?.price?.toString() || "",
				ticketQuantity: event.ticket_types?.[0]?.quantity?.toString() || "",
				salesStartDate: event.ticket_types?.[0]?.salesStartDate ? new Date(event.ticket_types[0].salesStartDate).toISOString().slice(0, 16) : "",
				salesEndDate: event.ticket_types?.[0]?.salesEndDate ? new Date(event.ticket_types[0].salesEndDate).toISOString().slice(0, 16) : ""
			});
			setUploadedImageUrl(event.imageUrl || null);
		}
	}, [event, form]);

	const onSubmit = async (data: EventEditFormData) => {
		setIsLoading(true);
		
		try {
			const supabase = createClient();
			
			// Get current user
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) {
				throw new Error('User not authenticated');
			}

			// Get organization profile
			const { data: orgProfile } = await supabase
				.from('organization_profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (!orgProfile) {
				throw new Error('Organization profile not found');
			}

			// Update venue
			const { data: venue, error: venueError } = await supabase
				.from('venues')
				.update({
					name: data.venueName,
					address: data.address,
					city: data.city,
					province: data.province,
					postalCode: data.postalCode,
					country: data.country,
					updatedAt: new Date().toISOString()
				})
				.eq('id', event.venueId)
				.select()
				.single();

			if (venueError) {
				throw new Error(`Venue update failed: ${venueError.message}`);
			}

			// Update event
			const { data: updatedEvent, error: eventError } = await supabase
				.from('events')
				.update({
					title: data.title,
					description: data.description,
					imageUrl: uploadedImageUrl || DEFAULT_EVENT_IMAGE, // Always provide an image URL
					startTime: new Date(data.startTime).toISOString(),
					endTime: new Date(data.endTime).toISOString(),
					status: data.status,
					updatedAt: new Date().toISOString()
				})
				.eq('id', event.id)
				.select()
				.select();

			if (eventError) {
				throw new Error(`Event update failed: ${eventError.message}`);
			}

			// Update ticket type if it exists
			if (data.ticketName && data.ticketPrice && data.ticketQuantity && event.ticket_types?.[0]?.id) {
				const { error: ticketError } = await supabase
					.from('ticket_types')
					.update({
						name: data.ticketName,
						price: parseFloat(data.ticketPrice),
						quantity: parseInt(data.ticketQuantity),
						availableQuantity: parseInt(data.ticketQuantity),
						salesStartDate: data.salesStartDate ? new Date(data.salesStartDate).toISOString() : null,
						salesEndDate: data.salesEndDate ? new Date(data.salesEndDate).toISOString() : null,
						updatedAt: new Date().toISOString()
					})
					.eq('id', event.ticket_types[0].id);

				if (ticketError) {
					console.warn('Ticket type update failed:', ticketError);
				}
			}

			// Update categories
			if (data.categories && data.categories.length > 0) {
				// Remove existing category associations
				await supabase
					.from('categories_on_events')
					.delete()
					.eq('eventId', event.id);

				// Create new category associations
				const categoryAssociations = data.categories.map(categoryId => ({
					eventId: event.id,
					categoryId: categoryId,
					assignedAt: new Date().toISOString()
				}));

				const { error: categoryError } = await supabase
					.from('categories_on_events')
					.insert(categoryAssociations);

				if (categoryError) {
					console.warn('Category update failed:', categoryError);
				}
			}

			// Success! Close modal and refresh
			onClose();
			onEventUpdated();
			
		} catch (error) {
			console.error('Error updating event:', error);
			alert(`Error updating event: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-5xl max-h-[90vh] border-0 shadow-xl p-0 flex flex-col">
				<div className="p-6 pb-0 flex-shrink-0">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Edit className="h-5 w-5" />
							Edit Event: {event?.title}
						</DialogTitle>
						<DialogDescription>
							Update your event details and status.
						</DialogDescription>
					</DialogHeader>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
						<div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
							
							{/* Status Management */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Event Status</h3>
								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Event Status</FormLabel>
											<FormControl>
												<Select value={field.value} onValueChange={field.onChange}>
													<SelectTrigger>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="DRAFT">Draft (Private - Only you can see)</SelectItem>
														<SelectItem value="PUBLISHED">Published (Public - Everyone can see, no registration yet)</SelectItem>
														<SelectItem value="ACTIVE">Active (Public - Accepting registrations)</SelectItem>
														<SelectItem value="LIVE">Live (Event is happening now)</SelectItem>
														<SelectItem value="COMPLETED">Completed (Event finished)</SelectItem>
														<SelectItem value="CANCELED">Canceled (Event cancelled)</SelectItem>
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

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

							{/* Venue Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Venue Information</h3>
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
														placeholder="Enter venue address"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								
								<div className="grid gap-4 md:grid-cols-3">
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
												<FormLabel>Province/State *</FormLabel>
												<FormControl>
													<Input 
														placeholder="Enter province/state"
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
								
								<div className="grid gap-4 md:grid-cols-3">
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
								</div>
							</div>

							{/* Ticket Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-medium">Ticket Information (Optional)</h3>
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
								</div>
								
								<div className="grid gap-4 md:grid-cols-3">
									<FormField
										control={form.control}
										name="ticketQuantity"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Available Quantity</FormLabel>
												<FormControl>
													<Input 
														type="number"
														placeholder="100"
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
						</div>

						{/* Footer Actions */}
						<div className="flex-shrink-0 p-6 border-t bg-muted/20">
							<div className="flex items-center justify-end gap-3">
								<Button 
									type="button" 
									variant="outline" 
									onClick={onClose}
									disabled={isLoading}
								>
									Cancel
								</Button>
								<Button 
									type="submit" 
									disabled={isLoading}
									className="min-w-[100px]"
								>
									{isLoading ? 'Saving...' : 'Save Changes'}
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
