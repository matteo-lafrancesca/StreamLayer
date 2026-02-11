import type { ThemeConfig } from '../types/Theme';
import type { CSSProperties } from 'react';

/**
 * Converts a ThemeConfig object into CSS Custom Properties (variables)
 * ready to be applied to a style object.
 */
export function generateThemeVariables(theme?: ThemeConfig): CSSProperties {
    if (!theme) return {};

    const variables: Record<string, string> = {};

    // Helper to add variable if value exists
    const addVar = (name: string, value?: string) => {
        if (value) {
            variables[name] = value;
        }
    };

    // Colors
    if (theme.colors) {
        addVar('--color-primary', theme.colors.primary);
        addVar('--color-primary-light', theme.colors.primaryLight);
        addVar('--color-primary-dark', theme.colors.primaryDark);
        addVar('--color-secondary', theme.colors.secondary);
        addVar('--color-accent', theme.colors.accent);
    }

    // Gradients
    if (theme.gradients) {
        addVar('--gradient-primary', theme.gradients.primary);
        addVar('--gradient-primary-vibrant', theme.gradients.primaryVibrant);
        addVar('--gradient-accent', theme.gradients.accent);
        addVar('--gradient-text', theme.gradients.text);
        addVar('--gradient-text-primary', theme.gradients.textPrimary);
        addVar('--gradient-dark', theme.gradients.dark);
        addVar('--gradient-purple', theme.gradients.purple);
        addVar('--gradient-red', theme.gradients.red);
    }

    // Neutrals
    if (theme.neutrals) {
        addVar('--color-white', theme.neutrals.white);
        addVar('--color-black', theme.neutrals.black);
        addVar('--color-gray-50', theme.neutrals.gray50);
        addVar('--color-gray-100', theme.neutrals.gray100);
        addVar('--color-gray-200', theme.neutrals.gray200);
        addVar('--color-gray-300', theme.neutrals.gray300);
        addVar('--color-gray-400', theme.neutrals.gray400);
        addVar('--color-gray-500', theme.neutrals.gray500);
        addVar('--color-gray-600', theme.neutrals.gray600);
        addVar('--color-gray-700', theme.neutrals.gray700);
        addVar('--color-gray-800', theme.neutrals.gray800);
        addVar('--color-gray-900', theme.neutrals.gray900);
    }

    // Backgrounds
    if (theme.backgrounds) {
        addVar('--bg-primary', theme.backgrounds.primary);
        addVar('--bg-secondary', theme.backgrounds.secondary);
        addVar('--bg-dark', theme.backgrounds.dark);
        addVar('--bg-card', theme.backgrounds.card);
    }

    // Text
    if (theme.text) {
        addVar('--text-primary', theme.text.primary);
        addVar('--text-secondary', theme.text.secondary);
        addVar('--text-tertiary', theme.text.tertiary);
        addVar('--text-light', theme.text.light);
        addVar('--text-white', theme.text.white);
    }

    // State
    if (theme.state) {
        addVar('--color-success', theme.state.success);
        addVar('--color-warning', theme.state.warning);
        addVar('--color-error', theme.state.error);
        addVar('--color-info', theme.state.info);
    }

    // Spotify
    if (theme.spotify) {
        addVar('--color-spotify-green', theme.spotify.green);
        addVar('--color-spotify-green-hover', theme.spotify.greenHover);
    }

    // Radius
    if (theme.radius) {
        addVar('--radius-none', theme.radius.none);
        addVar('--radius-sm', theme.radius.sm);
        addVar('--radius-md', theme.radius.md);
        addVar('--radius-lg', theme.radius.lg);
        addVar('--radius-xl', theme.radius.xl);
        addVar('--radius-2xl', theme.radius.xxl);
        addVar('--radius-3xl', theme.radius.xxxl);
        addVar('--radius-round', theme.radius.round);
        addVar('--radius-pill', theme.radius.pill);
    }

    if (theme.elements) {
        addVar('--color-slider', theme.elements.slider);
    }

    return variables as CSSProperties;
}
