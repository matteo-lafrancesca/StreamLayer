import { type ReactNode, useMemo } from 'react';
import { PlayerProvider } from '@context/PlayerContext';
import { ConfigManager } from '../config/ConfigManager';
import { AuthProvider } from '@context/AuthContext';
import { PlayerUIProvider } from '@context/PlayerUIContext';
import { Player } from '@components/Player/Player';
import { useBackButton } from '@hooks/useBackButton';
import type { ThemeConfig } from '../types/Theme';
import { generateThemeVariables } from '../utils/theme';
import { themes, defaultTheme } from '../config/themes';

export interface StreamLayerProps {
    /** StreamLayer project ID */
    projectId: string;
    /** App content with access to audio context */
    children?: ReactNode;
    /** Optional theme configuration or theme name to override default styles */
    theme?: string | ThemeConfig;
    /** API Base URL */
    apiBaseUrl: string;
    /** API Key ID */
    apiKeyId: string;
    /** API User Logic */
    userApi: string;
    /** API Password */
    passwordApi: string;
    /** Enable console logs */
    debug?: boolean;
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
    passwordApi,
    debug = false
}: StreamLayerProps) {
    useMemo(() => {
        if (!ConfigManager.isInitialized() || ConfigManager.getConfig().apiBaseUrl !== apiBaseUrl) {
            ConfigManager.setConfig({
                apiBaseUrl,
                apiKeyId,
                userApi,
                passwordApi,
                debug
            });
        }
    }, [apiBaseUrl, apiKeyId, userApi, passwordApi, debug]);

    const themeStyles = useMemo(() => {
        let themeConfig: ThemeConfig | undefined;

        if (typeof theme === 'string') {
            themeConfig = themes[theme] || defaultTheme;
        } else {
            themeConfig = theme;
        }

        return generateThemeVariables(themeConfig);
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
