import { useEffect, useState } from 'react';
import { getInitialTokens } from '@services/api/auth';

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
 * Hook pour gérer l'authentification et les tokens
 * @param projectId - ID du projet
 * @returns Tokens et setters
 */
export function useAuthTokens({ projectId }: UseAuthTokensProps): UseAuthTokensReturn {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        getInitialTokens(projectId)
            .then((tokens) => {
                setAccessToken(tokens.access_token);
                setRefreshToken(tokens.refresh_token);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des tokens:', error);
            });
    }, [projectId]);

    return {
        accessToken,
        refreshToken,
        setAccessToken,
        setRefreshToken,
    };
}
