import { refreshTokens } from './api/auth';

type TokenListener = (accessToken: string | null) => void;

class TokenManager {
    private static instance: TokenManager;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private projectId: string | null = null;
    private refreshPromise: Promise<string> | null = null;
    private listeners: TokenListener[] = [];

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

    public subscribe(listener: TokenListener) {
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
            throw new Error('Missing refresh token or project ID');
        }

        // If refresh already in progress, return same promise
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
            } catch (error) {
                console.error('Failed to refresh token:', error);
                this.accessToken = null;
                this.refreshToken = null;
                this.notifyListeners();
                throw error;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }
}

export const tokenManager = TokenManager.getInstance();
