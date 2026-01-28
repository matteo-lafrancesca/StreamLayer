import { useCallback } from 'react';
import { useAuth } from '@context/AuthContext';
import { fetchAlbumCover, type CoverSize } from '@services/api/covers';
import { useDebouncedImage } from './useDebouncedImage';

/**
 * Hook to load and cache an album cover.
 * Automatically handles caching and loading via useDebouncedImage.
 */
export function useAlbumCover(
    albumId: number | null | undefined,
    size: CoverSize = 'm'
): string | null {
    const { accessToken } = useAuth();

    // Prepare dependencies for the hook
    const shouldLoad = !!albumId && !!accessToken;
    const cacheKey = `album-${albumId}-${size}`;

    // Stable fetch function
    const fetchFn = useCallback(() => {
        return fetchAlbumCover(albumId!, size, accessToken!);
    }, [albumId, size, accessToken]);

    return useDebouncedImage(shouldLoad, cacheKey, fetchFn);
}

