// This is a mock API for testing the infinite scrolling mechanism.

// Define the shape of a single event
export interface Event {
	id: number;
	imageSrc: string;
	imageAlt: string;
	isLive: boolean;
	eventName: string;
	eventType: string;
	host: string;
	date: string;
	time: string;
	detailsUrl: string;
}

// mock database 
export const allEvents: Event[] = [
	{ id: 1, imageSrc: "https://placehold.co/600x315/ffb703/fff/png", imageAlt: "Artisan Market Poster", isLive: true, eventName: "Artisan Market", eventType: "Market", host: "Harbor Team", date: "Jul 10 - 12", time: "10:00 AM - 8:00 PM", detailsUrl: "/events/artisan-market" },
	{ id: 2, imageSrc: "https://placehold.co/600x315/219ebc/fff/png", imageAlt: "Food Fest Poster", isLive: false, eventName: "Food Fest 2024", eventType: "Food Festival", host: "Gourmet Guild", date: "Aug 5 - 7", time: "11:00 AM - 10:00 PM", detailsUrl: "/events/food-fest" },
	{ id: 3, imageSrc: "https://placehold.co/600x315/8ecae6/023047/png", imageAlt: "Book Fair Poster", isLive: true, eventName: "Book Fair", eventType: "Literature", host: "Readers Club", date: "Sep 1 - 3", time: "9:00 AM - 6:00 PM", detailsUrl: "/events/book-fair" },
	{ id: 4, imageSrc: "https://placehold.co/600x315/ff006e/fff/png", imageAlt: "Music Night Poster", isLive: false, eventName: "Music Night", eventType: "Concert", host: "Live Sounds", date: "Oct 15", time: "7:00 PM - 12:00 AM", detailsUrl: "/events/music-night" },
	{ id: 5, imageSrc: "https://placehold.co/600x315/8338ec/fff/png", imageAlt: "Tech Expo Poster", isLive: true, eventName: "Tech Expo 2024", eventType: "Exhibition", host: "Innovators Inc.", date: "Nov 20 - 22", time: "10:00 AM - 5:00 PM", detailsUrl: "/events/tech-expo" },
	{ id: 6, imageSrc: "https://placehold.co/600x315/3a86ff/fff/png", imageAlt: "Charity Run Poster", isLive: false, eventName: "Charity Run", eventType: "Sports", host: "Run4Good", date: "Dec 3", time: "5:00 AM - 11:00 AM", detailsUrl: "/events/charity-run" },
    { id: 7, imageSrc: "https://placehold.co/600x315/fb5607/fff/png", imageAlt: "Indie Film Festival", isLive: true, eventName: "Indie Film Fest", eventType: "Film", host: "Cinema Collective", date: "Jan 12 - 14", time: "1:00 PM - 11:00 PM", detailsUrl: "/events/indie-film-fest" },
    { id: 8, imageSrc: "https://placehold.co/600x315/0ead69/fff/png", imageAlt: "Gardening Workshop", isLive: false, eventName: "Green Thumb Workshop", eventType: "Workshop", host: "City Gardens", date: "Feb 5", time: "10:00 AM - 1:00 PM", detailsUrl: "/events/gardening-workshop" },
    { id: 9, imageSrc: "https://placehold.co/600x315/f72585/fff/png", imageAlt: "Valentine's Gala", isLive: true, eventName: "Valentine's Gala", eventType: "Gala", host: "Events & Co.", date: "Feb 14", time: "8:00 PM - 1:00 AM", detailsUrl: "/events/valentines-gala" },
    { id: 10, imageSrc: "https://placehold.co/600x315/4361ee/fff/png", imageAlt: "Startup Pitch Night", isLive: false, eventName: "Startup Pitch Night", eventType: "Networking", host: "Venture Hub", date: "Mar 1", time: "6:00 PM - 9:00 PM", detailsUrl: "/events/startup-pitch" },
    { id: 11, imageSrc: "https://placehold.co/600x315/ffca3a/000/png", imageAlt: "Jazz Under the Stars", isLive: true, eventName: "Jazz Under the Stars", eventType: "Concert", host: "The Blue Note", date: "Mar 18", time: "7:30 PM - 10:30 PM", detailsUrl: "/events/jazz-night" },
    { id: 12, imageSrc: "https://placehold.co/600x315/2d6a4f/fff/png", imageAlt: "Local Hackathon", isLive: false, eventName: "CodeJam 2025", eventType: "Hackathon", host: "Tech Forward", date: "Apr 2 - 4", time: "All Day", detailsUrl: "/events/codejam" },
    { id: 13, imageSrc: "https://placehold.co/600x315/e07a5f/000/png", imageAlt: "Pottery Class", isLive: true, eventName: "Beginner's Pottery", eventType: "Class", host: "The Clay Studio", date: "Apr 15", time: "2:00 PM - 5:00 PM", detailsUrl: "/events/pottery-class" },
    { id: 14, imageSrc: "https://placehold.co/600x315/8d99ae/fff/png", imageAlt: "Photography Walk", isLive: false, eventName: "City Photo Walk", eventType: "Meetup", host: "Shutterbugs United", date: "May 1", time: "9:00 AM - 12:00 PM", detailsUrl: "/events/photo-walk" },
    { id: 15, imageSrc: "https://placehold.co/600x315/ff595e/fff/png", imageAlt: "Summer Kickoff BBQ", isLive: true, eventName: "Summer Kickoff BBQ", eventType: "Party", host: "Community Center", date: "May 28", time: "12:00 PM - 6:00 PM", detailsUrl: "/events/summer-bbq" },
    { id: 16, imageSrc: "https://placehold.co/600x315/1982c4/fff/png", imageAlt: "Open Mic Night", isLive: false, eventName: "Open Mic Night", eventType: "Performance", host: "The Coffee House", date: "Jun 9", time: "7:00 PM - 10:00 PM", detailsUrl: "/events/open-mic" },
    { id: 17, imageSrc: "https://placehold.co/600x315/6a4c93/fff/png", imageAlt: "Yoga in the Park", isLive: true, eventName: "Morning Yoga", eventType: "Wellness", host: "Zen Collective", date: "Jun 21", time: "7:00 AM - 8:00 AM", detailsUrl: "/events/yoga-in-park" },
    { id: 18, imageSrc: "https://placehold.co/600x315/f15bb5/000/png", imageAlt: "Historical Walking Tour", isLive: false, eventName: "City History Tour", eventType: "Tour", host: "Historical Society", date: "Jul 4", time: "11:00 AM - 1:00 PM", detailsUrl: "/events/history-tour" },
    { id: 19, imageSrc: "https://placehold.co/600x315/00f5d4/000/png", imageAlt: "Science Fair", isLive: true, eventName: "Annual Science Fair", eventType: "Exhibition", host: "City College", date: "Jul 22", time: "10:00 AM - 4:00 PM", detailsUrl: "/events/science-fair" },
    { id: 20, imageSrc: "https://placehold.co/600x315/9b5de5/fff/png", imageAlt: "Gaming Tournament", isLive: false, eventName: "Esports Championship", eventType: "Competition", host: "Game On Arena", date: "Aug 11 - 13", time: "All Day", detailsUrl: "/events/esports-championship" },
    { id: 21, imageSrc: "https://placehold.co/600x315/fee440/000/png", imageAlt: "Dog Day Afternoon", isLive: true, eventName: "Dog Day Afternoon", eventType: "Pet-Friendly", host: "Paws Park", date: "Aug 26", time: "1:00 PM - 5:00 PM", detailsUrl: "/events/dog-day" },
    { id: 22, imageSrc: "https://placehold.co/600x315/00bbf9/000/png", imageAlt: "Poetry Slam", isLive: false, eventName: "Poetry Slam", eventType: "Literature", host: "Word Weavers", date: "Sep 8", time: "8:00 PM - 10:00 PM", detailsUrl: "/events/poetry-slam" },
    { id: 23, imageSrc: "https://placehold.co/600x315/52b788/fff/png", imageAlt: "Oktoberfest Celebration", isLive: true, eventName: "Oktoberfest 2025", eventType: "Festival", host: "The Beer Garden", date: "Sep 29 - Oct 1", time: "12:00 PM - 11:00 PM", detailsUrl: "/events/oktoberfest" },
    { id: 24, imageSrc: "https://placehold.co/600x315/c1121f/fff/png", imageAlt: "Haunted House Tour", isLive: false, eventName: "Haunted House", eventType: "Holiday", host: "Spooky Events", date: "Oct 28 - 31", time: "6:00 PM - 12:00 AM", detailsUrl: "/events/haunted-house" },
    { id: 25, imageSrc: "https://placehold.co/600x315/74c69d/000/png", imageAlt: "Cooking Class: Italian", isLive: true, eventName: "Italian Cooking", eventType: "Class", host: "The Chef's Table", date: "Nov 5", time: "5:00 PM - 8:00 PM", detailsUrl: "/events/italian-cooking" },
    { id: 26, imageSrc: "https://placehold.co/600x315/d4a373/000/png", imageAlt: "Board Game Night", isLive: false, eventName: "Board Game Night", eventType: "Meetup", host: "Meeples & More", date: "Nov 17", time: "6:00 PM - 11:00 PM", detailsUrl: "/events/board-games" },
    { id: 27, imageSrc: "https://placehold.co/600x315/4cc9f0/000/png", imageAlt: "Winter Wonderland Market", isLive: true, eventName: "Winter Wonderland", eventType: "Market", host: "City Plaza", date: "Dec 8 - 10", time: "4:00 PM - 9:00 PM", detailsUrl: "/events/winter-market" },
    { id: 28, imageSrc: "https://placehold.co/600x315/f252a3/fff/png", imageAlt: "New Year's Eve Bash", isLive: false, eventName: "NYE 2026 Bash", eventType: "Party", host: "The Grand Ballroom", date: "Dec 31", time: "9:00 PM - 3:00 AM", detailsUrl: "/events/nye-bash" },
    { id: 29, imageSrc: "https://placehold.co/600x315/cb997e/fff/png", imageAlt: "Antique Fair", isLive: true, eventName: "Antique & Collectible Fair", eventType: "Market", host: "Heritage Hall", date: "Jan 20, 2026", time: "9:00 AM - 4:00 PM", detailsUrl: "/events/antique-fair" },
    { id: 30, imageSrc: "https://placehold.co/600x315/6d597a/fff/png", imageAlt: "Wine Tasting Event", isLive: false, eventName: "Vineyard Voyage", eventType: "Food & Drink", host: "Sunset Winery", date: "Feb 11, 2026", time: "3:00 PM - 6:00 PM", detailsUrl: "/events/wine-tasting" }
];

// This function simulates fetching data from an API.
// It takes a `pageParam` which will be our cursor (the index to start from).
export const fetchEvents = async ({ pageParam = 0 }: { pageParam?: number }) => {
	console.log(`Fetching events starting from index: ${pageParam}`);

	// Simulate a network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	const pageSize = 2; // Return 2 events per "page"
	const start = pageParam;
	const end = start + pageSize;

	const pageOfEvents = allEvents.slice(start, end);

	// The `nextCursor` is the crucial part for `useInfiniteQuery`.
	// If there are more events to fetch, we return the index of the next event.
	// If not, we return `undefined`.
	const nextCursor = end < allEvents.length ? end : undefined;

	return {
		events: pageOfEvents,
		nextCursor: nextCursor,
	};
};