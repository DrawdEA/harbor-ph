import { Button } from "@/components/ui/button";
import { Anchor, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 sm:gap-6 text-center p-4 sm:p-6 md:p-8 lg:p-16">
      
      <div className="flex w-full max-w-xs flex-col gap-3 sm:gap-4">
        
        <Button size="lg" variant="default" className="w-full sm:w-auto">
          <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Explore Events
        </Button>
        
        <Button size="lg" className="w-full sm:w-auto">
          <Anchor className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Participate
        </Button>

      </div>
      <p className="max-w-xs text-xs sm:text-sm text-muted-foreground px-2">
        Earn anchors/social credits by participating.
      </p>

    </div>
  );
}