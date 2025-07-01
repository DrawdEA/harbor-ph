import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { Anchor, UserRound } from "lucide-react";

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
		<Card className="font-roboto border-muted bg-background flex w-full flex-col overflow-hidden rounded-md border p-0 shadow-sm">
			<div className="relative -mb-3 aspect-[16/7] w-full">
				<Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
				{isLive && (
					<span className="font-raleway absolute top-3 right-3 flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-black shadow">
						LIVE NOW <Anchor size={12} strokeWidth={3} />
					</span>
				)}
			</div>
			<CardContent className="flex flex-1 flex-col gap-[-1] p-4 px-3 pt-0 pb-1">
				<div className="mb-1 flex min-w-0 flex-nowrap items-center justify-between">
					<h3 className="font-raleway text-foreground mr-2 min-w-0 truncate text-xl leading-tight font-extrabold">
						{eventName}
					</h3>
					<span className="text-primary flex-shrink-0 truncate text-xs font-bold">{eventType}</span>
				</div>
				<div className="mb-1 flex items-center gap-1 text-xs">
					<UserRound size={12} strokeWidth={3} className="text-primary" />
					<span className="text-foreground align-middle leading-none font-normal">
						Hosted By {host}
					</span>
				</div>
				<div className="text-foreground mb-1 flex flex-wrap items-center justify-between gap-2 text-xs font-extralight">
					<span>
						{date} &nbsp;|&nbsp; {time}
					</span>
					<a
						href={detailsUrl}
						className="text-foreground hover:text-primary text-xs font-medium whitespace-nowrap underline underline-offset-2"
					>
						See Details
					</a>
				</div>
			</CardContent>
		</Card>
	);
}
