import { tokenManager } from '@services/tokenManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions extends RequestInit {
    accessToken?: string;
}

/**
 * Generic helper for JSON API requests.
 * Handles base URL, auth headers, and JSON parsing.
 */

export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { accessToken, ...customOptions } = options;

    const headers: Record<string, string> = {
        ...customOptions.headers as Record<string, string>,
    };

    let currentToken = accessToken;

    if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }

    // Handle absolute or relative URLs
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    let response = await fetch(url, {
        ...customOptions,
        headers,
    });

    // Handle token expiration (401) or Forbidden (403) which acts as expired for this API
    if (response.status === 401 || response.status === 403) {
        try {
            console.log(`[API] Token issue (${response.status}), attempting refresh...`);
            const newToken = await tokenManager.refreshAccessToken();

            // Retry with new token
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, {
                ...customOptions,
                headers,
            });
            console.log('[API] Retry successful');
        } catch (error) {
            console.error('[API] Token refresh failed or retry failed:', error);
            // Let original 401 or refresh error propagate
            throw error;
        }
    }

    return response;
}

export async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    const response = await apiFetch(endpoint, { ...options, headers });

    if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${response.statusText}`);
    }

    return await response.json();
}
