import { useEffect, useState } from 'react';
import { getInitialTokens } from '@services/api/auth';
import { tokenManager } from '@services/tokenManager';

interface UseAuthTokensProps {
    projectId: string;
}

interface UseAuthTokensReturn {
    accessToken: string | null;
    refreshToken: string | null;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

/**
 * Hook to manage authentication and tokens.
 * @param projectId - Project ID.
 * @returns Tokens and setters.
 */
export function useAuthTokens({ projectId }: UseAuthTokensProps): UseAuthTokensReturn {
    const [accessToken, setAccessToken] = useState<string | null>(tokenManager.getAccessToken());
    const [refreshToken, setRefreshToken] = useState<string | null>(tokenManager.getRefreshToken());

    useEffect(() => {
        // Initialize projectId in manager
        tokenManager.setProjectId(projectId);

        // Subscribe to token changes
        const unsubscribe = tokenManager.subscribe((newAccessToken) => {
            setAccessToken(newAccessToken);
            setRefreshToken(tokenManager.getRefreshToken());
        });

        // Retrieve initial tokens
        getInitialTokens(projectId)
            .then((tokens) => {
                // Via the manager, this triggers notification and state update
                tokenManager.setTokens(tokens.access_token, tokens.refresh_token);
            })
            .catch((error) => {
                console.error('Error retrieving tokens:', error);
            });

        return () => {
            unsubscribe();
        };
    }, [projectId]);

    return {
        accessToken,
        refreshToken,
        // Manual setters update local state,
        // ideally we should go through the manager for any global change
        setAccessToken,
        setRefreshToken,
    };
}
