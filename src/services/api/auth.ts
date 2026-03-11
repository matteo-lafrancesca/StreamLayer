import { ConfigManager } from '../../config/ConfigManager';

interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

// Récupère les tokens initiaux (access & refresh)
export async function getInitialTokens(projectId: string): Promise<TokenResponse> {
    const config = ConfigManager.getConfig();
    const url = `${config.apiBaseUrl}/projects/${projectId}/token?apikey_id=${config.apiKeyId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            login: config.userApi,
            password: config.passwordApi,
        }),
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des tokens (Status: ${response.status})`);
    }

    return await response.json();
}

// Rafraîchit les tokens avec le refresh_token
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
        throw new Error(`Erreur lors du rafraîchissement des tokens (Status: ${response.status})`);
    }

    return await response.json();
}

