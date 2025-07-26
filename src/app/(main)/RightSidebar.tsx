import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function RightSidebar() {
  const categories = ["Parties", "Flea Markets", "Concerts", "Runnin"];

  return (
    // ✨ FIX 1: The <Card> component now has your exact requested className.
    <Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
      
      {/* ✨ FIX 2: Added padding (p-6) to the header to compensate for the parent's p-0. */}
      <CardHeader className="px-6 pt-6">
        <CardTitle>Filters</CardTitle>
      </CardHeader>

      {/* ✨ FIX 3: Added padding (p-6) to the content area. */}
      <CardContent className="p-6 pt-0">
        
        {/* Date Filter Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full justify-start">Today</Button>
            <Button variant="secondary" className="w-full justify-start">This Weekend</Button>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Location Filter Section */}
        <div className="space-y-4">
          <Label htmlFor="location" className="font-semibold text-sm text-muted-foreground">Location</Label>
          <Input id="location" placeholder="City or Zip Code" />
        </div>

        <Separator className="my-6" />

        {/* Categories Filter Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-muted-foreground">Categories</h4>
          <div className="flex flex-col gap-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox id={category.toLowerCase()} />
                <Label htmlFor={category.toLowerCase()} className="font-normal text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}