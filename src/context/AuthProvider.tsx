import { type ReactNode } from 'react';
import { useAuthTokens } from '@hooks/Auth/useAuthTokens';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
    projectId: string;
    children: ReactNode;
}

export function AuthProvider({ projectId, children }: AuthProviderProps) {
    const { accessToken, refreshToken, setAccessToken, setRefreshToken, isLoading } = useAuthTokens({ projectId });

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider
            value={{
                projectId,
                accessToken,
                setAccessToken,
                refreshToken,
                setRefreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
