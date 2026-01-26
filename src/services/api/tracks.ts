import type { Track } from '@definitions/track';

import { fetchJson } from './client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Generates HLS streaming URL for a track.
 * @param trackId - Track ID.
 * @param accessToken - Optional access token (added as query param).
 * @returns HLS manifest URL (.m3u8).
 */
export function getTrackStreamUrl(trackId: number, accessToken?: string): string {
    const baseUrl = `${API_BASE_URL}/tracks/${trackId}/hls`;
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


