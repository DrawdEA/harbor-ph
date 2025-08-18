import { createClient } from "@/lib/supabase/server";
import { Plus, BarChart3, Users, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Fetch organization profile
	const { data: orgProfile } = await supabase
		.from('organization_profiles')
		.select('*')
		.eq('id', user?.id)
		.single();

	// Fetch real event stats (you can expand this with actual queries)
	const { data: events } = await supabase
		.from('events')
		.select('*')
		.eq('organizationId', user?.id);

	const totalEvents = events?.length || 0;
	const activeEvents = events?.filter(event => event.status === 'PUBLISHED').length || 0;
	
	// Mock data for demonstration - replace with real data later
	const totalAttendees = 1250;
	const revenueGrowth = 12.5;

	return (
		<div className="@container/main min-h-screen space-y-6 p-6">
			{/* Welcome Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Welcome back, {orgProfile?.name || 'Organization'}!
				</h1>
				<p className="text-muted-foreground">
					Here&apos;s an overview of your organization and events.
				</p>
			</div>

			{/* Enhanced Stats Cards using shadcn pattern */}
			<div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Total Events</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{totalEvents}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="flex items-center gap-1">
								<TrendingUp className="h-3 w-3" />
								+{totalEvents > 0 ? '100' : '0'}%
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="flex-col items-start gap-1.5 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Events created <Calendar className="size-4" />
						</div>
						<div className="text-muted-foreground">
							Total events in your organization
						</div>
					</CardContent>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Active Events</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{activeEvents}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="flex items-center gap-1">
								<TrendingUp className="h-3 w-3" />
								+{activeEvents > 0 ? Math.round((activeEvents / totalEvents) * 100) : 0}%
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="flex-col items-start gap-1.5 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Currently running <BarChart3 className="size-4" />
						</div>
						<div className="text-muted-foreground">
							Live events accepting registrations
						</div>
					</CardContent>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Total Attendees</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{totalAttendees.toLocaleString()}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="flex items-center gap-1">
								<TrendingUp className="h-3 w-3" />
								+15.3%
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="flex-col items-start gap-1.5 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Strong engagement <Users className="size-4" />
						</div>
						<div className="text-muted-foreground">
							Across all events
						</div>
					</CardContent>
				</Card>

				<Card className="@container/card">
					<CardHeader>
						<CardDescription>Revenue Growth</CardDescription>
						<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
							{revenueGrowth}%
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline" className="flex items-center gap-1">
								<TrendingUp className="h-3 w-3" />
								+{revenueGrowth}%
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="flex-col items-start gap-1.5 text-sm">
						<div className="line-clamp-1 flex gap-2 font-medium">
							Steady performance increase <TrendingUp className="size-4" />
						</div>
						<div className="text-muted-foreground">
							Month over month growth
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Chart Section */}
			<div className="grid gap-6 @5xl/main:grid-cols-2">
				{/* Interactive Chart */}
				<ChartAreaInteractive />
				
				{/* Quick Actions Card */}
				<Card className="@container/card">
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
						<Button variant="outline" className="w-full" asChild>
							<Link href="/dashboard/events">
								<Calendar className="mr-2 h-4 w-4" />
								View All Events
							</Link>
						</Button>
						<Button variant="outline" className="w-full" asChild>
							<Link href="/dashboard/settings">
								<BarChart3 className="mr-2 h-4 w-4" />
								Analytics
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Organization Info */}
			{orgProfile && (
				<Card className="@container/card">
					<CardHeader>
						<CardTitle>Organization Details</CardTitle>
						<CardDescription>
							Your organization information and settings
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 @2xl/card:grid-cols-2">
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