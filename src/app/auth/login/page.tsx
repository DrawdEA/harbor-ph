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

	// async function handleSignOut() {
	// 	const { error } = await supabase.auth.signOut();
	// 	if (error) {
	// 		console.error(error);
	// 	} else {
	// 		console.log("Signed Out");
	// 		redirect("/login");
	// 	}
	// }

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
			redirect("/");
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
		} else {
			console.log("Sign in successful, session will be updated.");
			redirect("/");
		}
		
	}

	return (
		<>
			<div className="font-raleway text-foreground mb-3 pb-6 text-center text-2xl font-extrabold sm:mb-4 sm:text-lg w-9/10">
				Log in to your account.
			</div>
			<Form {...form} >
				{/* Add w-full to make the form expand */}
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col w-9/10">
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

					<div className="flex justify-center">
						<Button type="submit" className="w-full">Login</Button>
					</div>
				</form>
			</Form>
		</>
	);
}
