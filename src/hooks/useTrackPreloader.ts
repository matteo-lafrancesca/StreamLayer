import { useEffect, useRef } from 'react';
import type { Track } from '@definitions/track';
import { getTrackStreamUrl } from '@services/api/tracks';
import { appendAuthToUrl, extractFirstHlsUrl } from '@utils/hls';

const PRELOAD_COUNT = 5;

/**
 * Hook to preload upcoming tracks in the queue into the browser's session cache.
 * Explicitly fetches the m3u8 manifest and the first audio segments.
 */
export function useTrackPreloader(
    queue: Track[],
    currentIndex: number,
    accessToken: string | null
) {
    // Keep track of preloaded IDs to avoid re-fetching
    // This persists for the lifecycle of the provider (App session)
    const preloadedTrackIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        if (!accessToken || queue.length === 0) return;

        let isMounted = true;

        // 1. Identify next tracks
        const nextTracks = queue.slice(currentIndex + 1, currentIndex + 1 + PRELOAD_COUNT);

        // 2. Filter out already preloaded ones
        const tracksToLoad = nextTracks.filter(track => !preloadedTrackIds.current.has(track.id));

        if (tracksToLoad.length === 0) return;

        // 3. Process sequentially to prevent network congestion
        const runPreload = async () => {
            console.log('[Preloader] Starting preout for:', tracksToLoad.map(t => t.title));

            for (const track of tracksToLoad) {
                if (!isMounted) return;

                // Mark as preloaded before fetch to avoid race in next render
                preloadedTrackIds.current.add(track.id);

                // Prevent memory leak: keep only last 50 tracks in history
                if (preloadedTrackIds.current.size > 50) {
                    const first = preloadedTrackIds.current.values().next().value;
                    if (first) preloadedTrackIds.current.delete(first);
                }

                await preloadHls(track.id, accessToken);

                // Small delay between tracks to let UI breathe
                await new Promise(r => setTimeout(r, 200));
            }
        };

        runPreload();

        return () => {
            isMounted = false;
        };
    }, [queue, currentIndex, accessToken]);
}

/**
 * Fetches HLS manifest and first segment to warm up browser cache.
 */
async function preloadHls(trackId: number, accessToken: string) {
    try {
        // 1. Get Main Manifest URL (with auth param)
        const streamUrl = getTrackStreamUrl(trackId, accessToken);

        // A. Fetch Manifest
        const manifestResponse = await fetch(streamUrl);
        if (!manifestResponse.ok) return;

        const manifestText = await manifestResponse.text();

        // B. Parse First Segment or Variant
        const nextUrl = extractFirstHlsUrl(manifestText);

        if (nextUrl) {
            // C. Resolve relative URL
            const resolvedUrl = new URL(nextUrl, manifestResponse.url).toString();

            // D. Attach Auth Token (using shared logic)
            const finalUrl = appendAuthToUrl(resolvedUrl, accessToken);

            // E. Fetch Sub-resource (warm up cache)
            await fetch(finalUrl);
        }

    } catch (err) {
        console.warn(`[Preloader] Failed to preload track ${trackId}`, err);
    }
}
