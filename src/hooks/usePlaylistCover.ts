import { useState, useEffect } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { getCachedImage, setCachedImage } from '../cache/imageCache';

/**
 * Hook pour charger et mettre en cache la cover d'une playlist
 * Gère automatiquement le cache et le chargement
 */
export function usePlaylistCover(
    playlistId: number | null | undefined,
    size: CoverSize = 'm'
): string | null {
    const { accessToken } = usePlayer();
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!playlistId) return null;
        const cacheKey = `playlist-${playlistId}-${size}`;
        return getCachedImage(cacheKey);
    });

    useEffect(() => {
        if (!playlistId || !accessToken) {
            setBlobUrl(null);
            return;
        }

        const cacheKey = `playlist-${playlistId}-${size}`;

        // Vérifier le cache d'abord
        const cached = getCachedImage(cacheKey);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        // Charger l'image si pas en cache
        fetchPlaylistCover(playlistId, size, accessToken)
            .then((url) => {
                setCachedImage(cacheKey, url);
                setBlobUrl(url);
            })
            .catch((error) => {
                console.error(`Erreur chargement cover playlist ${playlistId}:`, error);
                setBlobUrl(null);
            });
    }, [playlistId, size, accessToken]);

    return blobUrl;
}

