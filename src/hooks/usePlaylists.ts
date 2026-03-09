/**
 * Hook to lazily fetch playlists for a project
 */

import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCacheManager } from '@cache/CacheManager';
import { useLazyPagination } from './cache/useLazyPagination';
import { useApi } from './useApi';
import { Logger } from '@utils/logger';

const playlistsCache = createCacheManager<Playlist[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 20,
});

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
    isLoadingMore: boolean;
    totalCount: number | null;
    refreshPlaylists: () => void;
}

interface UsePlaylistsOptions {
    projectId: string;
    autoRefresh?: boolean;
    refreshTrigger?: boolean;
}

export function usePlaylists(
    projectIdOrOptions: string | UsePlaylistsOptions,
    autoRefresh = false
): UsePlaylistsResult {
    const options = typeof projectIdOrOptions === 'string'
        ? { projectId: projectIdOrOptions, autoRefresh, refreshTrigger: undefined }
        : projectIdOrOptions;

    const { projectId, autoRefresh: autoRefreshOption = false, refreshTrigger } = options;
    const [refreshKey, setRefreshKey] = useState(0);
    const previousRefreshTrigger = useRef(refreshTrigger);

    const { authenticatedCall } = useApi();

    // State for cached playlists (instant load)
    const [cachedPlaylists, setCachedPlaylists] = useState<Playlist[] | null>(null);
    const [cacheChecked, setCacheChecked] = useState(false);

    // Map cache to a stable key
    const stableCacheKey = projectId ? `playlists-${projectId}` : null;
    const paginationKey = projectId ? `playlists-${projectId}-${refreshKey}` : null;

    useEffect(() => {
        if (!stableCacheKey) {
            setCachedPlaylists(null);
            setCacheChecked(false);
            return;
        }

        let isSubscribed = true;

        const checkCache = async () => {
            const cached = await playlistsCache.get(stableCacheKey);

            if (!isSubscribed) return;
            setCacheChecked(true);

            if (cached) {
                Logger.info('[usePlaylists] Cache hit:', cached.length);
                setCachedPlaylists(cached);

                // Background Revalidation
                const isStale = playlistsCache.isStale(stableCacheKey, 5 * 60 * 1000);

                if (isStale) {
                    playlistsCache.fetchWithDeduplication(stableCacheKey, () =>
                        authenticatedCall(async (token) => {
                            Logger.info('[usePlaylists] Revalidating in background...');
                            const response = await getPlaylists({
                                projectId,
                                limit: 1000,
                                offset: 0,
                                accessToken: token,
                            });
                            if (response.items && response.items.length > 0) {
                                Logger.info('[usePlaylists] Revalidation success, updating cache');
                                if (isSubscribed) {
                                    setCachedPlaylists(response.items);
                                }
                                return response.items;
                            }
                            return cached;
                        })
                    ).catch((err) => {
                        Logger.error('[usePlaylists] Revalidation failed:', err);
                    });
                }
            }
        };

        checkCache();

        return () => {
            isSubscribed = false;
        };
    }, [stableCacheKey, projectId, authenticatedCall, refreshKey]);

    const pagination = useLazyPagination<Playlist>({
        key: paginationKey,
        fetcher: async (offset, limit) => {
            return authenticatedCall(async (token) => {
                const response = await getPlaylists({
                    projectId,
                    limit,
                    offset,
                    accessToken: token,
                });
                return {
                    items: response.items,
                    total: response.count_item || response.items.length,
                    // Fallback to items.length if count_item is not provided
                };
            });
        },
        batchSize: 50,
        enabled: !!paginationKey && cacheChecked && !cachedPlaylists,
    });

    useEffect(() => {
        if (
            stableCacheKey &&
            paginationKey &&
            pagination.dataKey === paginationKey &&
            pagination.items.length > 0 &&
            pagination.totalCount !== null &&
            pagination.items.length >= pagination.totalCount &&
            !pagination.hasMore
        ) {
            Logger.info('[usePlaylists] Pagination complete, caching all playlists...');
            playlistsCache.set(stableCacheKey, pagination.items);
        }
    }, [stableCacheKey, paginationKey, pagination.items, pagination.totalCount, pagination.hasMore, pagination.dataKey]);

    const refreshPlaylists = useCallback(() => {
        if (stableCacheKey) {
            playlistsCache.delete(stableCacheKey);
        }
        setCachedPlaylists(null);
        setRefreshKey((prev: number) => prev + 1);
    }, [stableCacheKey]);

    useEffect(() => {
        if (autoRefresh || autoRefreshOption) {
            refreshPlaylists();
        }
    }, [autoRefresh, autoRefreshOption, refreshPlaylists]);

    useEffect(() => {
        if (refreshTrigger && !previousRefreshTrigger.current) {
            refreshPlaylists();
        }
        previousRefreshTrigger.current = refreshTrigger;
    }, [refreshTrigger, refreshPlaylists]);

    if (cachedPlaylists) {
        return {
            playlists: cachedPlaylists,
            loading: false,
            error: null,
            isLoadingMore: false,
            totalCount: cachedPlaylists.length,
            refreshPlaylists,
        };
    }

    return {
        playlists: pagination.items.length > 0 ? pagination.items : null,
        loading: pagination.loading && !cacheChecked,
        error: pagination.error,
        isLoadingMore: pagination.loadingMore,
        totalCount: pagination.totalCount,
        refreshPlaylists,
    };
}
