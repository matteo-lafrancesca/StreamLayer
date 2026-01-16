import { useState, useEffect } from 'react';
import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { usePlayer } from '@context/PlayerContext';
import { useApi } from './useApi';

// Cache simple en mémoire pour les albums
const albumsCache = new Map<number, Album>();

interface UseAlbumResult {
    album: Album | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook pour récupérer les informations d'un album
 * @param albumId - L'ID de l'album (null si non nécessaire)
 * @returns Album, état de chargement et erreur éventuelle
 */
export function useAlbum(albumId: number | null | undefined): UseAlbumResult {
    const { accessToken } = usePlayer();
    const { authenticatedCall } = useApi();
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Ne rien faire si pas d'albumId ou pas de token
        if (!albumId || !accessToken) {
            setAlbum(null);
            setLoading(false);
            return;
        }

        // Vérifier le cache d'abord
        const cached = albumsCache.get(albumId);
        if (cached) {
            setAlbum(cached);
            setLoading(false);
            return;
        }

        // Sinon, charger depuis l'API
        setLoading(true);
        setError(null);

        // Utiliser authenticatedCall pour gérer le refresh token
        authenticatedCall(async (token) => {
            return await getAlbumInfo(albumId, token);
        })
            .then((albumData) => {
                setAlbum(albumData);
                // Mettre en cache
                albumsCache.set(albumId, albumData);
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [albumId, accessToken, authenticatedCall]);

    return { album, loading, error };
}

