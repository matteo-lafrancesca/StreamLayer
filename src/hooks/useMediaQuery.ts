import { useState, useEffect } from 'react';

/**
 * Hook to detect if viewport matches a media query
 * @param query - CSS media query string (e.g., '(max-width: 750px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create listener
        const listener = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', listener);

        // Cleanup
        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

