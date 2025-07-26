## Feature: Infinite Scroll Event Feed

This document outlines the architecture and implementation of the infinite scroll event feed feature.

The feed is built using TanStack Query for robust data fetching, the Intersection Observer API for seamless automatic loading, and ShadCN UI for consistent styling and loading skeletons.

### 1. Infinite Query with `useInfiniteQuery`

The data fetching logic is managed by TanStack Query's `useInfiniteQuery` hook.

-   **`queryKey: ["events"]`**: A unique key to identify and cache this data.
-   **`queryFn: fetchEvents`**: The asynchronous function from `lib/api.ts` that fetches a "page" of data.
-   **`initialPageParam: 0`**: We tell the query to start fetching from the beginning (index `0`).
-   **`getNextPageParam: (lastPage) => lastPage.nextCursor`**: This is the core of the infinite scroll. This function inspects the last fetched page of data. If that page includes a `nextCursor` value, it returns it as the `pageParam` for the next fetch. If `nextCursor` is `undefined`, it tells `useInfiniteQuery` that there is no more data to load.

### 2. Automatic Fetching with Intersection Observer

We use the `IntersectionObserver` API to automatically fetch data when the user scrolls near the end of the list.

-   **`useRef`**: A `ref` (`observerRef`) is attached to an invisible `div` at the bottom of the event list.
-   **`useEffect`**: This hook sets up the `IntersectionObserver` to watch the invisible `div`.
-   **Callback**: When the `div` becomes visible in the viewport (`isIntersecting` is true), the observer's callback function calls `fetchNextPage()`.
-   **Cleanup**: The `useEffect` hook returns a cleanup function to disconnect the observer, preventing memory leaks.

### 3. Advanced Loading States

We provide a seamless loading experience by handling two distinct states:

1.  **Initial Load (`status === 'pending'`)**: When the page first loads, we show a set of `EventCardSkeleton` components to give an immediate impression of the page layout.
2.  **Subsequent Loads (`isFetchingNextPage`)**: When the user scrolls and `fetchNextPage` is called, this boolean becomes true. We use it to render skeletons at the *end* of the existing list while the new data is fetched.

### 4. Miscellaneous

We added a QueryClientProvider at the root layout of (main). This is so that infinite queries can work and is a prerequisite for using TanStack Query.

## Customization & Future Improvements

-   **Connect to a Real Backend**: Modify the `fetchEvents` function in `src/lib/api.ts` to make a real `fetch` or `axios` call to your backend API. Ensure your backend supports cursor-based pagination.
-   **Enhanced Error Handling**: Add more robust error UI, such as a "Retry" button if a fetch fails.
-   **Refactor to a Custom Hook**: The logic in `page.tsx` could be extracted into a custom hook (e.g., `useInfiniteEvents()`) to make it even more reusable.
-   **Add Pull-to-Refresh**: For mobile devices, implement pull-to-refresh functionality to refetch the first page of data.