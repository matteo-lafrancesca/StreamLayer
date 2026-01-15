const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY_ID = import.meta.env.VITE_API_KEY_ID;
const USER_API = import.meta.env.VITE_USER_API;
const PASSWORD_API = import.meta.env.VITE_PASSWORD_API;

interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

/**
 * Récupère les tokens initiaux (access_token et refresh_token)
 * @param projectId - L'ID du projet
 * @returns Les tokens d'accès et de rafraîchissement
 */
export async function getInitialTokens(projectId: string): Promise<TokenResponse> {
    const url = `${API_BASE_URL}/projects/${projectId}/token?apikey_id=${API_KEY_ID}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: USER_API,
            password: PASSWORD_API,
        }),
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des tokens: ${response.status}`);
    }

    return await response.json();
}

/**
 * Rafraîchit les tokens en utilisant le refresh_token
 * @param projectId - L'ID du projet
 * @param refreshToken - Le refresh token actuel
 * @returns Les nouveaux tokens d'accès et de rafraîchissement
 */
export async function refreshTokens(projectId: string, refreshToken: string): Promise<TokenResponse> {
    const url = `${API_BASE_URL}/projects/${projectId}/token`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur lors du rafraîchissement des tokens: ${response.status}`);
    }

    return await response.json();
}
