// src/app/page.tsx

"use client";

import React, { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import EventCard from "@/components/event/EventCard";
import { fetchEvents } from "@/lib/event-query";
import EventCardSkeleton from "@/components/event/EventCardSkeleton";

export default function Feed() {
	const {
		data,
		error,
		status,
		fetchNextPage,
		isFetchingNextPage,
		hasNextPage,
	} = useInfiniteQuery({
		queryKey: ["events"],
		queryFn: fetchEvents,
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextCursor,
	});

	const observerRef = useRef<HTMLDivElement>(null);

	// The Intersection Observer logic remains exactly the same.
	useEffect(() => {
		if (!hasNextPage || !observerRef.current) return;

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				fetchNextPage();
			}
		});

		observer.observe(observerRef.current);
		return () => {
			if (observerRef.current) {
				observer.unobserve(observerRef.current);
			}
		};
	}, [hasNextPage, fetchNextPage]);

	// Check if there are any events across all pages
	const hasAnyEvents = data?.pages.some(page => page.events && page.events.length > 0);

	return (
		<div className="mx-auto max-w-3xl">
			<div className="grid grid-cols-1 gap-4 sm:gap-6">
				{status === "pending" ? (
					<>
						<EventCardSkeleton />
						<EventCardSkeleton />
						<EventCardSkeleton />
					</>
				) : status === "error" ? (
					<p className="col-span-full text-center text-primary">Error: {error.message}</p>
				) : !hasAnyEvents ? (
					// Show "No events found" only when there are truly no events
					<p className="col-span-full text-center text-gray-500 py-8">
						No events found. Create the first event at Harbor!
					</p>
				) : (
					// Render all events from all pages
					data.pages.map((page, i) => (
						<React.Fragment key={i}>
							{page.events && page.events.length > 0 && 
								page.events.map((event) => (
									<EventCard 
										key={event.id} 
										event={event}
									/>
								))
							}
						</React.Fragment>
					))
				)}
				{isFetchingNextPage && (
					<>
						<EventCardSkeleton />
						<EventCardSkeleton />
						<EventCardSkeleton />
					</>
				)}
			</div>
			<div ref={observerRef} style={{ height: "1px" }}></div>
			{!hasNextPage && status === "success" && hasAnyEvents && (
				<p className="mt-8 text-center text-gray-500">
					You&apos;ve reached the last event! Host yours at Harbor.
				</p>
			)}
		</div>
	);
}