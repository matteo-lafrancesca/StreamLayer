import type { PlaylistsResponse, PlaylistTracksResponse } from '@definitions/playlist';

import { fetchJson } from './client';

interface GetPlaylistsParams {
    projectId: string;
    limit?: number;
    offset?: number;
    accessToken?: string;
}

/**
 * Fetches playlists list (type 1).
 * @param params - Request params (projectId, limit, offset, accessToken).
 * @returns Paginated list of playlists.
 */
export async function getPlaylists({
    projectId,
    limit = 10,
    offset = 0,
    accessToken,
}: GetPlaylistsParams): Promise<PlaylistsResponse> {
    const queryString = `project=${projectId}&type=1&limit=${limit}&offset=${offset}`;
    return fetchJson<PlaylistsResponse>(`/lists?${queryString}`, { accessToken });
}

interface GetPlaylistTracksParams {
    playlistId: number;
    limit?: number;
    offset?: number;
    accessToken?: string;
}

/**
 * Fetches tracks of a playlist.
 * @param params - Request params (playlistId, limit, offset, accessToken).
 * @returns Paginated list of tracks.
 */
export async function getPlaylistTracks({
    playlistId,
    limit = 50,
    offset = 0,
    accessToken,
}: GetPlaylistTracksParams): Promise<PlaylistTracksResponse> {
    const queryString = `limit=${limit}&offset=${offset}`;
    return fetchJson<PlaylistTracksResponse>(`/lists/${playlistId}/tracks?${queryString}`, { accessToken });
}

