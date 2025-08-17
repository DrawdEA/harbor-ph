import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Fetch organization profile
	const { data: orgProfile } = await supabase
		.from('organization_profiles')
		.select('*')
		.eq('id', user?.id)
		.single();

	return (
		<div className="space-y-6 bg-muted/40 p-6">
			{/* Welcome Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Welcome back, {orgProfile?.name || 'Organization'}!
				</h1>
				<p className="text-muted-foreground">
					Here&apos;s an overview of your organization and events.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 md:grid-cols-3">
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Events</CardTitle>
						<Calendar className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Events created</p>
					</CardContent>
				</Card>
				
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Events</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Currently running</p>
					</CardContent>
				</Card>
				
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Across all events</p>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle>Event Management</CardTitle>
						<CardDescription>
							Create and manage your events
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button className="w-full" asChild>
							<Link href="/dashboard/events">
								<Plus className="mr-2 h-4 w-4" />
								Create New Event
							</Link>
						</Button>
						<Button variant="black" className="w-full" asChild>
							<Link href="/dashboard/events">
								<Calendar className="mr-2 h-4 w-4" />
								View All Events
							</Link>
						</Button>
					</CardContent>
				</Card>
				
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest updates on your events
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-center py-6 text-muted-foreground">
							<Calendar className="mx-auto h-12 w-12 mb-2 opacity-50" />
							<p>No recent activity</p>
							<p className="text-sm">Create your first event to get started!</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Organization Info */}
			{orgProfile && (
				<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border shadow-sm">
					<CardHeader>
						<CardTitle>Organization Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="text-sm font-medium">Description</p>
								<p className="text-sm text-muted-foreground">
									{orgProfile.description || 'No description available'}
								</p>
							</div>
							<div className="space-y-2">
								{orgProfile.contactEmail && (
									<div>
										<p className="text-sm font-medium">Contact Email</p>
										<p className="text-sm text-muted-foreground">{orgProfile.contactEmail}</p>
									</div>
								)}
								{orgProfile.contactNumber && (
									<div>
										<p className="text-sm font-medium">Contact Number</p>
										<p className="text-sm text-muted-foreground">{orgProfile.contactNumber}</p>
									</div>
								)}
								{orgProfile.websiteUrl && (
									<div>
										<p className="text-sm font-medium">Website</p>
										<p className="text-sm text-muted-foreground">{orgProfile.websiteUrl}</p>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
