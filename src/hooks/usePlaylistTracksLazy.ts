/**
 * Hook to lazily fetch playlist tracks
 */

import { useState, useEffect } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { useApi } from './useApi';
import { useLazyPagination } from './cache/useLazyPagination';
import { createCacheManager } from '@cache/CacheManager';
import { Logger } from '@utils/logger';

const playlistTracksCache = createCacheManager<Track[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 50,
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

    useEffect(() => {
        if (!cacheKey) {
            setCachedTracks(null);
            setCacheChecked(false);
            return;
        }

        // Reset state when key changes
        setCachedTracks(null);
        setCacheChecked(false);

        let isSubscribed = true;

        const checkCache = async () => {
            // Try to get from cache first
            const cached = await playlistTracksCache.get(cacheKey);

            if (!isSubscribed) return;
            setCacheChecked(true);

            if (cached) {
                Logger.info('[usePlaylistTracksLazy] Cache hit:', cached.length);
                setCachedTracks(cached);

                // Background Revalidation (update cache with fresh data)
                // Only if stale (older than 5 minutes)
                const isStale = playlistTracksCache.isStale(cacheKey, 5 * 60 * 1000);

                if (accessToken && isStale) {
                    playlistTracksCache.fetchWithDeduplication(cacheKey, () =>
                        authenticatedCall(async (token) => {
                            Logger.info('[usePlaylistTracksLazy] Revalidating in background...');
                            const response = await getPlaylistTracks({
                                playlistId: playlistId!,
                                limit: expectedTotal ?? 1000,
                                offset: 0,
                                accessToken: token,
                            });

                            if (response.items && response.items.length > 0) {
                                Logger.info('[usePlaylistTracksLazy] Revalidation success, updating cache');
                                if (isSubscribed) {
                                    setCachedTracks(response.items);
                                }
                                return response.items;
                            }
                            return cached;
                        })
                    ).catch((err) => {
                        Logger.error('[usePlaylistTracksLazy] Revalidation failed:', err);
                    });
                }
            }
        };

        checkCache();

        return () => {
            isSubscribed = false;
        };
    }, [cacheKey, accessToken]);

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

    useEffect(() => {
        if (
            cacheKey &&
            pagination.dataKey === playlistId &&
            pagination.items.length > 0 &&
            pagination.totalCount &&
            pagination.items.length >= pagination.totalCount &&
            !pagination.hasMore
        ) {
            Logger.info('[usePlaylistTracksLazy] Pagination complete, caching all tracks...');
            playlistTracksCache.set(cacheKey, pagination.items);
        }
    }, [cacheKey, pagination.items, pagination.totalCount, pagination.hasMore, pagination.dataKey, playlistId]);

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
