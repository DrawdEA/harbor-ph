import { notFound } from "next/navigation"; // Import the notFound helper
import { createClient } from "@/lib/supabase/server";

// Import your components (paths may need slight adjustment if you moved them)
import UserProfileShell from "./UserProfileShell";
import UserProfileHeader from "./UserProfileHeader";
import Home from "./Home";
import Portfolio from "./Portfolio";

// ✨ CHANGE 1: The function now receives a `params` object from Next.js
interface DynamicProfilePageProps {
  params: {
    username: string; // This MUST match the folder name `[username]`
  };
}

export default async function DynamicProfilePage({ params }: DynamicProfilePageProps) {
	const supabase = await createClient();

	// ✨ CHANGE 2: We no longer check who is logged in here. This page is public.
	// We use the username from the URL to fetch the profile.
	const { data: profile, error } = await supabase
		.from('user_profiles')
		.select('*')
		.eq('username', params.username) // Use the username from the URL params
		.single();

	// ✨ CHANGE 3: If no profile is found for that username, we show a 404 page.
	// This is the correct behavior for a public page.
	if (error || !profile) {
		notFound();
	}

	// The rest of the component assembly is EXACTLY the same.
	// This shows the power of your component-based structure!
	return (
		<UserProfileShell
			header={<UserProfileHeader profile={profile} />} 
			homeContent={<Home />}
			portfolioContent={<Portfolio profile={profile} />}
		/>
	);
}