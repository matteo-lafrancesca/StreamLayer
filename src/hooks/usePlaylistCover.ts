import { useCallback } from 'react';
import { useAuth } from '@context/AuthContext';
import { fetchPlaylistCover, type CoverSize } from '@services/api/covers';
import { useDebouncedImage } from './useDebouncedImage';

/**
 * Hook to load and cache a playlist cover.
 * Automatically handles caching via useDebouncedImage.
 */
export function usePlaylistCover(
    playlistId: number | null | undefined,
    size: CoverSize = 'm'
): string | null {
    const { accessToken } = useAuth();

    // Prepare dependencies
    const shouldLoad = !!playlistId && !!accessToken;
    const cacheKey = `playlist-${playlistId}-${size}`;

    // Stable fetch function
    const fetchFn = useCallback(() => {
        return fetchPlaylistCover(playlistId!, size, accessToken!);
    }, [playlistId, size, accessToken]);

    return useDebouncedImage(shouldLoad, cacheKey, fetchFn);
}

