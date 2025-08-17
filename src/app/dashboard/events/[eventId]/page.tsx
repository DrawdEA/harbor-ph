"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Users, Calendar, DollarSign, TrendingUp, BarChart3, Settings } from "lucide-react";
import { fetchEventById, Event } from "@/lib/event-query";
import Link from "next/link";

export default function DashboardEventDetailPage() {
	const params = useParams();
	const router = useRouter();
	const eventId = params.eventId as string;
	
	const [event, setEvent] = useState<Event | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState("main-dashboard");

	useEffect(() => {
		const loadEvent = async () => {
			if (!eventId) return;
			
			try {
				setLoading(true);
				const eventData = await fetchEventById(eventId);
				setEvent(eventData);
			} catch (err) {
				console.error('Error loading event:', err);
				setError('Failed to load event details');
			} finally {
				setLoading(false);
			}
		};

		loadEvent();
	}, [eventId]);

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch (error) {
			return 'Date TBA';
		}
	};

	const formatTime = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			});
		} catch (error) {
			return 'Time TBA';
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<div className="max-w-6xl mx-auto px-4 py-8">
					<div className="animate-pulse space-y-6">
						<div className="h-8 bg-muted rounded w-1/4"></div>
						<div className="h-96 bg-muted rounded"></div>
						<div className="space-y-4">
							<div className="h-4 bg-muted rounded w-3/4"></div>
							<div className="h-4 bg-muted rounded w-1/2"></div>
							<div className="h-4 bg-muted rounded w-2/3"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !event) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold text-gray-900">Event Not Found</h1>
					<p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
					<Button asChild>
						<Link href="/dashboard/events">Back to Events</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="border-b border-muted/50 bg-white">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div>
							<Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
								← Back to Events
							</Button>
							<h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
							<p className="text-gray-600 mt-1">Event Management Dashboard</p>
						</div>
						<div className="flex items-center space-x-2">
							<span className={`px-3 py-1 text-sm rounded-full font-medium ${
								event.status === 'PUBLISHED' 
									? 'bg-green-100 text-green-800' 
									: 'bg-yellow-100 text-yellow-800'
							}`}>
								{event.status}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto px-4 py-8">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="main-dashboard" className="flex items-center space-x-2">
							<BarChart3 className="h-4 w-4" />
							<span className="hidden sm:inline">Main Dashboard</span>
							<span className="sm:hidden">Dashboard</span>
						</TabsTrigger>
						<TabsTrigger value="expenses" className="flex items-center space-x-2">
							<DollarSign className="h-4 w-4" />
							<span className="hidden sm:inline">Breakdown of Expenses</span>
							<span className="sm:hidden">Expenses</span>
						</TabsTrigger>
						<TabsTrigger value="financial" className="flex items-center space-x-2">
							<TrendingUp className="h-4 w-4" />
							<span className="hidden sm:inline">Financial Projection</span>
							<span className="sm:hidden">Financial</span>
						</TabsTrigger>
					</TabsList>

					{/* Main Dashboard Tab */}
					<TabsContent value="main-dashboard" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* Event Overview */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<Calendar className="h-5 w-5" />
										<span>Event Overview</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-3">
										<div className="flex items-center space-x-3 text-gray-700">
											<Calendar className="h-5 w-5" />
											<div>
												<span className="font-medium">Date</span>
												<p className="text-lg">{formatDate(event.startTime)}</p>
											</div>
										</div>
										<div className="flex items-center space-x-3 text-gray-700">
											<Clock className="h-5 w-5" />
											<div>
												<span className="font-medium">Time</span>
												<p className="text-lg">
													{formatTime(event.startTime)} - {formatTime(event.endTime)}
												</p>
											</div>
										</div>
										{event.venues && event.venues.length > 0 && (
											<div className="flex items-center space-x-3 text-gray-700">
												<MapPin className="h-5 w-5" />
												<div>
													<span className="font-medium">Venue</span>
													<p className="text-lg">{event.venues[0].name}</p>
													<p className="text-gray-600">
														{event.venues[0].city}, {event.venues[0].province}
														{event.venues[0].country && `, ${event.venues[0].country}`}
													</p>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Quick Stats */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<TrendingUp className="h-5 w-5" />
										<span>Quick Stats</span>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center p-4 bg-muted/30 rounded-lg">
											<p className="text-2xl font-bold text-primary">0</p>
											<p className="text-sm text-gray-600">Registrations</p>
										</div>
										<div className="text-center p-4 bg-muted/30 rounded-lg">
											<p className="text-2xl font-bold text-green-600">₱0</p>
											<p className="text-sm text-gray-600">Revenue</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Event Description */}
						<Card>
							<CardHeader>
								<CardTitle>About This Event</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-600 leading-relaxed">{event.description}</p>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Breakdown of Expenses Tab */}
					<TabsContent value="expenses" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<DollarSign className="h-5 w-5" />
									<span>Breakdown of Expenses</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="text-center py-8">
									<Button size="lg" className="bg-red-600 hover:bg-red-700">
										Add Expenses
									</Button>
									<p className="text-gray-600 mt-4">Total Expenses: ₱0</p>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{['Venue', 'Miscellaneous', 'Staff', 'Suppliers', 'Marketing', 'Talent', 'Security', 'Permits', 'Others'].map((category) => (
										<Card key={category} className="p-4">
											<div className="flex items-center justify-between">
												<span className="font-medium">{category}</span>
												<Button size="sm" variant="outline">Confirm</Button>
											</div>
										</Card>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Financial Projection Tab */}
					<TabsContent value="financial" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center space-x-2">
									<TrendingUp className="h-5 w-5" />
									<span>Financial Projection</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-gray-600">Real-Time Registration Count</p>
											<p className="text-2xl font-bold">0</p>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-gray-600">Break Even</p>
											<p className="text-2xl font-bold text-orange-600">₱0</p>
										</div>
									</div>
									
									<div className="space-y-4">
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-gray-600">Real-Time Profit</p>
											<p className="text-lg">Total Revenue Sales - Total Expenses = ₱0</p>
										</div>
										<div className="p-4 bg-muted/30 rounded-lg">
											<p className="text-sm text-gray-600">Estimated Profit</p>
											<p className="text-2xl font-bold text-green-600">₱0</p>
										</div>
									</div>
								</div>

								{/* Revenue Sources */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Revenue Sources</h3>
									<div className="space-y-2">
										{['Ticket Sales', 'Merchandise'].map((source) => (
											<div key={source} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
												<span className="font-medium">{source}</span>
												<span className="text-gray-600">₱0</span>
											</div>
										))}
									</div>
								</div>

								<div className="flex space-x-4">
									<Button className="bg-red-600 hover:bg-red-700">₱0</Button>
									<Button variant="outline">See Guest List</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
