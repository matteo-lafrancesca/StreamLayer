import React from 'react';
import ReactDOM from 'react-dom/client';
import { StreamLayer } from '@components/StreamLayer';

import '@styles/styles.css';
import '@styles/design-tokens.css';
import '@styles/utilities.css';

export interface StreamLayerConfig {
    projectId: string;
    containerId?: string;
    apiUrl?: string;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

// Export direct du composant pour usage React
export { StreamLayer as StreamLayerWidget };

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
    destroyStreamLayer
};


if (typeof document !== 'undefined') {
    try {
        console.log('[StreamLayer] Script loaded, attempting to find configuration...');
        let currentScript = document.currentScript as HTMLScriptElement;

        if (!currentScript) {
            console.log('[StreamLayer] document.currentScript is null, trying querySelector fallback...');
            currentScript = document.querySelector('script[data-project-id="34"]') as HTMLScriptElement ||
                document.querySelector('script[data-project-id]') as HTMLScriptElement;
        }

        if (currentScript) {
            console.log('[StreamLayer] Found script element:', currentScript);
        } else {
            console.error('[StreamLayer] Could not find script element with data-project-id');
        }

        if (currentScript && currentScript.dataset.projectId) {
            const projectId = currentScript.dataset.projectId;
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

