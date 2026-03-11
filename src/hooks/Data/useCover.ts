/**
 * Unified hook for loading and caching covers (albums + playlists)
 */

import { useAuth } from '@context/AuthContext';
import { fetchAlbumCover, fetchPlaylistCover } from '@services/api/covers';
import { useCachedImage } from '../cache/useCachedImage';

export type CoverSize = 's' | 'm' | 'l';
export type CoverType = 'album' | 'playlist';

// Hook unifié pour charger et mettre en cache les couvertures (albums ou playlists)
export function useCover(
    type: CoverType,
    id: number | null | undefined,
    size: CoverSize,
    providedToken?: string | null
): string | null {
    const { accessToken: authToken } = useAuth();
    const accessToken = providedToken ?? authToken;

    const shouldLoad = !!id && !!accessToken;
    const cacheKey = shouldLoad ? `${type}-${id}-${size}` : null;

    return useCachedImage({
        key: cacheKey,
        fetcher: () => {
            if (type === 'album') {
                return fetchAlbumCover(id!, size, accessToken!);
            } else {
                return fetchPlaylistCover(id!, size, accessToken!);
            }
        },
        enabled: shouldLoad,
    });
}
