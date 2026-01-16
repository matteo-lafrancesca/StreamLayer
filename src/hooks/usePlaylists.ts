import { useState, useEffect } from 'react';
import { getPlaylists } from '@services/api/playlists';
import type { Playlist } from '@definitions/playlist';
import { usePlayer } from '@context/PlayerContext';
import { useApi } from './useApi';

// Cache simple en mémoire pour les playlists
const playlistsCache = new Map<string, Playlist[]>();

interface UsePlaylistsResult {
    playlists: Playlist[] | null;
    loading: boolean;
    error: Error | null;
}

export function usePlaylists(projectId: string): UsePlaylistsResult {
    const { accessToken } = usePlayer();
    const { authenticatedCall } = useApi();
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

        // Utiliser authenticatedCall pour gérer le refresh token
        authenticatedCall(async (token) => {
            return await getPlaylists({ projectId, limit: 100, offset: 0, accessToken: token });
        })
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
    }, [projectId, accessToken, authenticatedCall]); // authenticatedCall is stable or changes with tokens

    return { playlists, loading, error };
}

