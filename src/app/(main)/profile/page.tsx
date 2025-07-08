import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileClientPage from "./ProfileClient";

export default async function ProfilePage() {
	const supabase = await createClient();

	const { data, error } = await supabase.auth.getUser();

	if (error || !data?.user) {
		redirect("/login");
	}

	return <ProfileClientPage user={data.user} />;
}
