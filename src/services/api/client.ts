import { tokenManager } from '@services/tokenManager';
import { ApiError } from '@definitions/../types/ApiError';

import { ConfigManager } from '../../config/ConfigManager';

interface FetchOptions extends RequestInit {
    accessToken?: string;
}

/**
 * Low-level helper for API requests.
 * Uses tokenManager to handle auth if a token is provided.
 */
export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
    const { accessToken, ...customOptions } = options;

    const performFetch = async (token?: string) => {
        const headers: Record<string, string> = {
            ...customOptions.headers as Record<string, string>,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = ConfigManager.getConfig();
        const url = endpoint.startsWith('http') ? endpoint : `${config.apiBaseUrl}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(url, {
                ...customOptions,
                headers,
                signal: controller.signal
            });

            if (response.status === 401 || response.status === 403) {
                throw new ApiError(`Auth Error: ${response.statusText}`, response.status);
            }

            return response;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new ApiError('Request Timeout', 408);
            }
            throw error;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    if (accessToken || tokenManager.getAccessToken()) {
        return await tokenManager.callWithAuth((token) => performFetch(token));
    }

    return await performFetch();
}

/**
 * Generic helper for JSON API requests.
 */
export async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    const response = await apiFetch(endpoint, { ...options, headers });

    if (!response.ok) {
        throw new ApiError(
            `API Error: ${response.statusText}`,
            response.status
        );
    }

    return await response.json();
}
