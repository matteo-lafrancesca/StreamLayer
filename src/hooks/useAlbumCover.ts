import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { fetchAlbumCover, type CoverSize } from '../services/api/covers';
import { getCachedImage, setCachedImage } from '../cache/imageCache';

/**
 * Hook pour charger et mettre en cache la cover d'un album
 * Gère automatiquement le cache et le chargement
 */
export function useAlbumCover(
    albumId: number | null | undefined,
    size: CoverSize = 'm'
): string | null {
    const { accessToken } = usePlayer();
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!albumId || !accessToken) {
            setBlobUrl(null);
            return;
        }

        const cacheKey = `album-${albumId}-${size}`;

        // Vérifier le cache d'abord
        const cached = getCachedImage(cacheKey);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        // Charger l'image si pas en cache
        fetchAlbumCover(albumId, size, accessToken)
            .then((blob) => {
                const objectUrl = URL.createObjectURL(blob);
                setCachedImage(cacheKey, objectUrl);
                setBlobUrl(objectUrl);
            })
            .catch((error) => {
                console.error(`Erreur chargement cover album ${albumId}:`, error);
                setBlobUrl(null);
            });
    }, [albumId, size, accessToken]);

    return blobUrl;
}
