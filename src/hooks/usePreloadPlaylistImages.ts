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

    // Calculate initial state: only block if playlist or first 8 albums missing from MEMORY
    const [loading, setLoading] = useState(() => {
        if (!accessToken || !playlistId || albumIds.length === 0) return true;

        const playlistCached = hasCachedImage(`playlist-${playlistId}-${playlistCoverSize}`);

        // Check cache only for priority IDs to determine initial loading
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

        // Helper to ensure image is in memory (Disk -> Network -> Memory)
        const ensureImageLoaded = async (key: string, fetcher: () => Promise<string>) => {
            if (hasCachedImage(key)) return;

            // 1. Check Disk
            const storedBlob = await persistentCache.get<Blob>('images', key);
            if (storedBlob) {
                setCachedImage(key, URL.createObjectURL(storedBlob));
                return;
            }

            // 2. Fetch Network
            const url = await fetcher();

            // 3. Persist
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

        // 1. PRIORITY HANDLING (Playlist + first 8 albums)

        // Load playlist cover if needed
        priorityPromises.push(
            ensureImageLoaded(playlistCacheKey, () => fetchPlaylistCover(playlistId, playlistCoverSize, accessToken))
                .catch((err) => console.error(`Playlist load error:`, err))
        );

        // Identify priority albums
        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        priorityIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            priorityPromises.push(
                ensureImageLoaded(key, () => fetchAlbumCover(albumId, albumCoverSize, accessToken))
                    .catch((err) => console.error(`Priority album error ${albumId}:`, err))
            );
        });

        // 2. REMAINING ITEMS (Background loading)
        const remainingIds = albumIds.slice(PRIORITY_LIMIT);

        // Process remaining in chunks or just fire and forget (with small delay to prioritize UI)
        setTimeout(() => {
            remainingIds.forEach((albumId) => {
                const key = `album-${albumId}-${albumCoverSize}`;
                ensureImageLoaded(key, () => fetchAlbumCover(albumId, albumCoverSize, accessToken))
                    .catch(() => { });
            });
        }, 500);

        // 3. UNBLOCK INTERFACE
        // We set loading=true initially, now wait for priority
        setLoading(true);
        setError(null);

        Promise.all(priorityPromises)
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Loading error'));
                setLoading(false);
            });

    }, [playlistId, albumIds.join(','), playlistCoverSize, albumCoverSize, accessToken]);

    return { loading, error };
}