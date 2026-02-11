/**
 * Unified hook for loading and caching covers (albums + playlists)
 * Replaces useAlbumCover + usePlaylistCover
 */

import { useAuth } from '@context/AuthContext';
import { fetchAlbumCover, fetchPlaylistCover } from '@services/api/covers';
import { useCachedImage } from './cache/useCachedImage';

export type CoverSize = 's' | 'm' | 'l';
export type CoverType = 'album' | 'playlist';

/**
 * Unified hook to load and cache covers for albums or playlists.
 * 
 * @param type - Type of cover ('album' or 'playlist')
 * @param id - Album or Playlist ID
 * @param size - Cover size ('s', 'm', or 'l')
 * @param accessToken - Access token (optional, will use AuthContext if not provided)
 * @returns Blob URL of the cover image, or null if loading/error
 * 
 * @example
 * // Album cover (auto auth)
 * const coverUrl = useCover('album', albumId, 's');
 * 
 * // Playlist cover (manual auth)
 * const coverUrl = useCover('playlist', playlistId, 'l', token);
 */
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
