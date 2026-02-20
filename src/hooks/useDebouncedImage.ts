/**
 * @deprecated This hook is deprecated. Use `useCachedImage` from `@hooks/cache/useCachedImage` instead.
 * 
 * Migration example:
 * ```ts
 * // Old:
 * const imageUrl = useDebouncedImage(shouldLoad, cacheKey, fetchFn, 200);
 * 
 * // New:
 * const imageUrl = useCachedImage({
 *   key: shouldLoad ? cacheKey : null,
 *   fetcher: fetchFn,
 *   debounce: 200,
 * });
 * ```
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
    // Initialize from cache if possible for immediate render
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!shouldLoad) return null;
        return getCachedImage(cacheKey);
    });

    useEffect(() => {
        let isSubscribed = true;

        if (!shouldLoad) {
            // Keep previous image if it was loaded? No, follow shouldLoad.
            // But usually we want to keep showing until new one replaces it?
            // Existing logic cleared it. adhering to existing logic.
            setBlobUrl(null);
            return;
        }

        // 1. Check Memory Cache immediately (synchronous)
        const cached = getCachedImage(cacheKey);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        // 2. Schedule Async checks (Disk -> Network)
        const timeoutId = setTimeout(async () => {
            try {
                // A. Check Persistent Cache (Disk)
                const storedBlob = await persistentCache.get<Blob>('images', cacheKey);

                if (!isSubscribed) return;

                if (storedBlob) {
                    const url = URL.createObjectURL(storedBlob);
                    setCachedImage(cacheKey, url);
                    setBlobUrl(url);
                    return;
                }

                // B. Fetch from Network (if not in disk)
                const url = await fetchFn();

                if (!isSubscribed) return;

                // C. Persist to Disk (Get Blob from URL and save)
                // We fetch the blob back from the object URL to store it
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

        // 3. Cleanup on unmount or dependency change
        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [shouldLoad, cacheKey, fetchFn, delay]);

    return blobUrl;
}
