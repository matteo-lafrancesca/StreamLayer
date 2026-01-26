import type { Album } from '@definitions/album';

import { fetchJson } from './client';

/**
 * Fetches album info by ID.
 * @param albumId - Album ID.
 * @param accessToken - Optional access token.
 * @returns Complete album info.
 */
export async function getAlbumInfo(albumId: number, accessToken?: string): Promise<Album> {
    return fetchJson<Album>(`/albums/${albumId}`, { accessToken });
}

