import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardFooter
} from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function MainNotFound() {
  return (
    <div className="bg-muted/40 flex items-center justify-center h-[100vh]">
      
      {/* ✨ FIX 1: The <Card> now uses your specific className string. */}
      {/* Kept `max-w-md` for consistent sizing. */}
      <Card className="font-raleway border-muted bg-background w-full overflow-hidden rounded-md border p-0 shadow-sm max-w-md text-center mb-48">
        
        {/* ✨ FIX 2: Added padding (p-6) to the header. */}
        <CardHeader className="flex flex-col pt-6 items-center">
          <Image
              src="/images/logo.png"
              alt="Harbor Logo"
              width={80}
              height={80}
              className="mb-4"
          />
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
        </CardHeader>

        {/* ✨ FIX 3: Added padding (p-6) to the content area. */}
        <CardContent>
          <p className="text-muted-foreground font-roboto">
            Sorry, we couldn&apos;t find the page you were looking for.
          </p>
        </CardContent>

        {/* ✨ FIX 4: Added padding (p-6) to the footer. */}
        <CardFooter className="p-6">
          <Link href="/" className="w-full">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go back to Homepage
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}