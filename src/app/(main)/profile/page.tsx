import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserProfileShell from "./UserProfileShell";
import UserProfileHeader from "./UserProfileHeader";
import Home from "./Home";
import Portfolio from "./Portfolio";

export default async function ProfilePage() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) {
		redirect("/login");
	}

	return (
		<UserProfileShell
			header={<UserProfileHeader />}
			homeContent={<Home />}
			portfolioContent={<Portfolio />} // Pass events props here: <UserProfilePortfolio events={events} />
		/>
	);
}
