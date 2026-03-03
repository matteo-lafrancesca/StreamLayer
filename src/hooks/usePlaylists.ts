/**
 * Hook to fetch playlists for a project
 */

import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useCachedData } from './cache/useCachedData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCacheManager } from '@cache/CacheManager';

const playlistsCache = createCacheManager<Playlist[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 20,
});

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
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

    const { data: playlists, loading, error } = useCachedData<Playlist[]>({
        key: `playlists-${projectId}-${refreshKey}`,
        fetcher: async (token) => {
            const response = await getPlaylists({ projectId, limit: 100, offset: 0, accessToken: token });
            return response.items;
        },
        enabled: !!projectId,
        cacheManager: playlistsCache,
        strategy: 'stale-while-revalidate',
    });

    const refreshPlaylists = useCallback(() => {
        // Increment to force new fetch with new cache key
        setRefreshKey((prev: number) => prev + 1);
    }, []);

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

    return { playlists, loading, error, refreshPlaylists };
}
