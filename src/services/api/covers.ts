const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type CoverSize = 's' | 'm' | 'l';

const COVER_DIMENSIONS: Record<CoverSize, { width: number; height: number }> = {
    s: { width: 150, height: 150 },
    m: { width: 300, height: 300 },
    l: { width: 500, height: 500 },
};

/**
 * Génère l'URL de la cover d'un album
 * @param albumId - L'ID de l'album
 * @param size - Taille de la cover ('s', 'm', ou 'l')
 * @returns URL de la cover de l'album
 */
export function getAlbumCoverUrl(albumId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    return `${API_BASE_URL}/albums/${albumId}/cover.jpg?height=${height}&width=${width}`;
}

/**
 * Génère l'URL de la cover d'une playlist
 * @param playlistId - L'ID de la playlist
 * @param size - Taille de la cover ('s', 'm', ou 'l')
 * @returns URL de la cover de la playlist
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
// Map pour stocker les requêtes en cours et éviter les doublons
const inFlightRequests = new Map<string, Promise<Blob>>();

/**
 * Helper générique pour récupérer une cover avec déduplication
 */
async function fetchCoverWithDeduplication(
    key: string,
    url: string,
    accessToken: string
): Promise<Blob> {
    // Si une requête est déjà en cours pour cette image, on la retourne
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key)!;
    }

    const promise = fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement de la cover: ${response.status}`);
            }
            return await response.blob();
        })
        .finally(() => {
            // Nettoyer la map une fois la requête terminée (succès ou erreur)
            inFlightRequests.delete(key);
        });

    inFlightRequests.set(key, promise);
    return promise;
}

/**
 * Récupère la cover d'un album avec authentification
 * Gère la déduplication des requêtes simultanées
 * @param albumId - L'ID de l'album
 * @param size - Taille de la cover
 * @param accessToken - Token d'accès
 * @returns Blob de l'image
 */
export async function fetchAlbumCover(
    albumId: number,
    size: CoverSize,
    accessToken: string
): Promise<Blob> {
    const key = `album-${albumId}-${size}`;
    const url = getAlbumCoverUrl(albumId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

/**
 * Récupère la cover d'une playlist avec authentification
 * Gère la déduplication des requêtes simultanées
 * @param playlistId - L'ID de la playlist
 * @param size - Taille de la cover
 * @param accessToken - Token d'accès
 * @returns Blob de l'image
 */
export async function fetchPlaylistCover(
    playlistId: number,
    size: CoverSize,
    accessToken: string
): Promise<Blob> {
    const key = `playlist-${playlistId}-${size}`;
    const url = getPlaylistCoverUrl(playlistId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

