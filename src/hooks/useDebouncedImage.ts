import { useState, useEffect } from 'react';
import { getCachedImage, setCachedImage } from '../cache/imageCache';

/**
 * Generic hook to handle debounced image fetching with caching.
 * @param shouldLoad - Condition to start loading (e.g., presence of ID and token)
 * @param cacheKey - Unique key for the cache
 * @param fetchFn - Function to fetch the image URL (must return a Promise<string>)
 * @param delay - Debounce delay in ms (default: 200)
 */
export function useDebouncedImage(
    shouldLoad: boolean,
    cacheKey: string,
    fetchFn: () => Promise<string>,
    delay: number = 200
): string | null {
    // Initialize from cache if possible for immediate render
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!shouldLoad) return null;
        return getCachedImage(cacheKey);
    });

    useEffect(() => {
        if (!shouldLoad) {
            setBlobUrl(null);
            return;
        }

        // 1. Check cache immediately (synchronous)
        const cached = getCachedImage(cacheKey);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        // 2. Schedule fetch with debounce
        const timeoutId = setTimeout(() => {
            fetchFn()
                .then((url) => {
                    setCachedImage(cacheKey, url);
                    setBlobUrl(url);
                })
                .catch((error) => {
                    console.error(`[useDebouncedImage] Load failed for ${cacheKey}:`, error);
                    setBlobUrl(null);
                });
        }, delay);

        // 3. Cleanup on unmount or dependency change
        return () => {
            clearTimeout(timeoutId);
        };
    }, [shouldLoad, cacheKey, fetchFn, delay]);

    return blobUrl;
}
