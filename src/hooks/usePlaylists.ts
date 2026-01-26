import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useDataFetcher } from './useDataFetcher';
import { useCallback, useEffect, useRef, useState } from 'react';

// Simple in-memory cache for playlists
const playlistsCache = new Map<string, Playlist[]>();

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
    refreshPlaylists: () => void;
}

interface UsePlaylistsOptions {
    projectId: string;
    autoRefresh?: boolean;
    refreshTrigger?: boolean; // Option to trigger refresh
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
    const [refreshKey, setRefreshKey] = useState(0); // State instead of Ref to trigger re-render
    const previousRefreshTrigger = useRef(refreshTrigger);

    const { data: playlists, loading, error } = useDataFetcher<Playlist[]>({
        fetcher: async (token) => {
            const response = await getPlaylists({ projectId, limit: 100, offset: 0, accessToken: token });
            return response.items;
        },
        cacheKey: `${projectId}-${refreshKey}`, // Use state here
        cacheMap: playlistsCache,
        enabled: !!projectId,
    });

    // Function to force refresh
    const refreshPlaylists = useCallback(() => {
        // Invalidate only this project's cache
        const keysToDelete: string[] = [];
        playlistsCache.forEach((_, key) => {
            if (key.startsWith(`${projectId}-`)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => playlistsCache.delete(key));

        // Increment to force new fetch
        setRefreshKey((prev: number) => prev + 1);
    }, [projectId]);

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
