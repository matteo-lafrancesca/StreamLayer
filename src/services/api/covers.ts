import { apiFetch } from './client';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    return `${API_BASE_URL}/albums/${albumId}/cover.jpg?height=${height}&width=${width}`;
}

/**
 * Generates playlist cover URL.
 * @param playlistId - Playlist ID.
 * @param size - Cover size ('s', 'm', or 'l').
 * @returns Playlist cover URL.
 */
export function getPlaylistCoverUrl(playlistId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    return `${API_BASE_URL}/lists/${playlistId}/cover.jpg?height=${height}&width=${width}`;
}

/**
 * Récupère la cover d'un album avec authentification
 * @param albumId - L'ID de l'album
 * @param size - Taille de la cover
 * @param accessToken - Token d'accès
 * @returns Blob de l'image
 */
// Map to store in-flight requests for deduplication
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
    // If request already in progress, return it
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key)!;
    }

    const promise = apiFetch(url, {
        accessToken,
        // Important: fetch in 'cors' mode if needed (default usually fine)
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Error loading cover: ${response.status}`);
            }
            const blob = await response.blob();
            // Create unique URL here, shared by all callers
            return URL.createObjectURL(blob);
        })
        .finally(() => {
            // Clean map once request finishes (success or error)
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

