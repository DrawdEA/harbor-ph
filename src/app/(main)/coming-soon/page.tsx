import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {  ArrowLeft, Home } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="bg-muted/40 flex items-center justify-center h-[100vh]">
      <Card className="font-roboto border-muted bg-background w-full overflow-hidden rounded-md border p-0 shadow-sm max-w-md text-center">
        <CardHeader className="flex flex-col pt-6 items-center">
            <Image
                src="/images/logo.png"
                alt="Harbor Logo"
                width={80}
                height={80}
                className="mb-4"
            />
            <h1 className="text-2xl font-bold">Coming Soon!</h1>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="text-muted-foreground font-roboto mb-6">
            We&apos;re working hard to bring you this amazing feature. 
            Stay tuned for updates!
          </p>
          
          <div className="space-y-4">         
            <div className="flex flex-col gap-3">
            <Link href="/" className="w-full">
                <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go back to Homepage
                </Button>
            </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
