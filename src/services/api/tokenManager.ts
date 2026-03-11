import { refreshTokens } from './auth';
import { Logger } from '@utils/system';

// Gère le cycle de vie des tokens (Access & Refresh)
// Implémente un Singleton pour garantir une source unique de vérité
class TokenManager {
    private static instance: TokenManager;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private projectId: string | null = null;
    private refreshPromise: Promise<string> | null = null;
    private listeners: ((token: string | null) => void)[] = [];

    private constructor() { }

    public static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    public setProjectId(id: string) {
        this.projectId = id;
    }

    public setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        this.notifyListeners();
    }

    public getAccessToken(): string | null {
        return this.accessToken;
    }

    public getRefreshToken(): string | null {
        return this.refreshToken;
    }

    public subscribe(listener: (token: string | null) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener(this.accessToken));
    }

    public async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken || !this.projectId) {
            throw new Error('Tokens ou ID projet manquants pour le rafraîchissement');
        }

        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                const response = await refreshTokens(this.projectId!, this.refreshToken!);
                this.accessToken = response.access_token;
                this.refreshToken = response.refresh_token;
                this.notifyListeners();
                return response.access_token;
            } catch (error: any) {
                Logger.error('[TokenManager] Échec du rafraîchissement des tokens :', error);

                const isAuthError =
                    (error?.status === 401 || error?.status === 403) ||
                    (error instanceof Error && (error.message.includes('401') || error.message.includes('403')));

                if (isAuthError) {
                    this.accessToken = null;
                    this.refreshToken = null;
                    this.notifyListeners();
                }
                throw error;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    /**
     * Exécute un appel asynchrone avec authentification auto-gérée.
     * Tente un rafraîchissement automatique en cas d'erreur 401/403.
     */
    public async callWithAuth<T>(apiCall: (token: string) => Promise<T>): Promise<T> {
        if (!this.accessToken) {
            throw new Error('Aucun token d\'accès disponible');
        }

        try {
            return await apiCall(this.accessToken);
        } catch (error: any) {
            const isAuthError =
                (error?.status === 401 || error?.status === 403) ||
                (error instanceof Error && (error.message.includes('401') || error.message.includes('403')));

            if (isAuthError && this.refreshToken) {
                try {
                    Logger.info('[TokenManager] Problème d\'auth détecté, tentative de rafraîchissement...');
                    const newToken = await this.refreshAccessToken();
                    Logger.info('[TokenManager] Rafraîchissement réussi, nouvel essai...');
                    return await apiCall(newToken);
                } catch (refreshError) {
                    throw refreshError;
                }
            }

            throw error;
        }
    }
}

export const tokenManager = TokenManager.getInstance();
