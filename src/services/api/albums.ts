import type { Album } from '@definitions/album';

import { fetchJson } from './client';

/**
 * Récupère les informations d'un album par son ID
 * @param albumId - L'ID de l'album
 * @param accessToken - Token d'accès optionnel
 * @returns Les informations complètes de l'album
 */
export async function getAlbumInfo(albumId: number, accessToken?: string): Promise<Album> {
    return fetchJson<Album>(`/albums/${albumId}`, { accessToken });
}

