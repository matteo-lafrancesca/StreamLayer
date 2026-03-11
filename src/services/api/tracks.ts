import type { Track } from '@definitions/track';

import { fetchJson } from './client';
import { ConfigManager } from '../../config/ConfigManager';

// Génère l'URL de streaming HLS pour une piste
export function getTrackStreamUrl(trackId: number, accessToken?: string): string {
    const config = ConfigManager.getConfig();
    const baseUrl = `${config.apiBaseUrl}/tracks/${trackId}/hls`;
    
    return accessToken 
        ? `${baseUrl}?authorization=${encodeURIComponent(accessToken)}` 
        : baseUrl;
}

// Récupère les informations d'une piste par son ID
export async function getTrackInfo(trackId: number, accessToken?: string): Promise<Track> {
    return fetchJson<Track>(`/tracks/${trackId}`, { accessToken });
}


