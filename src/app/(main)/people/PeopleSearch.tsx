"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Users, Building2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
	id: string;
	username: string;
	email: string | null;
	phone: string | null;
	firstName: string | null;
	lastName: string | null;
	profilePictureUrl: string | null;
	bio: string | null;
	updatedAt: string;
	createdAt: string;
}

interface OrganizationProfile {
	id: string;
	name: string;
	description: string | null;
	websiteUrl: string | null;
	contactEmail: string | null;
	contactNumber: string | null;
	isVerified: boolean;
	updatedAt: string;
	createdAt: string;
}

type SearchResult = {
	type: 'user' | 'organization';
	data: UserProfile | OrganizationProfile;
};

export default function PeopleSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState("all");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [debouncedQuery, setDebouncedQuery] = useState("");

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Search when debounced query changes
	useEffect(() => {
		if (debouncedQuery.trim()) {
			performSearch();
		} else {
			setResults([]);
		}
	}, [debouncedQuery, activeTab]);

	const performSearch = async () => {
		setIsLoading(true);
		const supabase = createClient();

		try {
			let userResults: UserProfile[] = [];
			let orgResults: OrganizationProfile[] = [];

			// Search users if tab is 'all' or 'users'
			if (activeTab === "all" || activeTab === "users") {
				const { data: users } = await supabase
					.from('user_profiles')
					.select('*')
					.or(`username.ilike.%${debouncedQuery}%,firstName.ilike.%${debouncedQuery}%,lastName.ilike.%${debouncedQuery}%,bio.ilike.%${debouncedQuery}%`)
					.limit(20);

				if (users) userResults = users;
			}

			// Search organizations if tab is 'all' or 'organizations'
			if (activeTab === "all" || activeTab === "organizations") {
				const { data: orgs } = await supabase
					.from('organization_profiles')
					.select('*')
					.or(`name.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
					.limit(20);

				if (orgs) orgResults = orgs;
			}

			// Combine and format results
			const combinedResults: SearchResult[] = [
				...userResults.map(user => ({ type: 'user' as const, data: user })),
				...orgResults.map(org => ({ type: 'organization' as const, data: org }))
			];

			setResults(combinedResults);
		} catch (error) {
			console.error('Search error:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getDisplayName = (result: SearchResult) => {
		if (result.type === 'user') {
			const user = result.data as UserProfile;
			return user.firstName && user.lastName 
				? `${user.firstName} ${user.lastName}`
				: user.username;
		} else {
			const org = result.data as OrganizationProfile;
			return org.name;
	 }
	};

	const getDisplayImage = (result: SearchResult) => {
		if (result.type === 'user') {
			const user = result.data as UserProfile;
			return user.profilePictureUrl;
		}
		// Organizations don't have profilePictureUrl in current schema
		return null;
	};

	const getInitials = (result: SearchResult) => {
		if (result.type === 'user') {
			const user = result.data as UserProfile;
			if (user.firstName && user.lastName) {
				return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
			}
			return user.username.substring(0, 2).toUpperCase();
		} else {
			const org = result.data as OrganizationProfile;
			return org.name.substring(0, 2).toUpperCase();
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">People</h1>
				<p className="text-muted-foreground">
					Search for users and organizations in the community
				</p>
			</div>

			{/* Search and Filters */}
			<div className="space-y-4">
				{/* Search Input */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Search by name, username, bio, or description..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 h-12 text-base"
					/>
				</div>

				{/* Filter Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="all" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							All
						</TabsTrigger>
						<TabsTrigger value="users" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Users
						</TabsTrigger>
						<TabsTrigger value="organizations" className="flex items-center gap-2">
							<Building2 className="h-4 w-4" />
							Organizations
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Results */}
			<div className="space-y-4">
				{isLoading ? (
					// Loading skeletons
					<div className="grid gap-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Card key={i}>
								<CardContent className="p-6">
									<div className="flex items-center space-x-4">
										<Skeleton className="h-12 w-12 rounded-full" />
										<div className="space-y-2 flex-1">
											<Skeleton className="h-4 w-48" />
											<Skeleton className="h-3 w-32" />
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : results.length > 0 ? (
					// Search results
					<div className="grid gap-4">
						{results.map((result) => (
							<Card key={`${result.type}-${result.data.id}`} className="hover:shadow-md transition-shadow">
								<CardContent className="p-6">
									<div className="flex items-center space-x-4">
										<Avatar className="h-12 w-12">
											<AvatarImage src={getDisplayImage(result) || undefined} />
											<AvatarFallback className="text-sm font-medium">
												{getInitials(result)}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<h3 className="font-semibold text-lg truncate">
													{getDisplayName(result)}
												</h3>
												{result.type === 'organization' && (result.data as OrganizationProfile).isVerified && (
													<Badge variant="secondary" className="text-xs">
														Verified
													</Badge>
												)}
												<Badge variant="outline" className="text-xs">
													{result.type === 'user' ? 'User' : 'Organization'}
												</Badge>
											</div>
											{result.type === 'user' ? (
												<div className="text-sm text-muted-foreground">
													@{result.data.username}
													{(result.data as UserProfile).bio && (
														<span className="ml-2">• {(result.data as UserProfile).bio}</span>
													)}
												</div>
											) : (
												<div className="text-sm text-muted-foreground">
													{(result.data as OrganizationProfile).description || 'No description available'}
												</div>
											)}
										</div>
										<Button variant="outline" size="sm">
											View Profile
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : debouncedQuery ? (
					// No results
					<div className="text-center py-12">
						<Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-muted-foreground mb-2">
							No results found
						</h3>
						<p className="text-sm text-muted-foreground">
							Try adjusting your search terms or filters
						</p>
					</div>
				) : (
					// Empty state
					<div className="text-center py-12">
						<Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium text-muted-foreground mb-2">
							Start searching
						</h3>
						<p className="text-sm text-muted-foreground">
							Search for users and organizations to discover new connections
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
