import type { Track } from '../../types/track';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Récupère les informations d'une track par son ID
 * @param trackId - L'ID de la track
 * @param accessToken - Token d'accès optionnel
 * @returns Les informations complètes de la track
 */
export async function getTrackInfo(trackId: number, accessToken?: string): Promise<Track> {
    const url = `${API_BASE_URL}/tracks/${trackId}`;

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
        throw new Error(`Erreur lors de la récupération de la track: ${response.status}`);
    }

    return await response.json();
}
