import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Import all the "building block" components for the page
import UserProfileShell from "./UserProfileShell";
import UserProfileHeader from "./UserProfileHeader";
import Home from "./Home";
import Portfolio from "./Portfolio";

// This is an async Server Component, which allows us to use `await` for data fetching.
export default async function ProfilePage() {
	// 1. Create the Supabase client for server-side operations.
	const supabase = createClient();

	// 2. Securely get the currently authenticated user's session data.
	const { data: { user } } = await supabase.auth.getUser();

	// 3. If no user is logged in, they cannot view this page. Redirect them.
	if (!user) {
		redirect("/login");
	}

	// 4. Use the authenticated user's ID to fetch their corresponding profile from your database.
	const { data: profile, error } = await supabase
		.from('user_profiles') // The name of your table in Supabase
		.select('*')          // Select all columns
		.eq('id', user.id)    // Find the row where the 'id' column matches the logged-in user's ID
		.single();            // Expect only one result, which simplifies the returned data

	// 5. Handle the case where the user exists in auth but not in your profiles table.
	// This is a crucial step for new user sign-ups.
	if (error || !profile) {
		// Redirect them to a page where they can complete their profile setup.
		// You will need to create this page later.
		redirect('/setup-profile'); 
	}

	// 6. (Future Step) This is where you would fetch additional data, like the user's events for their portfolio.
	// const { data: events } = await supabase.from('events')...

	// 7. Assemble the final page UI.
	// Pass the fetched `profile` data as props directly to the components that need it.
	return (
		<UserProfileShell
			header={<UserProfileHeader profile={profile} />} 
			homeContent={<Home />}
			portfolioContent={<Portfolio profile={profile} />} // Later, you'll also pass `events={events}`
		/>
	);
}