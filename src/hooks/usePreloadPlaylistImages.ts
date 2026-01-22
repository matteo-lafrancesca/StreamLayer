import { useState, useEffect } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { fetchAlbumCover, fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { hasCachedImage, setCachedImage } from '../cache/imageCache';

const PRIORITY_LIMIT = 8; // Nombre d'albums à charger en priorité

export function usePreloadPlaylistImages(
    playlistId: number | null | undefined,
    albumIds: number[],
    playlistCoverSize: CoverSize = 'l',
    albumCoverSize: CoverSize = 's'
): { loading: boolean; error: Error | null } {
    const { accessToken } = usePlayer();

    // Calculer l'état initial : on ne bloque QUE si la playlist ou les 8 premiers albums manquent
    const [loading, setLoading] = useState(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) return true;

        const playlistCached = hasCachedImage(`playlist-${playlistId}-${playlistCoverSize}`);

        // On ne vérifie le cache que pour les IDs prioritaires pour déterminer le "loading" initial
        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        const priorityAlbumsMissing = priorityIds.some(id => !hasCachedImage(`album-${id}-${albumCoverSize}`));

        return !playlistCached || priorityAlbumsMissing;
    });

    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) {
            setLoading(albumIds.length === 0 || !playlistId);
            return;
        }

        const playlistCacheKey = `playlist-${playlistId}-${playlistCoverSize}`;
        const priorityPromises: Promise<void>[] = [];

        // 1. GESTION DE LA PRIORITÉ (Playlist + 8 premiers albums)

        // Charger la cover de la playlist si nécessaire
        if (!hasCachedImage(playlistCacheKey)) {
            priorityPromises.push(
                fetchPlaylistCover(playlistId, playlistCoverSize, accessToken)
                    .then((url) => setCachedImage(playlistCacheKey, url))
                    .catch((err) => console.error(`Erreur playlist:`, err))
            );
        }

        // Identifier les albums prioritaires manquants
        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        priorityIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            if (!hasCachedImage(key)) {
                priorityPromises.push(
                    fetchAlbumCover(albumId, albumCoverSize, accessToken)
                        .then((url) => setCachedImage(key, url))
                        .catch((err) => console.error(`Erreur album priority ${albumId}:`, err))
                );
            }
        });

        // 2. GESTION DU RESTE (Background loading)
        const remainingIds = albumIds.slice(PRIORITY_LIMIT);
        remainingIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            if (!hasCachedImage(key)) {
                // On lance le fetch SANS l'ajouter à priorityPromises
                // Cela remplit le cache en tâche de fond sans bloquer l'UI
                fetchAlbumCover(albumId, albumCoverSize, accessToken)
                    .then((url) => setCachedImage(key, url))
                    .catch(() => { }); // Échec silencieux pour le background
            }
        });

        // 3. DÉBLOCAGE DE L'INTERFACE
        if (priorityPromises.length === 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // On ne wait que les promesses prioritaires
        Promise.all(priorityPromises)
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur de chargement'));
                setLoading(false);
            });

    }, [playlistId, albumIds.join(','), playlistCoverSize, albumCoverSize, accessToken]);

    return { loading, error };
}