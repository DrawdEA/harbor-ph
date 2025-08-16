import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Settings, Building2, Menu } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({ 
	children 
}: { 
	children: React.ReactNode 
}) {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Redirect if not logged in
	if (!user) {
		redirect("/auth/login");
	}

	// Check if user is an organization
	const accountType = user.user_metadata?.accountType;
	if (accountType !== "organization") {
		redirect("/"); // Redirect personal users to main feed
	}

	// Fetch organization profile for sidebar
	const { data: orgProfile } = await supabase
		.from('organization_profiles')
		.select('name')
		.eq('id', user.id)
		.single();

	const sidebarItems = [
		{
			title: "Overview",
			icon: Building2,
			href: "/dashboard",
		},
		{
			title: "Events",
			icon: Calendar,
			href: "/dashboard/events",
		},
		{
			title: "Settings", 
			icon: Settings,
			href: "/dashboard/settings",
		},
	];

	return (
		<SidebarProvider>
			<div className="min-h-screen flex w-full bg-background">
				<Sidebar className="border-r border-muted/50 bg-background">
					<SidebarHeader className="border-b border-muted/50 px-6 py-4">
						<div className="flex items-center gap-3">
							<Building2 className="h-6 w-6 text-primary" />
							<div>
								<h2 className="font-semibold text-sm">
									{orgProfile?.name || "Organization"}
								</h2>
								<p className="text-xs text-muted-foreground">Dashboard</p>
							</div>
						</div>
					</SidebarHeader>
					
					<SidebarContent className="px-4 py-6">
						<SidebarMenu>
							{sidebarItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild>
										<Link href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarContent>
					
					<SidebarFooter className="border-t border-muted/50 p-4">
						<div className="text-xs text-muted-foreground">
							© 2025 Harbor PH
						</div>
					</SidebarFooter>
				</Sidebar>

				<div className="flex-1 flex flex-col">
					{/* Main Header */}
					<header className="border-b border-muted/50 bg-background px-6 py-4">
						<div className="flex items-center gap-4">
							<SidebarTrigger>
								<Menu className="h-5 w-5" />
							</SidebarTrigger>
							<h1 className="font-semibold text-lg">Organization Dashboard</h1>
						</div>
					</header>

					{/* Main Content */}
					<main className="flex-1">
						{children}
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
