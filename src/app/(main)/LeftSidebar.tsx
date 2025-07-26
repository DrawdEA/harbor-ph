import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function LeftSidebar() {
  return (
    // ✨ THE FIX: Add border-0 and shadow-none to the Card component ✨
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
      <CardContent className="p-4 text-center">
        {/* Avatar Placeholder */}
        <div className="w-20 h-20 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse"></div>
        
        {/* Name Placeholder */}
        <div className="w-32 h-6 mx-auto mt-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        
        {/* Handle Placeholder */}
        <div className="w-24 h-4 mx-auto mt-2 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        
        {/* You can wrap the button in a Link for navigation */}
        <Link href="/profile" className="mt-4 block">
            <Button className="w-full" variant="secondary">View Profile</Button>
        </Link>
      </CardContent>
    </Card>
  );
}