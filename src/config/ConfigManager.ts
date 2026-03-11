export interface StreamLayerConfig {
    apiBaseUrl: string;
    apiKeyId: string;
    userApi: string;
    passwordApi: string;
}

let config: StreamLayerConfig | null = null;

// Gestionnaire de configuration
export const ConfigManager = {
    setConfig: (newConfig: StreamLayerConfig) => {
        config = newConfig;
    },

    getConfig: (): StreamLayerConfig => {
        if (!config) {
            throw new Error('StreamLayer non initialisé (ConfigManager)');
        }
        return config;
    },

    isInitialized: () => !!config
};
