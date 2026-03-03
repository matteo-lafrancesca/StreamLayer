/**
 * @deprecated This hook is deprecated. Use `useCachedImage` from `@hooks/cache/useCachedImage` instead.
 */

import { useState, useEffect } from 'react';
import { getCachedImage, setCachedImage } from '../cache/imageCache';
import { persistentCache } from '../cache/PersistentCache';

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
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!shouldLoad) return null;
        return getCachedImage(cacheKey);
    });

    useEffect(() => {
        let isSubscribed = true;

        if (!shouldLoad) {
            setBlobUrl(null);
            return;
        }

        const cached = getCachedImage(cacheKey);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                const storedBlob = await persistentCache.get<Blob>('images', cacheKey);

                if (!isSubscribed) return;

                if (storedBlob) {
                    const url = URL.createObjectURL(storedBlob);
                    setCachedImage(cacheKey, url);
                    setBlobUrl(url);
                    return;
                }

                const url = await fetchFn();

                if (!isSubscribed) return;

                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    await persistentCache.set('images', cacheKey, blob);
                } catch (err) {
                    console.warn(`[useDebouncedImage] Failed to persist ${cacheKey}:`, err);
                }

                if (!isSubscribed) return;

                setCachedImage(cacheKey, url);
                setBlobUrl(url);

            } catch (error) {
                if (!isSubscribed) return;
                console.error(`[useDebouncedImage] Load failed for ${cacheKey}:`, error);
                setBlobUrl(null);
            }
        }, delay);

        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [shouldLoad, cacheKey, fetchFn, delay]);

    return blobUrl;
}
