import { Home, User, Search } from 'lucide-react';
import Link from 'next/link';

const navTabs = [
  { label: 'For You', href: '#' },
  { label: 'Parties', href: '#' },
  { label: 'Flea Markets', href: '#' },
  { label: 'Concerts', href: '#' },
  { label: 'Runnin', href: '#' },
];

export function Header() {
  const activeTab = 'For You'; // Hardcoded for now
  return (
    <>
      {/* Top Navbar */}
      <header className="w-full bg-background border-b border-border flex flex-col sticky top-0 z-30">
        {/* Mobile: Top row with centered logo and search icon */}
        <div className="flex items-center justify-center gap-2 px-2 py-2 md:hidden relative">
          <span className="font-raleway text-2xl font-black text-primary select-none text-center flex-1">Harbor</span>
          <button className="flex items-center text-foreground absolute right-4">
            <Search size={22} />
          </button>
        </div>
        {/* Mobile: Nav tabs row (centered, font weights) */}
        <nav className="md:hidden flex justify-center gap-2 px-2 overflow-x-auto scrollbar-none border-b border-border bg-background">
          {navTabs.map(tab => (
            <Link
              key={tab.label}
              href={tab.href}
              className={
                `px-2 py-2 text-sm whitespace-nowrap ` +
                (tab.label === activeTab
                  ? 'font-bold text-primary border-b-2 border-primary'
                  : 'font-medium text-foreground hover:text-primary')
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        {/* Desktop: All in one row, shorter height */}
        <div className="hidden md:flex items-center gap-6 px-8 py-1.5">
          <span className="font-raleway text-2xl font-extrabold text-primary select-none">Harbor</span>
          <nav className="flex gap-4 flex-1">
            {navTabs.map(tab => (
              <Link
                key={tab.label}
                href={tab.href}
                className={
                  `px-3 py-2 text-sm font-medium whitespace-nowrap ` +
                  (tab.label === activeTab
                    ? 'font-bold text-primary border-b-2 border-primary'
                    : 'text-foreground hover:text-primary')
                }
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 flex justify-end items-center min-w-0">
            <input
              type="text"
              placeholder="Search events..."
              className="w-full max-w-xs bg-muted/30 border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-3 ml-6">
            <Link href="#" className="text-foreground hover:text-primary"><Home size={22} /></Link>
            <Link href="#" className="text-foreground hover:text-primary"><User size={22} /></Link>
          </div>
        </div>
      </header>
      {/* Bottom bar (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t border-border flex justify-around items-center py-2 md:hidden">
        <Link href="#" className="flex flex-col items-center text-foreground hover:text-primary">
          <Home size={22} />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center text-foreground hover:text-primary">
          <User size={22} />
          <span className="text-xs">Profile</span>
        </Link>
      </nav>
    </>
  );
} 