import { ConfigManager } from '../../config/ConfigManager';

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
    const config = ConfigManager.getConfig();
    const url = `${config.apiBaseUrl}/projects/${projectId}/token?apikey_id=${config.apiKeyId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            login: config.userApi,
            password: config.passwordApi,
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
    const config = ConfigManager.getConfig();
    const url = `${config.apiBaseUrl}/projects/${projectId}/token`;

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

