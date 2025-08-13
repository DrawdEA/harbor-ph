import { Button } from "@/components/ui/button";
import { Anchor, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-6 text-center p-8 md:p-16">
      
      <div className="flex w-full max-w-xs flex-col gap-4">
        
        <Button size="lg" variant="black">
          <Sparkles className="mr-2 h-5 w-5" />
          Explore Events
        </Button>
        
        <Button size="lg">
          <Anchor className="mr-2 h-5 w-5" />
          Participate
        </Button>

      </div>
      <p className="max-w-xs text-sm text-muted-foreground">
        Earn anchors/social credits by participating.
      </p>

    </div>
  );
}