// src/app/page.tsx

"use client";

import React, { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/event/EventCard";
import { fetchEvents } from "@/lib/event-query";
import { EventCardSkeleton } from "@/components/event/EventCardSkeleton"; // --- UPDATED IMPORT ---

export default function Home() {
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

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-4 sm:gap-6">
					{/* --- UPDATED LOGIC --- */}

					{status === "pending" ? (
						// Show ShadCN skeletons on initial load
						<>
							<EventCardSkeleton />
							<EventCardSkeleton />
							<EventCardSkeleton />
						</>
					) : status === "error" ? (
						<p className="col-span-full text-center text-red-500">Error: {error.message}</p>
					) : (
						// Render the loaded pages
						data.pages.map((page, i) => (
							<React.Fragment key={i}>
								{page.events.map((event) => (
									<EventCard key={event.id} {...event} />
								))}
							</React.Fragment>
						))
					)}

					{/* Show ShadCN skeletons while the *next* page is fetching */}
					{isFetchingNextPage && (
						<>
							<EventCardSkeleton />
							<EventCardSkeleton />
							<EventCardSkeleton />
						</>
					)}
				</div>

				{/* The invisible trigger element (no changes here) */}
				<div ref={observerRef} style={{ height: "1px" }}></div>

				{/* End of content message (no changes here) */}
				{!hasNextPage && status === "success" && (
					<p className="mt-8 text-center text-gray-500">
						You&apos;ve reached the last event! Host yours at Harbor.
					</p>
				)}
			</div>
		</div>
	);
}