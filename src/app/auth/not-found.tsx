import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardFooter
} from '@/components/ui/card';

export default function AuthNotFound() {
  // This component will be automatically centered by your app/(auth)/layout.tsx
  return (
    // ✨ 1. The <Card> uses the exact same className as your MainNotFound page
    // for a perfectly consistent look and feel.
    <Card className="font-raleway border-muted bg-background w-full overflow-hidden rounded-md border p-0 shadow-sm max-w-md text-center">
      
      {/* ✨ 2. The header uses the same padding and structure. */}
      <CardHeader className="flex flex-col pt-6 items-center">
        <Image
            src="/images/logo.png"
            alt="Harbor Logo"
            width={80}
            height={80}
            className="mb-4"
        />
        <h1 className="text-2xl font-bold">Page Not Found</h1>
      </CardHeader>

      {/* ✨ 3. The content area uses the same padding and custom font. */}
      {/* The text is slightly different to be more generic for auth routes. */}
      <CardContent>
        <p className="text-muted-foreground font-roboto">
          This page does not exist or may have been moved.
        </p>
      </CardContent>

      {/* ✨ 4. The footer uses the same padding and structure. */}
      {/* The link and button text are updated for the auth context. */}
      <CardFooter className="p-6">
        <Link href="/login" className="w-full">
          <Button className="w-full">
            Back to Login
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}