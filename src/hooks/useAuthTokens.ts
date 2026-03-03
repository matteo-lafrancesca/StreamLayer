import { useEffect, useState } from 'react';
import { getInitialTokens } from '@services/api/auth';
import { tokenManager } from '@services/tokenManager';

interface UseAuthTokensProps {
    projectId: string;
}

interface UseAuthTokensReturn {
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

/**
 * Hook to manage authentication and tokens.
 */
export function useAuthTokens({ projectId }: UseAuthTokensProps): UseAuthTokensReturn {
    const [accessToken, setAccessToken] = useState<string | null>(tokenManager.getAccessToken());
    const [refreshToken, setRefreshToken] = useState<string | null>(tokenManager.getRefreshToken());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        tokenManager.setProjectId(projectId);

        const unsubscribe = tokenManager.subscribe((newAccessToken) => {
            setAccessToken(newAccessToken);
            setRefreshToken(tokenManager.getRefreshToken());
        });

        getInitialTokens(projectId)
            .then((tokens) => {
                tokenManager.setTokens(tokens.access_token, tokens.refresh_token);
            })
            .catch((error) => {
                console.error('Error retrieving tokens:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });

        return () => {
            unsubscribe();
        };
    }, [projectId]);

    return {
        accessToken,
        refreshToken,
        isLoading,
        setAccessToken,
        setRefreshToken,
    };
}
