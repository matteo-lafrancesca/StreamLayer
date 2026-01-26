const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY_ID = import.meta.env.VITE_API_KEY_ID;
const USER_API = import.meta.env.VITE_USER_API;
const PASSWORD_API = import.meta.env.VITE_PASSWORD_API;

interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

/**
 * Fetches initial tokens (access & refresh).
 * @param projectId - Project ID.
 * @returns Access and refresh tokens.
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
        throw new Error(`Error fetching tokens: ${response.status}`);
    }

    return await response.json();
}

/**
 * Refreshes tokens using refresh_token.
 * @param projectId - Project ID.
 * @param refreshToken - Current refresh token.
 * @returns New access and refresh tokens.
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
        throw new Error(`Error refreshing tokens: ${response.status}`);
    }

    return await response.json();
}

