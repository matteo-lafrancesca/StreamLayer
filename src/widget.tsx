import React from 'react';
import ReactDOM from 'react-dom/client';
import { StreamLayer } from '@components/StreamLayer';

import '@styles/styles.css';
import '@styles/design-tokens.css';
import '@styles/utilities.css';

import type { ThemeConfig } from './types/Theme';

export interface StreamLayerConfig {
    projectId: string;
    containerId?: string;
    apiUrl?: string;
    theme?: string | ThemeConfig;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

// Export direct du composant pour usage React
export { StreamLayer };
export { StreamLayer as StreamLayerWidget }; // Garder pour rétrocompatibilité

// Map pour tracker les instances
const instances = new Map<string, ReactDOM.Root>();

/**
 * Initialize StreamLayer widget in a container
 * @param config Configuration object for the widget
 * @returns Cleanup function to destroy the widget
 */
export function initStreamLayer(config: StreamLayerConfig): () => void {
    const {
        projectId,
        containerId = 'stream-layer-widget',
        apiUrl: _apiUrl, // Reserved for future API configuration
        theme,
        onReady,
        onError
    } = config;

    try {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new Error(`Container element with id "${containerId}" not found`);
        }

        if (instances.has(containerId)) {
            destroyStreamLayer(containerId);
        }

        const root = ReactDOM.createRoot(container);
        instances.set(containerId, root);

        root.render(
            <React.StrictMode>
                <StreamLayer
                    projectId={projectId}
                    theme={theme}
                />
            </React.StrictMode>
        );

        if (onReady) {
            setTimeout(onReady, 0);
        }

        return () => destroyStreamLayer(containerId);

    } catch (error) {
        if (onError) {
            onError(error as Error);
        }
        throw error;
    }
}

/**
 * Destroy a StreamLayer widget instance
 * @param containerId ID of the container to cleanup
 */
export function destroyStreamLayer(containerId: string = 'stream-layer-widget'): void {
    const instance = instances.get(containerId);
    if (instance) {
        instance.unmount();
        instances.delete(containerId);
    }
}

// Default export pour compatibilité UMD
export default {
    initStreamLayer,
    destroyStreamLayer,
    StreamLayer
};


if (typeof document !== 'undefined') {
    try {
        // Mode Script/CDN uniquement : On cherche la configuration dans le script tag actuelle
        const currentScript = document.currentScript as HTMLScriptElement;

        // On ne tente l'auto-init que si data-project-id est trouvé, 
        // sinon on suppose que c'est un usage en librairie (import)

        let scriptWithConfig: HTMLScriptElement | null = currentScript;

        if (!scriptWithConfig) {
            // Fallback pour certains cas de chargement async, mais on reste prudent
            const found = document.querySelector('script[data-project-id]') as HTMLScriptElement;
            // Vérifier si ce script semble bien être stream-layer pour éviter les faux positifs
            if (found && (found.src.includes('stream-layer') || found.id === 'stream-layer-script')) {
                scriptWithConfig = found;
            }
        }

        if (scriptWithConfig && scriptWithConfig.dataset.projectId) {
            console.log('[StreamLayer] Auto-initializing from script tag...');
            const projectId = scriptWithConfig.dataset.projectId;

            const containerId = currentScript.dataset.containerId || 'stream-layer-widget';

            console.log(`[StreamLayer] Configuration found: Project=${projectId}, Container=${containerId}`);

            const autoInit = () => {
                let container = document.getElementById(containerId);

                if (!container) {
                    console.log(`[StreamLayer] Container #${containerId} not found, creating it automatically.`);
                    container = document.createElement('div');
                    container.id = containerId;
                    document.body.appendChild(container);
                }

                initStreamLayer({
                    projectId,
                    containerId,
                    onReady: () => console.log(`[StreamLayer] Widget auto-initialized (Project: ${projectId})`)
                });
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', autoInit);
            } else {
                autoInit();
            }
        }
    } catch (e) {
        console.error('[StreamLayer] Auto-initialization error:', e);
    }
}

