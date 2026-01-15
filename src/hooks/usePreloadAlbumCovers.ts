import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { fetchAlbumCover, type CoverSize } from '../services/api/covers';
import { hasCachedImage, setCachedImage } from '../cache/imageCache';

/**
 * Hook pour précharger toutes les covers d'une liste d'albums
 * Optimisé pour charger en batch avec état initial calculé de manière synchrone
 */
export function usePreloadAlbumCovers(
    albumIds: number[],
    size: CoverSize = 's'
): { loading: boolean; error: Error | null } {
    const { accessToken } = usePlayer();

    // Calculer l'état initial de manière synchrone
    const [loading, setLoading] = useState(() => {
        if (!accessToken || albumIds.length === 0) return true;
        // Vérifier si au moins une image manque dans le cache
        return albumIds.some(id => !hasCachedImage(`album-${id}-${size}`));
    });

    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!accessToken || albumIds.length === 0) {
            setLoading(albumIds.length === 0); // true si pas de tracks encore
            return;
        }

        // Filtrer les images manquantes
        const missingAlbumIds = albumIds.filter(id =>
            !hasCachedImage(`album-${id}-${size}`)
        );

        // Si tout est en cache, pas besoin de charger
        if (missingAlbumIds.length === 0) {
            setLoading(false);
            return;
        }

        // Charger les images manquantes en parallèle
        setLoading(true);
        setError(null);

        const loadPromises = missingAlbumIds.map((albumId) =>
            fetchAlbumCover(albumId, size, accessToken)
                .then((blob) => {
                    const objectUrl = URL.createObjectURL(blob);
                    setCachedImage(`album-${albumId}-${size}`, objectUrl);
                })
                .catch((err) => {
                    console.error(`Erreur chargement cover album ${albumId}:`, err);
                    return null; // Continue même si une image échoue
                })
        );

        Promise.all(loadPromises)
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur de chargement'));
                setLoading(false);
            });
    }, [albumIds.join(','), size, accessToken]);

    return { loading, error };
}
