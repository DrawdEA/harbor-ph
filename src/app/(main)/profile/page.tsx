import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
	const supabase = await createClient();

	// Redirect if not logged in
	const { data, error } = await supabase.auth.getUser();
	if (error || !data?.user) {
		redirect("/login");
	}

	return (
		<div>
			<h1>PROFILES PAGE</h1>
		</div>
	)
}