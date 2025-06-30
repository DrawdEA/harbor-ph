"use client";

import { supabase } from "@/lib/supabase-client";
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

const formSchema = z.object({
	email: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	password: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
});

export default function Login() {
	// Auth Check
	const [session, setSession] = useState<any>(null);

	async function fetchSession() {
		const currentSession = await supabase.auth.getSession();
		console.log(currentSession);
		setSession(currentSession.data.session);
	}

	async function handleSignOut() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			console.log("Signed Out")
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
		console.log(session);

		if (error) {
			console.error("Error registration: ", error.message);
			return;
		}
	}

	return (
		<div className="mt-[10%] ml-[10%] flex h-screen w-[30%] flex-col items-center">
			{session && (
				<div className="mb-10 text-red-500">
					<h1>YOU ARE SIGNED IN</h1>
					<Button variant="outline" onClick={() => handleSignOut()}>
						Sign Out
					</Button>
				</div>
			)}

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input {...field} />
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
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</div>
	);
}
