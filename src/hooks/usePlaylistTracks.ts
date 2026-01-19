import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { useDataFetcher } from './useDataFetcher';

// Cache simple en mémoire pour les tracks par playlist
const tracksCache = new Map<number, Track[]>();

interface UsePlaylistTracksResult {
    tracks: Track[] | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook pour récupérer les tracks d'une playlist
 * @param playlistId - L'ID de la playlist (null si aucune sélectionnée)
 * @param accessToken - Optional access token (to avoid circular dependency when used in PlayerContext)
 * @returns Tracks, état de chargement et erreur éventuelle
 */
export function usePlaylistTracks(
    playlistId: number | null | undefined,
    accessToken?: string | null
): UsePlaylistTracksResult {
    const { data: tracks, loading, error } = useDataFetcher<Track[]>({
        fetcher: async (token) => {
            const response = await getPlaylistTracks({ playlistId: playlistId!, limit: 100, offset: 0, accessToken: token });
            return response.items;
        },
        cacheKey: playlistId!,
        cacheMap: tracksCache,
        enabled: !!playlistId,
        accessToken, // Pass through to avoid circular dependency
    });

    return { tracks, loading, error };
}

