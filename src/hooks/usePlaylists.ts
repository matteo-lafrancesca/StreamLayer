import { useState, useEffect } from 'react';
import { getPlaylists } from '../services/api/playlists';
import type { Playlist } from '../types/playlist';
import { usePlayer } from '../context/PlayerContext';

// Cache simple en mémoire pour les playlists
const playlistsCache = new Map<string, Playlist[]>();

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook pour récupérer toutes les playlists d'un projet
 * @param projectId - L'ID du projet
 * @returns Playlists, état de chargement et erreur éventuelle
 */
export function usePlaylists(projectId: string): UsePlaylistsResult {
    const { accessToken } = usePlayer();
    const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Attendre que l'accessToken soit disponible
        if (!accessToken) {
            setLoading(true);
            return;
        }

        // Vérifier le cache d'abord
        const cached = playlistsCache.get(projectId);
        if (cached) {
            setPlaylists(cached);
            setLoading(false);
            return;
        }

        // Sinon, charger depuis l'API
        setLoading(true);
        setError(null);

        getPlaylists({ projectId, limit: 100, offset: 0, accessToken })
            .then((response) => {
                setPlaylists(response.items);
                // Mettre en cache
                playlistsCache.set(projectId, response.items);
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [projectId, accessToken]);

    return { playlists, loading, error };
}
