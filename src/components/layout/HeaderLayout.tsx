"use client"

import { Home, User, Search, Settings, LogOut, Crown, Bookmark, Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";

const navTabs = [
	{ label: "For You", href: "/" },
	{ label: "People", href: "/people" },
	{ label: "Events", href: "/events" },
	{ label: "Bookings", href: "/bookings" },
];

import type { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderLayoutProps {
	user: SupabaseUser | null;
}

export function HeaderLayout({ user: initialUser }: HeaderLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [user, setUser] = useState<SupabaseUser | null>(initialUser);

	// Function to refresh user data
	const refreshUserData = async () => {
		const supabase = createClient();
		const { data: { user: refreshedUser } } = await supabase.auth.getUser();
		setUser(refreshedUser);
	};

	// Expose refresh function globally so it can be called from settings
	useEffect(() => {
		(window as Window & { refreshHeader?: () => void }).refreshHeader = refreshUserData;
		return () => {
			delete (window as Window & { refreshHeader?: () => void }).refreshHeader;
		};
	}, [refreshUserData]);

	const handleSignOut = async () => {
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			console.log("Signed Out");
			router.push("/auth/login");
		}
	}

	let avatarUrl: string | Blob | undefined;
	let initials: string | number;
	let profileMenuItems = [
		{ label: "View Profile", icon: User, href: "/people" },
		{ label: "Premium", icon: Crown, href: "/coming-soon" },
		{ label: "Settings", icon: Settings, href: "/settings" },
	];

	const metadata = user?.user_metadata;
	const isOrganization = metadata?.accountType === 'organization';
	
	if (metadata) {
		const fullName = `${metadata.firstName || ''} ${metadata.lastName || ''}`.trim();
		avatarUrl = metadata.profilePictureUrl || "PLACEHOLDER";
		const getInitials = (name: string): string => {
		const parts = name.split(' ').filter(Boolean);
		if (parts.length === 0) return 'U';
		const firstInitial = parts[0][0];
		const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : '';
		return `${firstInitial}${lastInitial}`.toUpperCase();
		};
		initials = getInitials(fullName);

		// Only show Bookings for regular users, not organizations
		if (!isOrganization) {
			profileMenuItems = [
				{ label: "View Profile", icon: User, href: `/${metadata.username}` },
				{ label: "My Bookings", icon: Bookmark, href: "/bookings" },
				{ label: "Premium", icon: Crown, href: "/coming-soon" },
				{ label: "Settings", icon: Settings, href: "/settings" },
			];
		} else {
			profileMenuItems = [
				{ label: "View Profile", icon: User, href: `/${metadata.username}` },
				{ label: "Premium", icon: Crown, href: "/coming-soon" },
				{ label: "Settings", icon: Settings, href: "/settings" },
			];
		}
	}
	

	const ProfileDropdown = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="hover:bg-muted/50 relative cursor-pointer rounded-md p-1 transition-colors">
					<Avatar className="h-8 w-8 flex-shrink-0">
						<AvatarImage 
							src={avatarUrl} 
							className="object-cover w-full h-full"
						/>
						<AvatarFallback>{initials}</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8 flex-shrink-0">
							<AvatarImage 
								src={avatarUrl} 
								className="object-cover w-full h-full"
							/>
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="flex flex-col flex-1 min-w-0"> {/* Add min-w-0 for flex truncation */}
							<span className="text-sm font-medium truncate">{user?.user_metadata.username}</span>
							<span className="text-muted-foreground text-xs truncate">{user?.email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{profileMenuItems.map((item) => (
					<DropdownMenuItem key={item.label} asChild>
						<Link href={item.href} className="flex items-center gap-2">
							<item.icon size={16} />
							{item.label}
						</Link>
					</DropdownMenuItem>
				))}
				<DropdownMenuSeparator />
				<DropdownMenuItem  onClick={handleSignOut} className="text-primary">
					<LogOut size={16} className="mr-2" />
					Log Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);

	const ProfileSheet = () => (
		<Sheet>
			<SheetTrigger asChild>
				<div className="hover:bg-muted/50 relative cursor-pointer rounded-md p-1 transition-colors">
					<Avatar className="h-8 w-8 flex-shrink-0">
						<AvatarImage 
							src="/placeholder-avatar.jpg" 
							className="object-cover w-full h-full"
						/>
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
				</div>
			</SheetTrigger>
			<SheetContent side="right" className="w-80">
				<SheetHeader>
					<SheetTitle>
						<div className="flex items-center gap-3">
							<Avatar className="h-12 w-12 flex-shrink-0">
								<AvatarImage 
									src="/placeholder-avatar.jpg" 
									className="object-cover w-full h-full"
								/>
								<AvatarFallback>U</AvatarFallback>
							</Avatar>
							<div className="flex flex-col items-start">
								<span className="font-medium">Username</span>
								<span className="text-muted-foreground text-sm">user@example.com</span>
							</div>
						</div>
					</SheetTitle>
				</SheetHeader>
				<div className="mt-6 space-y-1">
					{profileMenuItems.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							className="hover:bg-muted flex items-center gap-3 rounded-md p-3 text-sm"
						>
							<item.icon size={20} />
							{item.label}
						</Link>
					))}
					<div className="pt-2">
						<button onClick={handleSignOut} className="hover:bg-muted flex w-full items-center gap-3 rounded-md p-3 text-sm text-red-600">
							<LogOut size={20} />
							Log Out
						</button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);

	return (
		<>
			{/* Top Navbar */}
			<header className="bg-background border-border sticky top-0 z-30 flex w-full flex-col border-b">
				{/* Mobile: Top row with centered logo, search icon, and profile */}
				<div className="relative flex items-center justify-center gap-2 px-2 py-2 md:hidden">
					<Link href="/">
						<span className="font-raleway text-primary flex-1 text-center text-2xl font-black select-none">
							Harbor
						</span>
					</Link>
					<div className="absolute right-4 flex items-center gap-3">
						<Link href="/events" className="text-foreground hover:text-primary flex items-center">
							<Search size={22} />
						</Link>
						{user ? (
							isOrganization ? (
								// Organization users see Dashboard button
								<Link href="/dashboard">
									<Button variant="default" size="sm" className="flex items-center gap-1 px-2 py-1">
										<Building2 size={16} />
										<span className="text-xs">Dashboard</span>
									</Button>
								</Link>
							) : (
								// Personal users see bookmarks and profile
								<>
									<Link href="/bookmarks" className="text-foreground hover:text-primary relative">
										<Bookmark size={22} />
										{/* Optional: Add bookmark badge */}
										<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
									</Link>
									<ProfileDropdown />
								</>
							)
						) : (
							// Unauthenticated users - show nothing extra in mobile
							null
						)}
					</div>
				</div>
				{/* Mobile: Nav tabs row (centered, font weights) */}
				<nav className="scrollbar-none border-border bg-background flex justify-center gap-2 overflow-x-auto border-b px-2 md:hidden">
					{navTabs.map((tab) => {
						// Determine if the current tab is active
						const isActive = (
							tab.href === '/'
								? pathname === '/'
								: pathname.startsWith(tab.href)
						);

						return (
							<Link
								key={tab.label}
								href={tab.href}
								className={
									`px-2 py-2 text-sm whitespace-nowrap ` +
									(isActive
										? "text-primary border-primary border-b-2 font-bold"
										: "text-foreground hover:text-primary font-medium")
								}
							>
								{tab.label}
							</Link>
						);
					})}
				</nav>
				{/* Desktop: All in one row, shorter height */}
				<div className="hidden items-center gap-6 px-8 py-1.5 md:flex">
					<Link href="/">
						<span className="font-raleway text-primary text-2xl font-extrabold select-none">
							Harbor
						</span>
					</Link>
					<nav className="flex flex-1 gap-4">
						{navTabs.map((tab) => {
							// Determine if the current tab is active
							const isActive = (
								tab.href === '/'
									? pathname === '/'
									: pathname.startsWith(tab.href)
							);

							return (
								<Link
									key={tab.label}
									href={tab.href}
									className={
										`px-2 py-2 text-sm whitespace-nowrap ` +
										(isActive
											? "text-primary border-primary border-b-2 font-bold"
											: "text-foreground hover:text-primary font-medium")
									}
								>
									{tab.label}
								</Link>
							);
						})}
					</nav>
					<div className="flex min-w-0 flex-1 items-center justify-end">
						<form 
							onSubmit={(e) => {
								e.preventDefault();
								const formData = new FormData(e.currentTarget);
								const searchTerm = formData.get('search') as string;
								if (searchTerm.trim()) {
									router.push(`/events?q=${encodeURIComponent(searchTerm.trim())}`);
								}
							}}
							className="w-full max-w-xs"
						>
							<input
								name="search"
								type="text"
								placeholder="Search events..."
								className="bg-muted/30 border-border text-foreground focus:ring-primary w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
							/>
						</form>
					</div>
					<div className="ml-6 flex items-center gap-3">
						{user ? (
							isOrganization ? (
								// Organization users see Dashboard button
								<Link href="/dashboard">
									<Button variant="default" className="flex items-center gap-2">
										<Building2 size={18} />
										Dashboard
									</Button>
								</Link>
							) : (
								// Personal users see notifications and profile
								<>
									<Link href="/bookmarks" className="text-foreground hover:text-primary relative">
										<Bookmark size={22} />
										{/* Optional: Add bookmark badge */}
										<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
									</Link>
									<ProfileDropdown />
								</>
							)
						) : (
							// Unauthenticated users see Log In button
							<Link href="/auth/login">
								<Button>Log In</Button>
							</Link>
						)}
					</div>
				</div>
			</header>
			{/* Bottom bar (mobile only) */}
			<nav className="bg-background border-border fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t py-2 md:hidden">
				<Link
					href="/"
					className="text-foreground hover:text-primary flex flex-col items-center"
				>
					<Home size={22} />
					<span className="text-xs">Home</span>
				</Link>
				<Link
					href="/bookmarks"
					className="text-foreground hover:text-primary flex flex-col items-center"
				>
					<Bookmark size={22} />
					<span className="text-xs">Bookmarks</span>
				</Link>
			</nav>
		</>
	);
}
