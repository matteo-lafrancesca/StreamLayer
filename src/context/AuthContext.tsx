import { createContext, useContext, type ReactNode } from 'react';
import { useAuthTokens } from '@hooks/useAuthTokens';

interface AuthContextType {
    projectId: string;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    refreshToken: string | null;
    setRefreshToken: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    projectId: string;
    children: ReactNode;
}

export function AuthProvider({ projectId, children }: AuthProviderProps) {
    const { accessToken, refreshToken, setAccessToken, setRefreshToken } = useAuthTokens({ projectId });

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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
