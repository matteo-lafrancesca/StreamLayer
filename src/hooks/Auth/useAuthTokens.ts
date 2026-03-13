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
    error: Error | null;
    setAccessToken: (token: string | null) => void;
    setRefreshToken: (token: string | null) => void;
}

// Gère l'authentification et le cycle de vie des tokens (initialisation, rafraîchissement)
export function useAuthTokens({ projectId }: UseAuthTokensProps): UseAuthTokensReturn {
    const [accessToken, setAccessToken] = useState<string | null>(tokenManager.getAccessToken());
    const [refreshToken, setRefreshToken] = useState<string | null>(tokenManager.getRefreshToken());
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        tokenManager.setProjectId(projectId);

        const unsubscribe = tokenManager.subscribe((newAccessToken) => {
            setAccessToken(newAccessToken);
            setRefreshToken(tokenManager.getRefreshToken());
        });

        // Réinitialisation de l'erreur au changement de projectId
        setError(null);
        setIsLoading(true);

        getInitialTokens(projectId)
            .then((tokens) => {
                tokenManager.setTokens(tokens.access_token, tokens.refresh_token);
                setError(null);
            })
            .catch((err) => {
                Logger.error('Erreur lors de la récupération des tokens :', err);
                setError(err instanceof Error ? err : new Error(String(err)));
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
        error,
        setAccessToken,
        setRefreshToken,
    };
}
