import type { PlaylistsResponse, PlaylistTracksResponse } from '../../types/playlist';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
    const url = `${API_BASE_URL}/lists?project=${projectId}&type=1&limit=${limit}&offset=${offset}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des playlists: ${response.status}`);
    }

    return await response.json();
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
    const url = `${API_BASE_URL}/lists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des tracks de la playlist: ${response.status}`);
    }

    return await response.json();
}
