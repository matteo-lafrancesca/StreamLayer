import { useState, useEffect } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { fetchAlbumCover, fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { hasCachedImage, setCachedImage } from '../cache/imageCache';

const PRIORITY_LIMIT = 8; // Number of albums to load with priority

export function usePreloadPlaylistImages(
    playlistId: number | null | undefined,
    albumIds: number[],
    playlistCoverSize: CoverSize = 'l',
    albumCoverSize: CoverSize = 's'
): { loading: boolean; error: Error | null } {
    const { accessToken } = usePlayer();

    // Calculate initial state: only block if playlist or first 8 albums missing
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
        const priorityPromises: Promise<void>[] = [];

        // 1. PRIORITY HANDLING (Playlist + first 8 albums)

        // Load playlist cover if needed
        if (!hasCachedImage(playlistCacheKey)) {
            priorityPromises.push(
                fetchPlaylistCover(playlistId, playlistCoverSize, accessToken)
                    .then((url) => setCachedImage(playlistCacheKey, url))
                    .catch((err) => console.error(`Playlist error:`, err))
            );
        }

        // Identify missing priority albums
        const priorityIds = albumIds.slice(0, PRIORITY_LIMIT);
        priorityIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            if (!hasCachedImage(key)) {
                priorityPromises.push(
                    fetchAlbumCover(albumId, albumCoverSize, accessToken)
                        .then((url) => setCachedImage(key, url))
                        .catch((err) => console.error(`Priority album error ${albumId}:`, err))
                );
            }
        });

        // 2. REMAINING ITEMS (Background loading)
        const remainingIds = albumIds.slice(PRIORITY_LIMIT);
        remainingIds.forEach((albumId) => {
            const key = `album-${albumId}-${albumCoverSize}`;
            if (!hasCachedImage(key)) {
                // Launch fetch WITHOUT adding to priorityPromises (background)
                // Fills cache in background without blocking UI
                fetchAlbumCover(albumId, albumCoverSize, accessToken)
                    .then((url) => setCachedImage(key, url))
                    .catch(() => { }); // Silent failure for background
            }
        });

        // 3. UNBLOCK INTERFACE
        if (priorityPromises.length === 0) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Wait only for priority promises
        Promise.all(priorityPromises)
            .then(() => setLoading(false))
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Loading error'));
                setLoading(false);
            });

    }, [playlistId, albumIds.join(','), playlistCoverSize, albumCoverSize, accessToken]);

    return { loading, error };
}