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
    theme?: ThemeConfig;
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
            const dataset = scriptWithConfig.dataset;
            const projectId = dataset.projectId as string;
            const containerId = dataset.containerId || 'stream-layer-widget';

            const apiBaseUrl = dataset.apiBaseUrl || dataset.apiUrl;
            const apiKeyId = dataset.apiKeyId;
            const userApi = dataset.userApi;
            const passwordApi = dataset.passwordApi;
            const themePrimary = dataset.themePrimary;
            const themeSecondary = dataset.themeSecondary;

            const theme = (themePrimary || themeSecondary) ? {
                ...(themePrimary && { primary: themePrimary }),
                ...(themeSecondary && { secondary: themeSecondary })
            } : undefined;

            if (!apiBaseUrl || !apiKeyId || !userApi || !passwordApi) {
                console.error('[StreamLayer] Missing required API configuration in script tag.',
                    'Ensure data-api-base-url, data-api-key-id, data-user-api, and data-password-api are provided.');
            } else {
                const autoInit = () => {
                    let container = document.getElementById(containerId);

                    if (!container) {
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
                        theme
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
