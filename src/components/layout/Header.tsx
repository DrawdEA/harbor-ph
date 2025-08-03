import { Home, User, Search, Settings, LogOut, Trophy, Crown, Bell } from "lucide-react";
import Link from "next/link";
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
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const navTabs = [
	{ label: "For You", href: "/" },
	{ label: "People", href: "/people" },
	{ label: "Events", href: "/events" },
];

const profileMenuItems = [
	{ label: "View Profile", icon: User, href: "/profile" },
	{ label: "Achievements", icon: Trophy, href: "/achievements" },
	{ label: "Premium", icon: Crown, href: "/premium" },
	{ label: "Settings", icon: Settings, href: "/settings" },
];

export function Header() {
	const supabase = createClient();

	const handleSignOut = async () => {
		console.log("HELLO");
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error(error);
		} else {
			console.log("Signed Out");
			redirect("/auth/login");
		}
	}

	const activeTab = "For You";

	const ProfileDropdown = () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<div className="hover:bg-muted/50 relative cursor-pointer rounded-md p-1 transition-colors">
					<Avatar className="h-8 w-8">
						<AvatarImage src="/placeholder-avatar.jpg" />
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarImage src="/placeholder-avatar.jpg" />
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="flex flex-col">
							<span className="text-sm font-medium">Username</span>
							<span className="text-muted-foreground text-xs">user@example.com</span>
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
				<DropdownMenuItem  onClick={handleSignOut} className="text-red-600">
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
					<Avatar className="h-8 w-8">
						<AvatarImage src="/placeholder-avatar.jpg" />
						<AvatarFallback>U</AvatarFallback>
					</Avatar>
				</div>
			</SheetTrigger>
			<SheetContent side="right" className="w-80">
				<SheetHeader>
					<SheetTitle>
						<div className="flex items-center gap-3">
							<Avatar className="h-12 w-12">
								<AvatarImage src="/placeholder-avatar.jpg" />
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
					<span className="font-raleway text-primary flex-1 text-center text-2xl font-black select-none">
						Harbor
					</span>
					<div className="absolute right-4 flex items-center gap-3">
						<button className="text-foreground flex items-center">
							<Search size={22} />
						</button>
						<ProfileSheet />
					</div>
				</div>
				{/* Mobile: Nav tabs row (centered, font weights) */}
				<nav className="scrollbar-none border-border bg-background flex justify-center gap-2 overflow-x-auto border-b px-2 md:hidden">
					{navTabs.map((tab) => (
						<Link
							key={tab.label}
							href={tab.href}
							className={
								`px-2 py-2 text-sm whitespace-nowrap ` +
								(tab.label === activeTab
									? "text-primary border-primary border-b-2 font-bold"
									: "text-foreground hover:text-primary font-medium")
							}
						>
							{tab.label}
						</Link>
					))}
				</nav>
				{/* Desktop: All in one row, shorter height */}
				<div className="hidden items-center gap-6 px-8 py-1.5 md:flex">
					<span className="font-raleway text-primary text-2xl font-extrabold select-none">
						Harbor
					</span>
					<nav className="flex flex-1 gap-4">
						{navTabs.map((tab) => (
							<Link
								key={tab.label}
								href={tab.href}
								className={
									`px-3 py-2 text-sm font-medium whitespace-nowrap ` +
									(tab.label === activeTab
										? "text-primary border-primary border-b-2 font-bold"
										: "text-foreground hover:text-primary")
								}
							>
								{tab.label}
							</Link>
						))}
					</nav>
					<div className="flex min-w-0 flex-1 items-center justify-end">
						<input
							type="text"
							placeholder="Search events..."
							className="bg-muted/30 border-border text-foreground focus:ring-primary w-full max-w-xs rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none"
						/>
					</div>
					<div className="ml-6 flex items-center gap-3">
						<Link href="/notifications" className="text-foreground hover:text-primary relative">
							<Bell size={22} />
							{/* Optional: Add notification badge */}
							<span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
						</Link>
						<ProfileDropdown />
					</div>
				</div>
			</header>
			{/* Bottom bar (mobile only) */}
			<nav className="bg-background border-border fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t py-2 md:hidden">
				<Link
					href="/home"
					className="text-foreground hover:text-primary flex flex-col items-center"
				>
					<Home size={22} />
					<span className="text-xs">Home</span>
				</Link>
				<Link
					href="/notifications"
					className="text-foreground hover:text-primary flex flex-col items-center"
				>
					<Bell size={22} />
					<span className="text-xs">Notifications</span>
				</Link>
			</nav>
		</>
	);
}
