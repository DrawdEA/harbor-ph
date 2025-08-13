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

	const { data: profile, error } = await supabase
		.from('user_profiles')
		.select('*')
		.eq('username', params.username) // Use the username from the URL params
		.single();

	if (error || !profile) {
		notFound();
	}
	
	return (
		<UserProfileShell
			header={<UserProfileHeader profile={profile} />} 
			homeContent={<Home />}
			portfolioContent={<Portfolio profile={profile} />}
		/>
	);
}