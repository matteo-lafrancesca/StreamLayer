/**
 * Hook to lazily fetch playlist tracks
 * REFACTORED to use new cache architecture
 * Reduced from ~179 lines to ~80 lines by separating concerns
 */

import { useMemo, useState, useEffect } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { useApi } from './useApi';
import { useLazyPagination } from './cache/useLazyPagination';
import { createCacheManager } from '@cache/CacheManager';

// Shared cache manager for playlist tracks
const playlistTracksCache = createCacheManager<Track[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxItems: 50, // Cache up to 50 playlists
});

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
 * 
 * Strategy:
 * 1. Check cache for full playlist (instant load if cached)
 * 2. If not cached, use lazy pagination to load in batches
 * 3. Once all tracks loaded, cache the full playlist
 * 
 * @param playlistId - Playlist ID
 * @param accessToken - Access Token
 * @param expectedTotal - Expected total count (from playlist.nb_items)
 */
export function usePlaylistTracksLazy(
    playlistId: number | null | undefined,
    accessToken: string | null | undefined,
    expectedTotal?: number
): UsePlaylistTracksLazyResult {
    const cacheKey = playlistId ? `playlist-tracks-${playlistId}` : null;
    const { authenticatedCall } = useApi(accessToken);

    // State for cached tracks (instant load)
    const [cachedTracks, setCachedTracks] = useState<Track[] | null>(null);
    const [cacheChecked, setCacheChecked] = useState(false);

    // 1. Initial Cache Check & Background Revalidation
    useEffect(() => {
        if (!cacheKey) {
            setCachedTracks(null);
            setCacheChecked(false);
            return;
        }

        const checkCache = async () => {
            // Try to get from cache first
            const cached = await playlistTracksCache.get(cacheKey);
            setCacheChecked(true);

            if (cached) {
                console.log('[usePlaylistTracksLazy] Cache hit:', cached.length);
                setCachedTracks(cached);

                // Background Revalidation (update cache with fresh data)
                // Only if stale (older than 5 minutes)
                const isStale = playlistTracksCache.isStale(cacheKey, 5 * 60 * 1000);

                if (accessToken && isStale) {
                    playlistTracksCache.fetchWithDeduplication(cacheKey, () =>
                        authenticatedCall(async (token) => {
                            console.log('[usePlaylistTracksLazy] Revalidating in background...');
                            const response = await getPlaylistTracks({
                                playlistId: playlistId!,
                                limit: expectedTotal ?? 1000,
                                offset: 0,
                                accessToken: token,
                            });

                            if (response.items && response.items.length > 0) {
                                console.log('[usePlaylistTracksLazy] Revalidation success, updating cache');
                                setCachedTracks(response.items);
                                return response.items;
                            }
                            return cached;
                        })
                    ).catch((err) => {
                        console.error('[usePlaylistTracksLazy] Revalidation failed:', err);
                    });
                }
            }
        };

        checkCache();
    }, [cacheKey, accessToken]);

    // 2. Lazy Pagination (Only if NO cache)
    const pagination = useLazyPagination<Track>({
        key: playlistId ?? null,
        fetcher: async (offset, limit) => {
            const response = await getPlaylistTracks({
                playlistId: playlistId!,
                limit,
                offset,
                accessToken: accessToken!,
            });
            return {
                items: response.items,
                total: expectedTotal ?? response.count_item,
            };
        },
        batchSize: 10,
        expectedTotal,
        // Only trigger lazy loading if we CHECKED cache and it was EMPTY
        enabled: !!playlistId && !!accessToken && cacheChecked && !cachedTracks,
    });

    // 3. Update Cache when Pagination Completes
    useMemo(() => {
        if (
            cacheKey &&
            pagination.items.length > 0 &&
            pagination.totalCount &&
            pagination.items.length >= pagination.totalCount &&
            !pagination.hasMore
        ) {
            console.log('[usePlaylistTracksLazy] Pagination complete, caching all tracks...');
            playlistTracksCache.set(cacheKey, pagination.items);
        }
    }, [cacheKey, pagination.items, pagination.totalCount, pagination.hasMore]);

    // Return Data
    if (cachedTracks) {
        return {
            tracks: cachedTracks,
            loading: false,
            error: null,
            isLoadingMore: false,
            totalCount: cachedTracks.length,
        };
    }

    return {
        tracks: pagination.items.length > 0 ? pagination.items : null,
        loading: pagination.loading && !cacheChecked,
        error: pagination.error,
        isLoadingMore: pagination.loadingMore,
        totalCount: pagination.totalCount,
    };
}
