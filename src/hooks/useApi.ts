import { useCallback } from 'react';
import { tokenManager } from '@services/tokenManager';

/**
 * Hook to make authenticated API calls.
 */
export function useApi(_providedAccessToken?: string | null) {
    const authenticatedCall = useCallback(async <T>(
        apiCall: (token: string) => Promise<T>
    ): Promise<T> => {
        return await tokenManager.callWithAuth(apiCall);
    }, []);

    return {
        authenticatedCall
    };
}

