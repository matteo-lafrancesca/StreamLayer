import { useState, useEffect } from 'react';

/**
 * Hook to delay content display until images are ready.
 * Prevents placeholder flash by keeping content invisible until ready.
 * 
 * @param isLoading - Whether content is loading.
 * @param delay - Delay in ms to allow decoding (default: 50ms).
 * @returns isVisible - True when content can be displayed.
 */
export function useImageReadyState(isLoading: boolean, delay = 50): boolean {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Small delay to let browser decode images
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isLoading, delay]);

    return isVisible;
}
