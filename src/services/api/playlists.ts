import type { PlaylistsResponse, PlaylistTracksResponse } from '@definitions/playlist';

import { fetchJson } from './client';

interface GetPlaylistsParams {
    projectId: string;
    limit?: number;
    offset?: number;
    accessToken?: string;
}

/**
 * Récupère la liste des playlists (type 1)
 * @param params - Paramètres de la requête (projectId, limit, offset, accessToken)
 * @returns Liste paginée des playlists
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
 * Récupère les tracks d'une playlist
 * @param params - Paramètres de la requête (playlistId, limit, offset, accessToken)
 * @returns Liste paginée des tracks de la playlist
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

