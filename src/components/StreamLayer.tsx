import { type ReactNode, useMemo } from 'react';
import { PlayerProvider } from '@context/PlayerProvider';
import { ConfigManager } from '../config/ConfigManager';
import { AuthProvider } from '@context/AuthProvider';
import { PlayerUIProvider } from '@context/PlayerUIProvider';
import { Player } from '@components/Player/Player';
import { useBackButton } from '@hooks/Player/useBackButton';
import type { ThemeConfig } from '../types/metadata';
import { generateThemeVariables } from '../utils/ui';

export interface StreamLayerProps {
    /** ID du projet StreamLayer */
    projectId: string;
    /** Contenu de l'application ayant accès au contexte audio */
    children?: ReactNode;
    /** Configuration optionnelle du thème pour surcharger les styles par défaut */
    theme?: ThemeConfig;
    /** URL de base de l'API */
    apiBaseUrl: string;
    /** ID de la clé API */
    apiKeyId: string;
    /** Identifiant utilisateur API */
    userApi: string;
    /** Mot de passe API */
    passwordApi: string;
}

/**
 * Composant racine de StreamLayer.
 * Encapsule la logique audio et l'UI du player.
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
