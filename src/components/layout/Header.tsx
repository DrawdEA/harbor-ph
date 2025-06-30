import { Home, User, Search } from "lucide-react";
import Link from "next/link";

const navTabs = [
	{ label: "For You", href: "#" },
	{ label: "Parties", href: "#" },
	{ label: "Flea Markets", href: "#" },
	{ label: "Concerts", href: "#" },
	{ label: "Runnin", href: "#" },
];

export function Header() {
	const activeTab = "For You"; // Hardcoded for now
	return (
		<>
			{/* Top Navbar */}
			<header className="bg-background border-border sticky top-0 z-30 flex w-full flex-col border-b">
				{/* Mobile: Top row with centered logo and search icon */}
				<div className="relative flex items-center justify-center gap-2 px-2 py-2 md:hidden">
					<span className="font-raleway text-primary flex-1 text-center text-2xl font-black select-none">
						Harbor
					</span>
					<button className="text-foreground absolute right-4 flex items-center">
						<Search size={22} />
					</button>
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
						<Link href="#" className="text-foreground hover:text-primary">
							<Home size={22} />
						</Link>
						<Link href="#" className="text-foreground hover:text-primary">
							<User size={22} />
						</Link>
					</div>
				</div>
			</header>
			{/* Bottom bar (mobile only) */}
			<nav className="bg-background border-border fixed right-0 bottom-0 left-0 z-30 flex items-center justify-around border-t py-2 md:hidden">
				<Link href="#" className="text-foreground hover:text-primary flex flex-col items-center">
					<Home size={22} />
					<span className="text-xs">Home</span>
				</Link>
				<Link href="#" className="text-foreground hover:text-primary flex flex-col items-center">
					<User size={22} />
					<span className="text-xs">Profile</span>
				</Link>
			</nav>
		</>
	);
}
