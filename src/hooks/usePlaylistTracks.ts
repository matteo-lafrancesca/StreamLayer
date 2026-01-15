import { useState, useEffect } from 'react';
import { getPlaylistTracks } from '../services/api/playlists';
import type { Track } from '../types/track';
import { usePlayer } from '../context/PlayerContext';

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
 * @returns Tracks, état de chargement et erreur éventuelle
 */
export function usePlaylistTracks(playlistId: number | null | undefined): UsePlaylistTracksResult {
    const { accessToken } = usePlayer();
    const [tracks, setTracks] = useState<Track[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Ne rien faire si pas de playlist sélectionnée ou pas de token
        if (!playlistId || !accessToken) {
            setTracks(null);
            setLoading(false);
            return;
        }

        // Vérifier le cache d'abord
        const cached = tracksCache.get(playlistId);
        if (cached) {
            setTracks(cached);
            setLoading(false);
            return;
        }

        // Sinon, charger depuis l'API
        setLoading(true);
        setError(null);

        getPlaylistTracks({ playlistId, limit: 100, offset: 0, accessToken })
            .then((response) => {
                setTracks(response.items);
                // Mettre en cache
                tracksCache.set(playlistId, response.items);
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [playlistId, accessToken]);

    return { tracks, loading, error };
}
