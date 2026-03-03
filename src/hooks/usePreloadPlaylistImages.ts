/**
 * Hook to preload playlist and album covers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import { fetchAlbumCover, fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { hasCachedImage, setCachedImage } from '../cache/imageCache';
import { persistentCache } from '../cache/PersistentCache';

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

        const playlistCached = hasCachedImage(`playlist-${playlistId}-${playlistCoverSize}`);

        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        const priorityAlbumsMissing = priorityIds.some(id => !hasCachedImage(`album-${id}-${albumCoverSize}`));

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
            if (hasCachedImage(key)) return;

            const storedBlob = await persistentCache.get<Blob>('images', key);
            if (storedBlob) {
                setCachedImage(key, URL.createObjectURL(storedBlob));
                return;
            }

            const url = await fetcher();

            try {
                const response = await fetch(url);
                const blob = await response.blob();
                await persistentCache.set('images', key, blob);
            } catch (err) {
                console.warn(`[usePreload] Failed to persist ${key}:`, err);
            }

            setCachedImage(key, url);
        };

        const priorityPromises: Promise<void>[] = [];

        priorityPromises.push(
            ensureImageLoaded(playlistCacheKey, () => fetchPlaylistCover(playlistId, playlistCoverSize, accessToken))
                .catch((err) => console.error(`Playlist load error:`, err))
        );

        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        priorityIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            priorityPromises.push(
                ensureImageLoaded(key, () => fetchAlbumCover(albumId, albumCoverSize, accessToken))
                    .catch((err) => console.error(`Priority album error ${albumId}:`, err))
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