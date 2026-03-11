import { useState, useEffect } from 'react';

// Détecte si la fenêtre du navigateur correspond à une requête média (media query)
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        setMatches(mediaQuery.matches);

        const listener = (e: MediaQueryListEvent) => {
            setMatches(e.matches);
        };

        mediaQuery.addEventListener('change', listener);

        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, [query]);

    return matches;
}

