// Pré-charge les images de couverture des playlists et albums pour fluidifier l'affichage

import { useState, useEffect } from 'react';
import { Logger } from '@utils/system';
import { useAuth } from '@context/AuthContext';
import { fetchAlbumCover, fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { hasCachedBlobUrl, setCachedBlobUrl } from '@cache/blobUrlCache';
import { persistentCache } from '@cache/PersistentCache';

const PRIORITY_LIMIT = 8; // Number of albums to load with priority

export function usePreloadPlaylistImages(
    playlistId: number | null | undefined,
    albumIds: number[],
    playlistCoverSize: CoverSize = 'l',
    albumCoverSize: CoverSize = 's'
): { loading: boolean; error: Error | null } {
    const { accessToken } = useAuth();

    const [loading, setLoading] = useState(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) return true;

        const playlistCached = hasCachedBlobUrl(`playlist-${playlistId}-${playlistCoverSize}`);

        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        const priorityAlbumsMissing = priorityIds.some(id => !hasCachedBlobUrl(`album-${id}-${albumCoverSize}`));

        return !playlistCached || priorityAlbumsMissing;
    });

    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isSubscribed = true;

        if (!accessToken || !playlistId || albumIds.length === 0) {
            setLoading(albumIds.length === 0 || !playlistId);
            return;
        }

        const playlistCacheKey = `playlist-${playlistId}-${playlistCoverSize}`;

        const ensureImageLoaded = async (key: string, fetcher: () => Promise<string>) => {
            if (hasCachedBlobUrl(key)) return;

            const storedBlob = await persistentCache.get<Blob>('images', key);
            if (storedBlob) {
                setCachedBlobUrl(key, URL.createObjectURL(storedBlob));
                return;
            }

            const url = await fetcher();

            try {
                const response = await fetch(url);
                const blob = await response.blob();
                await persistentCache.set('images', key, blob);
            } catch (err) {
                Logger.warn(`[usePreload] Échec de persistance pour ${key} :`, err);
            }

            setCachedBlobUrl(key, url);
        };

        const priorityPromises: Promise<void>[] = [];

        priorityPromises.push(
            ensureImageLoaded(playlistCacheKey, () => fetchPlaylistCover(playlistId, playlistCoverSize, accessToken))
                .catch((err) => Logger.error(`Erreur chargement playlist :`, err))
        );

        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        priorityIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            priorityPromises.push(
                ensureImageLoaded(key, () => fetchAlbumCover(albumId, albumCoverSize, accessToken))
                    .catch((err) => Logger.error(`Erreur album prioritaire ${albumId} :`, err))
            );
        });

        const remainingIds = albumIds.slice(PRIORITY_LIMIT);

        setTimeout(() => {
            remainingIds.forEach((albumId) => {
                const key = `album-${albumId}-${albumCoverSize}`;
                ensureImageLoaded(key, () => fetchAlbumCover(albumId, albumCoverSize, accessToken))
                    .catch(() => { });
            });
        }, 500);

        setLoading(true);
        setError(null);

        Promise.all(priorityPromises)
            .then(() => {
                if (isSubscribed) setLoading(false);
            })
            .catch((err) => {
                if (isSubscribed) {
                    setError(err instanceof Error ? err : new Error('Loading error'));
                    setLoading(false);
                }
            });

        return () => {
            isSubscribed = false;
        };
    }, [playlistId, albumIds.join(','), playlistCoverSize, albumCoverSize, accessToken]);

    return { loading, error };
}
