import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useDataFetcher } from './useDataFetcher';
import { useCallback, useEffect, useRef, useState } from 'react';

// Cache simple en mémoire pour les playlists
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
    refreshTrigger?: boolean; // Nouvelle option pour déclencher le rafraîchissement
}

export function usePlaylists(
    projectIdOrOptions: string | UsePlaylistsOptions,
    autoRefresh = false
): UsePlaylistsResult {
    // Support pour les deux signatures: usePlaylists(projectId) ou usePlaylists({ projectId, ... })
    const options = typeof projectIdOrOptions === 'string'
        ? { projectId: projectIdOrOptions, autoRefresh, refreshTrigger: undefined }
        : projectIdOrOptions;

    const { projectId, autoRefresh: autoRefreshOption = false, refreshTrigger } = options;
    const [refreshKey, setRefreshKey] = useState(0); // State au lieu de Ref pour déclencher le re-render
    const previousRefreshTrigger = useRef(refreshTrigger);

    const { data: playlists, loading, error } = useDataFetcher<Playlist[]>({
        fetcher: async (token) => {
            const response = await getPlaylists({ projectId, limit: 100, offset: 0, accessToken: token });
            return response.items;
        },
        cacheKey: `${projectId}-${refreshKey}`, // Utilise le state ici
        cacheMap: playlistsCache,
        enabled: !!projectId,
    });

    // Fonction pour forcer le rafraîchissement
    const refreshPlaylists = useCallback(() => {
        // Invalider uniquement le cache de ce projet
        const keysToDelete: string[] = [];
        playlistsCache.forEach((_, key) => {
            if (key.startsWith(`${projectId}-`)) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(key => playlistsCache.delete(key));

        // Incrémenter pour forcer un nouveau fetch
        setRefreshKey((prev: number) => prev + 1);
    }, [projectId]);

    // Auto-refresh au montage si demandé
    useEffect(() => {
        if (autoRefresh || autoRefreshOption) {
            refreshPlaylists();
        }
    }, [autoRefresh, autoRefreshOption, refreshPlaylists]);

    // Refresh quand refreshTrigger passe de false à true
    useEffect(() => {
        if (refreshTrigger && !previousRefreshTrigger.current) {
            refreshPlaylists();
        }
        previousRefreshTrigger.current = refreshTrigger;
    }, [refreshTrigger, refreshPlaylists]);

    return { playlists, loading, error, refreshPlaylists };
}
