import type { Album } from '../../types/album';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Récupère les informations d'un album par son ID
 * @param albumId - L'ID de l'album
 * @param accessToken - Token d'accès optionnel
 * @returns Les informations complètes de l'album
 */
export async function getAlbumInfo(albumId: number, accessToken?: string): Promise<Album> {
    const url = `${API_BASE_URL}/albums/${albumId}`;

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
        throw new Error(`Erreur lors de la récupération de l'album: ${response.status}`);
    }

    return await response.json();
}
