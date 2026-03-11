import { useCallback } from 'react';
import { tokenManager } from '@services/api/tokenManager';

// Hook pour effectuer des appels API authentifiés avec gestion du token
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

