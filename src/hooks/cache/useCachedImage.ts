/**
 * Generic hook for caching images (Blobs)
 * Replaces useDebouncedImage with cleaner implementation
 */

import { useState, useEffect, useRef } from 'react';
import { getCachedImage, setCachedImage } from '@cache/imageCache';
import { persistentCache } from '@cache/PersistentCache';

export interface UseCachedImageOptions {
    /** Unique cache key */
    key: string | null;
    /** Function to fetch image URL */
    fetcher: () => Promise<string>;
    /** Whether to enable fetching (default: true) */
    enabled?: boolean;
    /** Debounce delay in ms (default: 200) */
    debounce?: number;
}

/**
 * Generic hook for caching images
 * Strategy: Memory (blob URL) → Disk (IndexedDB Blob) → Network
 * 
 * @example
 * const imageUrl = useCachedImage({
 *   key: `album-${albumId}-${size}`,
 *   fetcher: () => getAlbumCover(albumId, size, token),
 * });
 */
export function useCachedImage({
    key,
    fetcher,
    enabled = true,
    debounce = 200,
}: UseCachedImageOptions): string | null {
    // Initialize from memory cache for instant render
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!enabled || !key) return null;
        return getCachedImage(key);
    });

    // Store fetcher in ref to avoid it triggering useEffect on every render
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    useEffect(() => {
        if (!enabled || !key) {
            setBlobUrl(null);
            return;
        }

        // 1. Check Memory Cache (synchronous)
        const cached = getCachedImage(key);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        // 2. Schedule Async Load (Disk → Network)
        const timeoutId = setTimeout(async () => {
            try {
                // A. Check Disk Cache (IndexedDB)
                const storedBlob = await persistentCache.get<Blob>('images', key);

                if (storedBlob) {
                    // Found in disk, create blob URL
                    const url = URL.createObjectURL(storedBlob);
                    setCachedImage(key, url);
                    setBlobUrl(url);
                    return;
                }

                // B. Fetch from Network (use ref to get latest fetcher)
                const url = await fetcherRef.current();

                // C. Persist to Disk
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    await persistentCache.set('images', key, blob);
                } catch (err) {
                    console.warn(`[useCachedImage] Failed to persist ${key}:`, err);
                }

                // D. Cache in Memory
                setCachedImage(key, url);
                setBlobUrl(url);

            } catch (error) {
                console.error(`[useCachedImage] Load failed for ${key}:`, error);
                setBlobUrl(null);
            }
        }, debounce);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [enabled, key, debounce]); // Removed 'fetcher' from dependencies

    return blobUrl;
}
