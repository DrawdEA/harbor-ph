import RightSidebar from "./RightSidebar";
import LeftSidebar from "./LeftSidebar";
import Footer from "./Footer";
import Feed from "./Feed";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function Home() {
	const supabase = await createClient();

	const { data: { user } } = await supabase.auth.getUser()

	const { data: profile, error } = await supabase
		.from('user_profiles')
		.select('*')
		.eq('id', user?.id)
		.single();

	if (error || !profile) {
		notFound();
	}

	return (
		// The outer div now sets a background color for the whole page
		<div className="bg-muted/40 min-h-screen">
			{/* =================================================================== */}
			{/* ✨ START: MAIN CENTERED CONTAINER - THIS IS THE KEY CHANGE ✨    */}
			{/* =================================================================== */}
			{/*
				- We wrap the entire grid in a single `div`.
				- `max-w-7xl`: This sets a maximum width for our content. It won't get any wider
				  than this, even on a huge monitor. This is the "LinkedIn" effect.
				- `mx-auto`: This automatically centers the container horizontally.
			*/}
			<div className="container max-w-7xl mx-auto px-4 sm:px-6">

				{/* The grid logic itself remains largely the same, but it now lives inside
				    our centered container. I've added an `xl` breakpoint for better
				    proportions on very wide screens. */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 md:py-8">
					
					{/* --- Left Sidebar: "Mini Summary" --- */}
					{/*
						- On `lg` screens, it takes 3 of 12 columns.
						- On `xl` screens, we make it a bit narrower (2 of 12) to give
						  more space to the main feed.
					*/}
					<aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
						<div className="sticky top-21.5">
							<LeftSidebar profile={profile} />
							<Footer />
						</div>
					</aside>


					{/* --- Main Content: The Infinite Scroll Feed --- */}
					{/*
						- On `lg` screens, it takes the central 6 columns.
						- On `xl` screens, it gets wider (7 columns) to use the space better.
					*/}
					<main className="col-span-1 lg:col-span-6 xl:col-span-7">
						<Feed />
					</main>


					{/* --- Right Sidebar: "Customize Thingy" (Filters) --- */}
					{/*
						- On both `lg` and `xl` screens, this stays at 3 columns wide.
					*/}
					<aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
						<div className="sticky top-21.5">
							<RightSidebar />
						</div>
					</aside>
				</div>
			</div>
			{/* =================================================================== */}
			{/* ✨ END: MAIN CENTERED CONTAINER                                    */}
			{/* =================================================================== */}
		</div>
	);
}