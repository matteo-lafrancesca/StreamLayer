import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { useDataFetcher } from './useDataFetcher';

// Cache simple en mémoire pour les playlists
const playlistsCache = new Map<string, Playlist[]>();

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
}

export function usePlaylists(projectId: string): UsePlaylistsResult {
    const { data: playlists, loading, error } = useDataFetcher<Playlist[]>({
        fetcher: async (token) => {
            const response = await getPlaylists({ projectId, limit: 100, offset: 0, accessToken: token });
            return response.items;
        },
        cacheKey: projectId,
        cacheMap: playlistsCache,
        enabled: !!projectId,
    });

    return { playlists, loading, error };
}

