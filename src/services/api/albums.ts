import type { Album } from '@definitions/album';

import { fetchJson } from './client';

// Récupère les informations d'un album par son ID
export async function getAlbumInfo(albumId: number, accessToken?: string): Promise<Album> {
    return fetchJson<Album>(`/albums/${albumId}`, { accessToken });
}

