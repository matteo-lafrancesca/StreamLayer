import { tokenManager } from './tokenManager';
import { ApiError } from '@definitions/api';

import { ConfigManager } from '../../config/ConfigManager';

interface FetchOptions extends RequestInit {
    accessToken?: string;
}

// Helper de bas niveau pour les appels API
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
                throw new ApiError(`Erreur Auth : ${response.statusText}`, response.status);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    if (accessToken || tokenManager.getAccessToken()) {
        return await tokenManager.callWithAuth((token) => performFetch(token));
    }

    return await performFetch();
}

// Helper générique pour les appels API JSON
export async function fetchJson<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    const response = await apiFetch(endpoint, { ...options, headers });

    if (!response.ok) {
        throw new ApiError(
            `Erreur API : ${response.statusText}`,
            response.status
        );
    }

    return await response.json();
}
