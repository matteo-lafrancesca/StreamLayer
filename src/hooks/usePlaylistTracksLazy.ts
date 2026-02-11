/**
 * Hook to lazily fetch playlist tracks
 * REFACTORED to use new cache architecture
 * Reduced from ~179 lines to ~80 lines by separating concerns
 */

import { useMemo } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { useCachedData } from './cache/useCachedData';
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

    // Try to get full playlist from cache first
    const { data: cachedTracks, loading: cacheLoading } = useCachedData<Track[]>({
        key: cacheKey,
        fetcher: async (token) => {
            // This fetcher is only called if cache miss
            // We'll use pagination instead, so this is a fallback
            const response = await getPlaylistTracks({
                playlistId: playlistId!,
                limit: expectedTotal ?? 1000,
                offset: 0,
                accessToken: token,
            });
            return response.items;
        },
        enabled: !!playlistId && !!accessToken,
        accessToken,
        cacheManager: playlistTracksCache,
    });

    // IMPORTANT: Always call useLazyPagination BEFORE any conditional returns
    // to respect Rules of Hooks (hooks must be called in same order every render)
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
        enabled: !!playlistId && !!accessToken && !cachedTracks && !cacheLoading,
    });

    // Cache full playlist once all tracks are loaded
    useMemo(() => {
        if (
            cacheKey &&
            pagination.items.length > 0 &&
            pagination.totalCount &&
            pagination.items.length >= pagination.totalCount &&
            !pagination.hasMore
        ) {
            console.log('[usePlaylistTracksLazy] All tracks loaded, caching...');
            playlistTracksCache.set(cacheKey, pagination.items);
        }
    }, [cacheKey, pagination.items, pagination.totalCount, pagination.hasMore]);

    // If we have cached tracks, return them immediately
    if (cachedTracks) {
        return {
            tracks: cachedTracks,
            loading: false,
            error: null,
            isLoadingMore: false,
            totalCount: cachedTracks.length,
        };
    }

    // Otherwise, return pagination results
    return {
        tracks: pagination.items.length > 0 ? pagination.items : null,
        loading: pagination.loading,
        error: pagination.error,
        isLoadingMore: pagination.loadingMore,
        totalCount: pagination.totalCount,
    };
}
