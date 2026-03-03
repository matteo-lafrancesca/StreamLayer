import { apiFetch } from './client';
import { ConfigManager } from '../../config/ConfigManager';

export type CoverSize = 's' | 'm' | 'l';

const COVER_DIMENSIONS: Record<CoverSize, { width: number; height: number }> = {
    s: { width: 150, height: 150 },
    m: { width: 300, height: 300 },
    l: { width: 500, height: 500 },
};

/**
 * Generates album cover URL.
 * @param albumId - Album ID.
 * @param size - Cover size ('s', 'm', or 'l').
 * @returns Album cover URL.
 */
export function getAlbumCoverUrl(albumId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    const config = ConfigManager.getConfig();
    return `${config.apiBaseUrl}/albums/${albumId}/cover.jpg?height=${height}&width=${width}`;
}

/**
 * Generates playlist cover URL.
 * @param playlistId - Playlist ID.
 * @param size - Cover size ('s', 'm', or 'l').
 * @returns Playlist cover URL.
 */
export function getPlaylistCoverUrl(playlistId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    const config = ConfigManager.getConfig();
    return `${config.apiBaseUrl}/lists/${playlistId}/cover.jpg?height=${height}&width=${width}`;
}

const inFlightRequests = new Map<string, Promise<string>>();

/**
 * Generic helper to fetch cover with deduplication.
 * Returns a URL (string) instead of Blob to share reference.
 */
async function fetchCoverWithDeduplication(
    key: string,
    url: string,
    accessToken: string
): Promise<string> {
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key)!;
    }

    const promise = apiFetch(url, {
        accessToken,
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Error loading cover: ${response.status}`);
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        })
        .finally(() => {
            inFlightRequests.delete(key);
        });

    inFlightRequests.set(key, promise);
    return promise;
}

/**
 * Fetches album cover with authentication.
 * Handles deduplication of concurrent requests.
 * @param albumId - Album ID.
 * @param size - Cover size.
 * @param accessToken - Access token.
 * @returns Image URL (string).
 */
export async function fetchAlbumCover(
    albumId: number,
    size: CoverSize,
    accessToken: string
): Promise<string> {
    const key = `album-${albumId}-${size}`;
    const url = getAlbumCoverUrl(albumId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

/**
 * Fetches playlist cover with authentication.
 * Handles deduplication of concurrent requests.
 * @param playlistId - Playlist ID.
 * @param size - Cover size.
 * @param accessToken - Access token.
 * @returns Image URL (string).
 */
export async function fetchPlaylistCover(
    playlistId: number,
    size: CoverSize,
    accessToken: string
): Promise<string> {
    const key = `playlist-${playlistId}-${size}`;
    const url = getPlaylistCoverUrl(playlistId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

