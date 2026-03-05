import { useEffect, useRef } from 'react';
import type { Track } from '@definitions/track';
import { getTrackStreamUrl } from '@services/api/tracks';
import { appendAuthToUrl, extractFirstHlsUrl } from '@utils/hls';

const PRELOAD_COUNT = 5;

/**
 * Hook to preload upcoming tracks in the queue into the browser's session cache.
 */
export function useTrackPreloader(
    queue: Track[],
    currentIndex: number,
    accessToken: string | null
) {
    const preloadedTrackIds = useRef<Set<number>>(new Set());

    useEffect(() => {
        if (!accessToken || queue.length === 0) return;

        let isMounted = true;

        const nextTracks = queue.slice(currentIndex + 1, currentIndex + 1 + PRELOAD_COUNT);
        const tracksToLoad = nextTracks.filter(track => !preloadedTrackIds.current.has(track.id));

        if (tracksToLoad.length === 0) return;

        const runPreload = async () => {
            for (const track of tracksToLoad) {
                if (!isMounted) return;

                preloadedTrackIds.current.add(track.id);

                if (preloadedTrackIds.current.size > 50) {
                    const first = preloadedTrackIds.current.values().next().value;
                    if (first) preloadedTrackIds.current.delete(first);
                }

                await preloadHls(track.id, accessToken);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const streamUrl = getTrackStreamUrl(trackId, accessToken);
        const manifestResponse = await fetch(streamUrl, { signal: controller.signal });
        if (!manifestResponse.ok) return;

        const manifestText = await manifestResponse.text();
        const nextUrl = extractFirstHlsUrl(manifestText);

        if (nextUrl) {
            const resolvedUrl = new URL(nextUrl, manifestResponse.url).toString();
            const finalUrl = appendAuthToUrl(resolvedUrl, accessToken);
            await fetch(finalUrl, { signal: controller.signal });
        }

    } catch (err) {
        if ((err as Error).name !== 'AbortError') {
            console.warn(`[Preloader] Failed to preload track ${trackId}`, err);
        }
    } finally {
        clearTimeout(timeoutId);
    }
}
