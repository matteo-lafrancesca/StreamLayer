import React from 'react';
import ReactDOM from 'react-dom/client';
import { StreamLayer } from '@components/StreamLayer';
// Styles - ORDER MATTERS!
import '@styles/styles.css';        // 1. Reset & Base (Must be first)
import '@styles/design-tokens.css'; // 2. Variables
import '@styles/utilities.css';     // 3. Utility Classes

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

        // Cleanup existing instance if any
        if (instances.has(containerId)) {
            destroyStreamLayer(containerId);
        }

        // Create root and render
        const root = ReactDOM.createRoot(container);
        instances.set(containerId, root);

        root.render(
            <React.StrictMode>
                <StreamLayer
                    projectId={projectId}
                />
            </React.StrictMode>
        );

        // Call onReady callback
        if (onReady) {
            setTimeout(onReady, 0);
        }

        // Return cleanup function
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

// AUTO-INITIALIZATION LOGIC
// Allows usage like: <script src="..." data-project-id="34" data-container-id="my-widget"></script>
if (typeof document !== 'undefined') {
    try {
        const currentScript = document.currentScript as HTMLScriptElement;

        // If loaded via <script> tag with attributes
        if (currentScript && currentScript.dataset.projectId) {
            const projectId = currentScript.dataset.projectId;
            const containerId = currentScript.dataset.containerId || 'stream-layer-widget';

            const autoInit = () => {
                // Ensure container exists (create if missing and simple usage implied)
                let container = document.getElementById(containerId);

                // Auto-create container if missing
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

            // Wait for DOM if needed
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

