/**
 * Hook to fetch album details
 * REFACTORED to use useCachedData
 */

import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { useCachedData } from './cache/useCachedData';
import { createCacheManager } from '@cache/CacheManager';

// Shared cache manager for albums
const albumsCache = createCacheManager<Album>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxItems: 100, // Cache up to 100 albums
});

interface UseAlbumResult {
    album: Album | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook to fetch album details.
 * @param albumId - The album ID (null if not needed).
 * @returns Album data, loading state, and potential error.
 */
export function useAlbum(albumId: number | null | undefined): UseAlbumResult {
    const { data: album, loading, error } = useCachedData<Album>({
        key: albumId ?? null,
        fetcher: (token) => getAlbumInfo(albumId!, token),
        enabled: !!albumId,
        cacheManager: albumsCache,
    });

    return { album, loading, error };
}
