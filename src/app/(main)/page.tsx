import { EventCard } from "@/components/event/EventCard";

export default function Home() {
	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
					<EventCard
						imageSrc="https://placehold.co/600x315/ffb703/fff/png"
						imageAlt="Artisan Market Poster"
						isLive={true}
						eventName="Artisan Market"
						eventType="Market"
						host="Harbor Team"
						date="Jul 10 - 12"
						time="10:00 AM - 8:00 PM"
						detailsUrl="/events/artisan-market"
					/>
					<EventCard
						imageSrc="https://placehold.co/600x315/219ebc/fff/png"
						imageAlt="Food Fest Poster"
						isLive={false}
						eventName="Food Fest 2024"
						eventType="Food Festival"
						host="Gourmet Guild"
						date="Aug 5 - 7"
						time="11:00 AM - 10:00 PM"
						detailsUrl="/events/food-fest"
					/>
					<EventCard
						imageSrc="https://placehold.co/600x315/8ecae6/023047/png"
						imageAlt="Book Fair Poster"
						isLive={true}
						eventName="Book Fair"
						eventType="Literature"
						host="Readers Club"
						date="Sep 1 - 3"
						time="9:00 AM - 6:00 PM"
						detailsUrl="/events/book-fair"
					/>
					<EventCard
						imageSrc="https://placehold.co/600x315/ff006e/fff/png"
						imageAlt="Music Night Poster"
						isLive={false}
						eventName="Music Night"
						eventType="Concert"
						host="Live Sounds"
						date="Oct 15"
						time="7:00 PM - 12:00 AM"
						detailsUrl="/events/music-night"
					/>
					<EventCard
						imageSrc="https://placehold.co/600x315/8338ec/fff/png"
						imageAlt="Tech Expo Poster"
						isLive={true}
						eventName="Tech Expo"
						eventType="Exhibition"
						host="Innovators Inc."
						date="Nov 20 - 22"
						time="10:00 AM - 5:00 PM"
						detailsUrl="/events/tech-expo"
					/>
					<EventCard
						imageSrc="https://placehold.co/600x315/3a86ff/fff/png"
						imageAlt="Charity Run Poster"
						isLive={false}
						eventName="Charity Run"
						eventType="Sports"
						host="Run4Good"
						date="Dec 3"
						time="5:00 AM - 11:00 AM"
						detailsUrl="/events/charity-run"
					/>
				</div>
			</div>
		</div>
	);
}
