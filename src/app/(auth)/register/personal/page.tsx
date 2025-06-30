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
	username: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	firstName: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	lastName: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	email: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
	password: z.string().min(2, {
		message: "Username must be at least 2 characters.",
	}),
});

export default function Personal() {
	// Auth Check
	const [session, setSession] = useState<any>(null);

	async function fetchSession() {
		const currentSession = await supabase.auth.getSession();
		console.log(currentSession);
		setSession(currentSession.data.session);
	}

	useEffect(() => {
		fetchSession();
	}, []);

	// Forms
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		const { error } = await supabase.auth.signUp({
			email: values.email,
			password: values.password,
		});

		if (error) {
			console.error("Error registration: ", error.message);
			return;
		} else {
			console.log("Registered User");
		}
	}

	return (
		<div className="mt-[10%] ml-[10%] flex h-screen w-[30%] flex-col items-center">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last Name</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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
