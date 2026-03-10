import { type ReactNode, useMemo } from 'react';
import { PlayerProvider } from '@context/PlayerProvider';
import { ConfigManager } from '../config/ConfigManager';
import { AuthProvider } from '@context/AuthProvider';
import { PlayerUIProvider } from '@context/PlayerUIProvider';
import { Player } from '@components/Player/Player';
import { useBackButton } from '@hooks/useBackButton';
import type { ThemeConfig } from '../types/Theme';
import { generateThemeVariables } from '../utils/theme';

export interface StreamLayerProps {
    /** StreamLayer project ID */
    projectId: string;
    /** App content with access to audio context */
    children?: ReactNode;
    /** Optional theme configuration to override default styles */
    theme?: ThemeConfig;
    /** API Base URL */
    apiBaseUrl: string;
    /** API Key ID */
    apiKeyId: string;
    /** API User Logic */
    userApi: string;
    /** API Password */
    passwordApi: string;
}

/**
 * StreamLayer root component.
 * Encapsulates audio logic and player UI.
 * Wrap your app or content with this component.
 */
export function StreamLayer({
    projectId,
    children,
    theme,
    apiBaseUrl,
    apiKeyId,
    userApi,
    passwordApi
}: StreamLayerProps) {
    useMemo(() => {
        if (!ConfigManager.isInitialized() || ConfigManager.getConfig().apiBaseUrl !== apiBaseUrl) {
            ConfigManager.setConfig({
                apiBaseUrl,
                apiKeyId,
                userApi,
                passwordApi
            });
        }
    }, [apiBaseUrl, apiKeyId, userApi, passwordApi]);

    const themeStyles = useMemo(() => {
        return generateThemeVariables(theme);
    }, [theme]);

    return (
        <div className="sl-root" style={themeStyles}>
            <AuthProvider projectId={projectId}>
                <PlayerUIProvider>
                    <BackButtonHandler />
                    <PlayerProvider>
                        {children}
                        <Player />
                    </PlayerProvider>
                </PlayerUIProvider>
            </AuthProvider>
        </div>
    );
}

function BackButtonHandler() {
    useBackButton();
    return null;
}
