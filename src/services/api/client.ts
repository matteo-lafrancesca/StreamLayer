const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions extends RequestInit {
    accessToken?: string;
}

/**
 * Helper générique pour les requêtes API JSON
 * Gère l'URL de base, les headers d'authentification et le parsing JSON
 */
export async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { accessToken, ...customOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        .../* @ts-ignore HeadersInit compatibility */ customOptions.headers as Record<string, string>,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Gestion des URLs absolues ou relatives
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...customOptions,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
    }

    return await response.json();
}
