/**
 * Hook to fetch playlists for a project
 * REFACTORED to use useCachedData
 */

import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useCachedData } from './cache/useCachedData';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createCacheManager } from '@cache/CacheManager';

// Shared cache manager for playlists
const playlistsCache = createCacheManager<Playlist[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxItems: 20, // Cache up to 20 projects
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
    // Support both signatures: usePlaylists(projectId) or usePlaylists({ projectId, ... })
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
    });

    // Function to force refresh
    const refreshPlaylists = useCallback(() => {
        // Increment to force new fetch with new cache key
        setRefreshKey((prev: number) => prev + 1);
    }, []);

    // Auto-refresh on mount if requested
    useEffect(() => {
        if (autoRefresh || autoRefreshOption) {
            refreshPlaylists();
        }
    }, [autoRefresh, autoRefreshOption, refreshPlaylists]);

    // Refresh when trigger toggles true
    useEffect(() => {
        if (refreshTrigger && !previousRefreshTrigger.current) {
            refreshPlaylists();
        }
        previousRefreshTrigger.current = refreshTrigger;
    }, [refreshTrigger, refreshPlaylists]);

    return { playlists, loading, error, refreshPlaylists };
}
