import React from 'react';
import ReactDOM from 'react-dom/client';
import { StreamLayer } from '@components/StreamLayer';
import { ErrorBoundary } from '@components/ErrorBoundary';

import '@styles/styles.css';
import '@styles/design-tokens.css';
import '@styles/utilities.css';

import type { ThemeConfig } from './types/Theme';

export interface StreamLayerConfig {
    projectId: string;
    containerId?: string;
    apiBaseUrl: string;
    apiKeyId: string;
    userApi: string;
    passwordApi: string;
    debug?: boolean;
    theme?: string | ThemeConfig;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

export { StreamLayer };
export { StreamLayer as StreamLayerWidget };

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
        apiBaseUrl,
        apiKeyId,
        userApi,
        passwordApi,
        debug = false,
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
                <ErrorBoundary onError={onError}>
                    <StreamLayer
                        projectId={projectId}
                        theme={theme}
                        apiBaseUrl={apiBaseUrl}
                        apiKeyId={apiKeyId}
                        userApi={userApi}
                        passwordApi={passwordApi}
                        debug={debug}
                    />
                </ErrorBoundary>
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
 * @param removeContainer Whether to remove the DOM container element as well
 */
export function destroyStreamLayer(containerId: string = 'stream-layer-widget', removeContainer: boolean = false): void {
    const instance = instances.get(containerId);
    if (instance) {
        instance.unmount();
        instances.delete(containerId);

        if (removeContainer) {
            const container = document.getElementById(containerId);
            if (container) {
                container.remove();
            }
        }
    }
}

export default {
    initStreamLayer,
    destroyStreamLayer,
    StreamLayer
};

if (typeof document !== 'undefined') {
    try {
        const currentScript = document.currentScript as HTMLScriptElement;
        let scriptWithConfig: HTMLScriptElement | null = currentScript;

        if (!scriptWithConfig || !scriptWithConfig.dataset.projectId) {
            const found = document.querySelector('script[data-project-id]') as HTMLScriptElement;
            if (found && (found.src.includes('stream-layer') || found.id === 'stream-layer-script')) {
                scriptWithConfig = found;
            }
        }

        if (scriptWithConfig && scriptWithConfig.dataset.projectId) {
            console.log('[StreamLayer] Auto-initializing from script tag...');

            const dataset = scriptWithConfig.dataset;
            const projectId = dataset.projectId;
            const containerId = dataset.containerId || 'stream-layer-widget';

            // Extract attributes, safely allowing fallback aliases
            const apiBaseUrl = dataset.apiBaseUrl || dataset.apiUrl;
            const apiKeyId = dataset.apiKeyId;
            const userApi = dataset.userApi;
            const passwordApi = dataset.passwordApi;
            const debug = dataset.debug === 'true';

            if (!apiBaseUrl || !apiKeyId || !userApi || !passwordApi) {
                console.error('[StreamLayer] Missing required API configuration in script tag.',
                    'Ensure data-api-base-url, data-api-key-id, data-user-api, and data-password-api are provided.');
            } else {
                console.log(`[StreamLayer] Configuration found: Project=${projectId}, Container=${containerId}`);

                const autoInit = () => {
                    let container = document.getElementById(containerId);

                    if (!container) {
                        console.log(`[StreamLayer] Container #${containerId} not found, creating it automatically.`);
                        container = document.createElement('div');
                        container.id = containerId;

                        if (scriptWithConfig && scriptWithConfig.parentNode) {
                            scriptWithConfig.parentNode.insertBefore(container, scriptWithConfig.nextSibling);
                        } else {
                            document.body.appendChild(container);
                        }
                    }

                    initStreamLayer({
                        projectId,
                        containerId,
                        apiBaseUrl,
                        apiKeyId,
                        userApi,
                        passwordApi,
                        debug,
                        onReady: () => console.log(`[StreamLayer] Widget auto-initialized (Project: ${projectId})`)
                    });
                };

                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', autoInit);
                } else {
                    autoInit();
                }
            }
        }
    } catch (e) {
        console.error('[StreamLayer] Auto-initialization error:', e);
    }
}
