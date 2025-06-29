import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Anchor, UserRound } from 'lucide-react';

export interface EventCardProps {
  imageSrc?: string;
  imageAlt?: string;
  isLive?: boolean;
  eventName?: string;
  eventType?: string;
  host?: string;
  date?: string;
  time?: string;
  detailsUrl?: string;
}

export function EventCard({
  imageSrc = "https://placehold.co/600x315/png",
  imageAlt = "Event Poster",
  isLive = false,
  eventName = "Community Flea Market",
  eventType = "Flea Market",
  host = "Season Pass",
  date = "December 27 - 30",
  time = "1:00 PM - 9:00 PM",
  detailsUrl = "#",
}: EventCardProps) {
  return (
    <Card className="font-roboto w-full rounded-md border border-muted shadow-sm bg-background p-0 overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[16/7] -mb-3">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
        />
        {isLive && (
          <span className="font-raleway absolute top-3 right-3 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-2">
            LIVE NOW <Anchor size={12} strokeWidth={3} />
          </span>
        )}
      </div>
      <CardContent className="p-4 pt-0 pb-1 px-3 flex flex-col gap-[-1] flex-1">
        <div className="flex items-center justify-between mb-1 min-w-0 flex-nowrap">
          <h3 className="font-raleway text-xl font-extrabold leading-tight truncate min-w-0 mr-2 text-foreground">{eventName}</h3>
          <span className="text-primary font-bold text-xs flex-shrink-0 truncate">{eventType}</span>
        </div>
        <div className="flex items-center gap-1 text-xs mb-1">
          <UserRound size={12} strokeWidth={3} className="text-primary" />
          <span className="text-foreground font-normal leading-none align-middle">Hosted By {host}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center text-foreground text-xs mb-1 gap-2 font-extralight">
          <span>{date} &nbsp;|&nbsp; {time}</span>
          <a
            href={detailsUrl}
            className="text-xs text-foreground underline underline-offset-2 hover:text-primary font-medium whitespace-nowrap"
          >
            See Details
          </a>
        </div>
      </CardContent>
    </Card>
  );
} 