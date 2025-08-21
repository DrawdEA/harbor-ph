import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import Footer from "./Footer";
import Feed from "./Feed";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser();

	let profile = null;

	if (user) {
		// First try to get user profile
		const { data: userProfile } = await supabase
			.from('user_profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		if (userProfile) {
			profile = { ...userProfile, accountType: 'personal' };
		} else {
			// If no user profile, try to get organization profile
			const { data: orgProfile } = await supabase
				.from('organization_profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (orgProfile) {
				profile = { ...orgProfile, accountType: 'organization' };
			}
		}
	}

	return (
		<div className="bg-muted/40 min-h-screen">
			<div className="container max-w-7xl mx-auto px-4 sm:px-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 md:py-8">
					<aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
						<div className="sticky top-21.5">
							<LeftSidebar profile={profile} />
							<Footer />
						</div>
					</aside>
					<main className="col-span-1 lg:grid-cols-6 xl:col-span-7">
						<Feed />
					</main>
					<aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
						<div className="sticky top-21.5">
							<RightSidebar />
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}