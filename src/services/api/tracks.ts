import type { Track } from '@definitions/track';

import { fetchJson } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Génère l'URL de streaming HLS pour une track
 * @param trackId - L'ID de la track
 * @param accessToken - Token d'accès optionnel (ajouté en query param)
 * @returns L'URL du manifest HLS (.m3u8)
 */
export function getTrackStreamUrl(trackId: number, accessToken?: string): string {
    const baseUrl = `${API_BASE_URL}/tracks/${trackId}/hls`;
    if (accessToken) {
        return `${baseUrl}?authorization=${encodeURIComponent(accessToken)}`;
    }
    return baseUrl;
}

/**
 * Récupère les informations d'une track par son ID
 * @param trackId - L'ID de la track
 * @param accessToken - Token d'accès optionnel
 * @returns Les informations complètes de la track
 */
export async function getTrackInfo(trackId: number, accessToken?: string): Promise<Track> {
    return fetchJson<Track>(`/tracks/${trackId}`, { accessToken });
}


