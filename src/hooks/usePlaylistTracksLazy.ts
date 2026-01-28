import { useState, useEffect, useRef } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { persistentCache } from '../cache/PersistentCache';

const BATCH_SIZE = 10; // Batch size: 10 tracks

// Cache for full playlist tracks
const fullTracksCache = new Map<number, Track[]>();

interface UsePlaylistTracksLazyResult {
    tracks: Track[] | null;
    loading: boolean;
    error: Error | null;
    isLoadingMore: boolean;
    totalCount: number | null;
}

/**
 * Hook to lazily fetch playlist tracks.
 * Loads tracks in batches of 10 for fast initial render.
 * @param playlistId - Playlist ID.
 * @param accessToken - Access Token (required to avoid circular dependency).
 * @param expectedTotal - Expected total count (from playlist.nb_items).
 */
export function usePlaylistTracksLazy(
    playlistId: number | null | undefined,
    accessToken: string | null | undefined,
    expectedTotal?: number
): UsePlaylistTracksLazyResult {
    const [tracks, setTracks] = useState<Track[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const loadingRef = useRef(false);
    const currentOffsetRef = useRef(0);

    useEffect(() => {
        if (!playlistId || !accessToken) {
            setTracks(null);
            setTotalCount(null);
            setLoading(false);
            setIsLoadingMore(false);
            currentOffsetRef.current = 0;
            return;
        }

        // 1. Check Memory Cache
        const cached = fullTracksCache.get(playlistId);
        if (cached) {
            setTracks(cached);
            setTotalCount(cached.length);
            setLoading(false);
            setIsLoadingMore(false);
            currentOffsetRef.current = cached.length;
            return;
        }

        // Reset loading ref for this playlist
        loadingRef.current = false;

        // Ref to track mounted state
        const isMounted = { current: true };

        // Avoid double loading
        if (loadingRef.current) return;
        loadingRef.current = true;

        // Function to load a batch
        const loadBatch = async (offset: number, isFirst: boolean) => {
            try {
                if (isFirst) {
                    if (!isMounted.current) return;
                    setLoading(true);
                    setError(null);
                    setTracks(null);
                    setTotalCount(null);
                    currentOffsetRef.current = 0;
                }

                const response = await getPlaylistTracks({
                    playlistId,
                    limit: BATCH_SIZE,
                    offset,
                    accessToken
                });

                if (!isMounted.current) return;

                const actualTotal = expectedTotal ?? response.count_item;

                if (isFirst) {
                    // console.log('[LazyLoad] First batch loaded:', response.items.length, '/', actualTotal);
                    setTracks(response.items);
                    setTotalCount(actualTotal);
                    setLoading(false);
                    currentOffsetRef.current = response.items.length;
                } else {
                    // console.log('[LazyLoad] Batch loaded:', response.items.length, 'tracks (total:', offset + response.items.length, '/', actualTotal, ')');
                    setTracks(prevTracks => {
                        const newTracks = prevTracks ? [...prevTracks, ...response.items] : response.items;
                        currentOffsetRef.current = newTracks.length;

                        // Cache if all tracks loaded
                        if (newTracks.length >= actualTotal) {
                            fullTracksCache.set(playlistId, newTracks);
                            persistentCache.set('data', `playlist-tracks-${playlistId}`, newTracks).catch(console.warn);
                            console.log('[LazyLoad] All tracks loaded and cached');
                        }

                        return newTracks;
                    });
                }

                // Load next batch if needed
                if (offset + response.items.length < actualTotal) {
                    if (isFirst) {
                        setIsLoadingMore(true);
                    }
                    // Small delay to avoid UI blocking
                    setTimeout(() => {
                        if (isMounted.current) {
                            loadBatch(offset + BATCH_SIZE, false);
                        }
                    }, 100);
                } else {
                    setIsLoadingMore(false);
                    loadingRef.current = false;
                }

            } catch (err) {
                if (!isMounted.current) return;
                console.error('[LazyLoad] Load error:', err);
                setError(err instanceof Error ? err : new Error('Error loading tracks'));
                setLoading(false);
                setIsLoadingMore(false);
                loadingRef.current = false;
            }
        };

        // 2. Initial Async Check (Disk) then Load
        const init = async () => {
            try {
                const storedTracks = await persistentCache.get<Track[]>('data', `playlist-tracks-${playlistId}`);
                if (storedTracks) {
                    // Found in Disk
                    if (!isMounted.current) return;
                    setTracks(storedTracks);
                    setTotalCount(storedTracks.length);
                    setLoading(false);
                    setIsLoadingMore(false);
                    fullTracksCache.set(playlistId, storedTracks); // Hydrate memory
                    loadingRef.current = false;
                    return;
                }
            } catch (e) { console.warn(e); }

            // Not found, start batch loading
            loadBatch(0, true);
        };

        init();

        return () => {
            isMounted.current = false;
        };

    }, [playlistId, accessToken, expectedTotal]);

    return {
        tracks,
        loading,
        error,
        isLoadingMore,
        totalCount
    };
}
