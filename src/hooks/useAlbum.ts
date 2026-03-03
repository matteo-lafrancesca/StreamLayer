/**
 * Hook to fetch album details
 */

import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { useCachedData } from './cache/useCachedData';
import { createCacheManager } from '@cache/CacheManager';

const albumsCache = createCacheManager<Album>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 100,
});

interface UseAlbumResult {
    album: Album | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook to fetch album details.
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
