"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

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
import { redirect } from "next/navigation";

const formSchema = z.object({
	email: z.string().min(2, {
		message: "Email is required.", // Updated validation message for clarity
	}),
	password: z.string().min(2, {
		message: "Password is required.", // Updated validation message for clarity
	}),
});

export default function Login() {
	const supabase = createClient();

	// Auth Check
	const [session, setSession] = useState<any>(null);

	async function fetchSession() {
		const currentSession = await supabase.auth.getSession();
		setSession(currentSession.data.session);
	}

	async function handleSignOut() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			console.log("Signed Out");
			redirect("/login");
		}
	}

	useEffect(() => {
		fetchSession();

		const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		// Cleanup
		return () => {
			authListener.subscription.unsubscribe(); // This prevents any memory leaks
		};
	}, []);

	// Redirect if logged in
	useEffect(() => {
		if (session) {
			redirect("/profile");
		}
	}, [session]);

	// Forms
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const { error } = await supabase.auth.signInWithPassword({
			email: values.email,
			password: values.password,
		});

		if (error) {
			console.error("Error signing in: ", error.message);
			return;
		}
		// The onAuthStateChange listener will handle setting the session
		console.log("Sign in successful, session will be updated.");
		form.reset(); // Clear form fields after successful submission
	}

	return (
		<div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
			<div className="w-full max-w-md">
				{session && (
					<div className="bg-card text-card-foreground mb-10 rounded-lg border p-6 shadow-sm">
						<h1 className="mb-4 text-2xl font-semibold">You are signed in!</h1>
						<p className="text-muted-foreground mb-4 text-sm">{session.user.email}</p>
						<Button variant="outline" onClick={() => handleSignOut()}>
							Sign Out
						</Button>
					</div>
				)}

				{!session && (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input placeholder="you@example.com" {...field} />
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
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">Login</Button>
						</form>
					</Form>
				)}
			</div>
		</div>
	);
}
