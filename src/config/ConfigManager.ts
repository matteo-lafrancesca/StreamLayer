export interface StreamLayerConfig {
    apiBaseUrl: string;
    apiKeyId: string;
    userApi: string;
    passwordApi: string;
}

let config: StreamLayerConfig | null = null;

export const ConfigManager = {
    setConfig(newConfig: StreamLayerConfig) {
        config = newConfig;
    },
    getConfig(): StreamLayerConfig {
        if (!config) {
            throw new Error('StreamLayer configuration has not been initialized. Please ensure StreamLayer component is mounted with the required props.');
        }
        return config;
    },
    isInitialized(): boolean {
        return config !== null;
    }
};
