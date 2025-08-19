"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
	// Account Information
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters.",
	}),
	
	// Organization Information
	organizationName: z.string().min(2, {
		message: "Organization name must be at least 2 characters.",
	}).max(100, {
		message: "Organization name must be less than 100 characters.",
	}),
	organizationDescription: z.string().min(10, {
		message: "Organization description must be at least 10 characters.",
	}).max(500, {
		message: "Organization description must be less than 500 characters.",
	}),
	contactEmail: z.string().email({
		message: "Please enter a valid contact email address.",
	}),
	contactNumber: z.string().min(10, {
		message: "Contact number must be at least 10 characters.",
	}).max(15, {
		message: "Contact number must be less than 15 characters.",
	}),
	websiteUrl: z.string().url({
		message: "Please enter a valid website URL.",
	}).optional().or(z.literal("")),
});

export default function Organization() {
	const supabase = createClient();
	const router = useRouter();

	// Auth Check
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchSession = async () => {
			const currentSession = await supabase.auth.getSession();
			console.log(currentSession);
			setSession(currentSession.data.session);
		};
		
		fetchSession();
	}, [supabase.auth]);

	// Forms
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		console.log(values);
		
		try {
			// Generate username from organization name
			const generateUsername = (orgName: string): string => {
				return orgName
					.toLowerCase()
					.replace(/[^a-z0-9]/g, '_')
					.replace(/_+/g, '_')
					.replace(/^_|_$/g, '')
					.substring(0, 30);
			};

			const username = generateUsername(values.organizationName);

			// Create organization account with all data in metadata for trigger
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email: values.email,
				password: values.password,
				options: {
					data: {
						accountType: "organization",
						username: username,
						organizationName: values.organizationName,
						organizationDescription: values.organizationDescription,
						contactEmail: values.contactEmail,
						contactNumber: values.contactNumber,
						websiteUrl: values.websiteUrl || null,
					},
				}
			});

			if (authError) {
				console.error("Error during organization registration: ", authError.message);
				throw authError;
			}

			if (!authData.user) {
				throw new Error("Organization account creation failed");
			}

			// Organization profile is automatically created by database trigger
			console.log("Created Organization Account with Profile (via trigger), reloading to trigger middleware routing.");
			// Force reload to trigger middleware routing
			window.location.reload();
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			console.error("Registration error:", errorMessage);
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<div className="font-raleway text-foreground mb-3 pb-6 text-center text-2xl font-extrabold sm:mb-4 sm:text-lg w-9/10">
				Create your organization account.
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col w-9/10">
					
					{/* Error Display */}
					{error && (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					
					{/* Account Information Section */}
					<div className="space-y-4">
						<div className="text-lg font-semibold text-foreground border-b border-border pb-2">
							Account Information
						</div>
						
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" placeholder="Enter account email" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input {...field} type="password" placeholder="Enter your password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Organization Information Section */}
					<div className="space-y-4">
						<div className="text-lg font-semibold text-foreground border-b border-border pb-2">
							Organization Information
						</div>
						
						<FormField
							control={form.control}
							name="organizationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Enter organization name" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="organizationDescription"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Description</FormLabel>
									<FormControl>
										<Textarea 
											{...field} 
											placeholder="Describe your organization..."
											rows={4}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="contactEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contact Email</FormLabel>
									<FormControl>
										<Input {...field} type="email" placeholder="Contact email for organization" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="contactNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contact Number</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Contact phone number" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						
						<FormField
							control={form.control}
							name="websiteUrl"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Website URL (Optional)</FormLabel>
									<FormControl>
										<Input {...field} placeholder="https://yourorganization.com" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button type="submit" disabled={isLoading} className="w-full">
						{isLoading ? "Creating Account..." : "Create Organization Account"}
					</Button>
				</form>
			</Form>
		</>
	);
}
