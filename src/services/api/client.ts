import { tokenManager } from '@services/tokenManager';
import { ApiError } from '@definitions/../types/ApiError';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

        const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, { ...customOptions, headers });

        // Explicitly throw on 401/403 so callWithAuth can catch and trigger token refresh
        if (response.status === 401 || response.status === 403) {
            throw new ApiError(`Auth Error: ${response.statusText}`, response.status);
        }

        return response;
    };

    // If explicit token provided or available in manager, use callWithAuth for auto-refresh
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
