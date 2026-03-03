import type { Track } from '@definitions/track';

import { fetchJson } from './client';
import { ConfigManager } from '../../config/ConfigManager';

/**
 * Generates HLS streaming URL for a track.
 * @param trackId - Track ID.
 * @param accessToken - Optional access token (added as query param).
 * @returns HLS manifest URL (.m3u8).
 */
export function getTrackStreamUrl(trackId: number, accessToken?: string): string {
    const config = ConfigManager.getConfig();
    const baseUrl = `${config.apiBaseUrl}/tracks/${trackId}/hls`;
    if (accessToken) {
        return `${baseUrl}?authorization=${encodeURIComponent(accessToken)}`;
    }
    return baseUrl;
}

/**
 * Fetches track info by ID.
 * @param trackId - Track ID.
 * @param accessToken - Optional access token.
 * @returns Complete track info.
 */
export async function getTrackInfo(trackId: number, accessToken?: string): Promise<Track> {
    return fetchJson<Track>(`/tracks/${trackId}`, { accessToken });
}


