import { useCallback } from 'react';
import { tokenManager } from '@services/tokenManager';

/**
 * Hook to make authenticated API calls.
 * Now a simple wrapper around tokenManager.callWithAuth for React-friendly usage.
 */
export function useApi(_providedAccessToken?: string | null) {
    /**
     * Helper to wrap API calls with authentication and retry logic.
     * Delegates all heavy lifting to tokenManager.
     */
    const authenticatedCall = useCallback(async <T>(
        apiCall: (token: string) => Promise<T>
    ): Promise<T> => {
        return await tokenManager.callWithAuth(apiCall);
    }, []);

    return {
        authenticatedCall
    };
}

