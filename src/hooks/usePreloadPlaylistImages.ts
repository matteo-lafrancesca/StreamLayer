import { useState, useEffect } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { fetchAlbumCover, fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { hasCachedImage, setCachedImage } from '../cache/imageCache';

/**
 * Hook pour précharger la cover d'une playlist ET toutes les covers des albums
 * Gère un état de chargement global pour éviter d'afficher des placeholders
 */
export function usePreloadPlaylistImages(
    playlistId: number | null | undefined,
    albumIds: number[],
    playlistCoverSize: CoverSize = 'l',
    albumCoverSize: CoverSize = 's'
): { loading: boolean; error: Error | null } {
    const { accessToken } = usePlayer();

    // Calculer l'état initial de manière synchrone
    const [loading, setLoading] = useState(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) return true;

        // Vérifier si la cover de la playlist est en cache
        const playlistCached = hasCachedImage(`playlist-${playlistId}-${playlistCoverSize}`);

        // Vérifier si au moins une cover d'album manque
        const albumsMissing = albumIds.some(id => !hasCachedImage(`album-${id}-${albumCoverSize}`));

        return !playlistCached || albumsMissing;
    });

    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) {
            setLoading(albumIds.length === 0 || !playlistId);
            return;
        }

        const playlistCacheKey = `playlist-${playlistId}-${playlistCoverSize}`;
        const missingImages: Promise<void>[] = [];

        // Charger la cover de la playlist si nécessaire
        if (!hasCachedImage(playlistCacheKey)) {
            missingImages.push(
                fetchPlaylistCover(playlistId, playlistCoverSize, accessToken)
                    .then((url) => {
                        setCachedImage(playlistCacheKey, url);
                    })
                    .catch((err) => {
                        console.error(`Erreur chargement cover playlist ${playlistId}:`, err);
                    })
            );
        }

        // Charger les covers d'albums manquantes
        const missingAlbumIds = albumIds.filter(id =>
            !hasCachedImage(`album-${id}-${albumCoverSize}`)
        );

        missingAlbumIds.forEach((albumId) => {
            missingImages.push(
                fetchAlbumCover(albumId, albumCoverSize, accessToken)
                    .then((url) => {
                        setCachedImage(`album-${albumId}-${albumCoverSize}`, url);
                    })
                    .catch((err) => {
                        console.error(`Erreur chargement cover album ${albumId}:`, err);
                    })
            );
        });

        // Si tout est en cache, pas besoin de charger
        if (missingImages.length === 0) {
            setLoading(false);
            return;
        }

        // Charger toutes les images manquantes en parallèle
        setLoading(true);
        setError(null);

        Promise.all(missingImages)
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur de chargement'));
                setLoading(false);
            });
    }, [playlistId, albumIds.join(','), playlistCoverSize, albumCoverSize, accessToken]);

    return { loading, error };
}
