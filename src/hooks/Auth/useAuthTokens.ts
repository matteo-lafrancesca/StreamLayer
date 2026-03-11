import { useEffect, useState } from 'react';
import { Logger } from '@utils/system';
import { getInitialTokens } from '@services/api/auth';
import { tokenManager } from '@services/api/tokenManager';

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

// Gère l'authentification et le cycle de vie des tokens (initialisation, rafraîchissement)
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
                Logger.error('Erreur lors de la récupération des tokens :', error);
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
