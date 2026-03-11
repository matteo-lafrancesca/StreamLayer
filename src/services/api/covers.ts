import { apiFetch } from './client';
import { ConfigManager } from '../../config/ConfigManager';

export type CoverSize = 's' | 'm' | 'l';

const COVER_DIMENSIONS: Record<CoverSize, { width: number; height: number }> = {
    s: { width: 150, height: 150 },
    m: { width: 300, height: 300 },
    l: { width: 500, height: 500 },
};

// Génère l'URL de la couverture d'un album
export function getAlbumCoverUrl(albumId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    const config = ConfigManager.getConfig();
    return `${config.apiBaseUrl}/albums/${albumId}/cover.jpg?height=${height}&width=${width}`;
}

// Génère l'URL de la couverture d'une playlist
export function getPlaylistCoverUrl(playlistId: number, size: CoverSize = 'm'): string {
    const { width, height } = COVER_DIMENSIONS[size];
    const config = ConfigManager.getConfig();
    return `${config.apiBaseUrl}/lists/${playlistId}/cover.jpg?height=${height}&width=${width}`;
}

const inFlightRequests = new Map<string, Promise<string>>();

// Helper interne pour charger une couverture avec dédoublonnement des requêtes
async function fetchCoverWithDeduplication(
    key: string,
    url: string,
    accessToken: string
): Promise<string> {
    if (inFlightRequests.has(key)) {
        return inFlightRequests.get(key)!;
    }

    const promise = apiFetch(url, { accessToken })
        .then(async (response) => {
            if (!response.ok) {
                throw new Error(`Erreur chargement couverture : ${response.status}`);
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

// Récupère la couverture d'un album avec authentification
export async function fetchAlbumCover(
    albumId: number,
    size: CoverSize,
    accessToken: string
): Promise<string> {
    const key = `album-${albumId}-${size}`;
    const url = getAlbumCoverUrl(albumId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

// Récupère la couverture d'une playlist avec authentification
export async function fetchPlaylistCover(
    playlistId: number,
    size: CoverSize,
    accessToken: string
): Promise<string> {
    const key = `playlist-${playlistId}-${size}`;
    const url = getPlaylistCoverUrl(playlistId, size);
    return fetchCoverWithDeduplication(key, url, accessToken);
}

