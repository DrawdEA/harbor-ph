import { EventCard } from "../components/event/EventCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-10">
      <div className="w-full px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <EventCard
          imageSrc="https://placehold.co/600x315/ffb703/fff/png"
          imageAlt="Artisan Market Poster"
          isLive={true}
          eventName="Artisan Market"
          eventType="Market"
          host="Harbor Team"
          date="July 10 - 12"
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
          date="August 5 - 7"
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
          date="September 1 - 3"
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
          date="October 15"
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
          date="November 20 - 22"
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
          date="December 3"
          time="5:00 AM - 11:00 AM"
          detailsUrl="/events/charity-run"
        />
      </div>
    </div>
  );
}
