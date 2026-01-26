import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { useDataFetcher } from './useDataFetcher';

// Simple in-memory cache for albums (data)
const albumsCache = new Map<number, Album>();
// Cache for in-flight requests (promises)
const albumsPromiseCache = new Map<number, Promise<Album>>();

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
    const { data: album, loading, error } = useDataFetcher<Album>({
        fetcher: (token) => getAlbumInfo(albumId!, token),
        cacheKey: albumId!,
        cacheMap: albumsCache,
        inFlightMap: albumsPromiseCache,
        enabled: !!albumId,
    });

    return { album, loading, error };
}

