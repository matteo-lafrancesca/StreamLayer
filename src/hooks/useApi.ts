import { useCallback, useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import { refreshTokens } from '@services/api/auth';

/**
 * Hook to make authenticated API calls with auto-refresh token logic
 * @param providedAccessToken - Optional access token to avoid circular dependency
 */
export function useApi(providedAccessToken?: string | null) {
    // Always call local context hook to respect Rules of Hooks
    // usage of useContext(AuthContext) allows this access to be safe (returns undefined) 
    // even if outside the provider, preventing crashes when providedAccessToken is used.
    const authContext = useContext(AuthContext);

    const {
        projectId = '',
        accessToken: contextAccessToken = null,
        refreshToken = null,
        setAccessToken = () => { },
        setRefreshToken = () => { }
    } = (providedAccessToken === undefined ? authContext : {}) || {};

    const accessToken = providedAccessToken ?? contextAccessToken;

    /**
     * Helper to wrap API calls with authentication and retry logic
     */
    const authenticatedCall = useCallback(async <T>(
        apiCall: (token: string) => Promise<T>
    ): Promise<T> => {
        if (!accessToken) {
            throw new Error('No access token available');
        }

        try {
            // Try 1: Call with current token
            return await apiCall(accessToken);
        } catch (error: any) {
            // Check if error is 401 (Unauthorized)
            // The service files throw "Error ...: 401"
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes('401') && refreshToken) {
                try {
                    console.log('Token expired (401), attempting refresh...');

                    // Refresh mechanics
                    const newTokens = await refreshTokens(projectId, refreshToken);

                    // Update context
                    setAccessToken(newTokens.access_token);
                    setRefreshToken(newTokens.refresh_token);

                    // Try 2: Retry with new token
                    console.log('Token refreshed successfully, retrying request...');
                    return await apiCall(newTokens.access_token);
                } catch (refreshError) {
                    console.error('Failed to refresh token:', refreshError);
                    // Optionally: Force logout or redirect
                    throw refreshError;
                }
            }

            // If not 401 or no refresh token, rethrow original error
            throw error;
        }
    }, [projectId, accessToken, refreshToken, setAccessToken, setRefreshToken]);

    return {
        authenticatedCall
    };
}

