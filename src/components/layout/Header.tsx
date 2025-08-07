import { createClient } from "@/lib/supabase/server";
import { HeaderLayout } from "./HeaderLayout";

export async function Header() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	return <HeaderLayout user={user} />;
}