import type { ThemeConfig } from '../types/Theme';
import type { CSSProperties } from 'react';

// Default base colors
const DEFAULT_PRIMARY = '#1e293b';
const DEFAULT_SECONDARY = '#6366f1';

/**
 * Checks if a hex color is "light" or "dark" (Simple 10-line math)
 */
function isLight(hex: string): boolean {
    const c = hex.replace(/^#/, '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // HSP color model brightness formula
    const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return brightness > 140;
}

/**
 * Converts a ThemeConfig object into raw CSS variables + flags.
 */
export function generateThemeVariables(theme?: ThemeConfig): CSSProperties {
    const p = theme?.primary || DEFAULT_PRIMARY;
    const s = theme?.secondary || DEFAULT_SECONDARY;

    return {
        '--sl-color-primary-raw': p,
        '--sl-color-secondary-raw': s,
        '--sl-bg-is-light': isLight(p) ? '1' : '0',
        '--sl-ui-is-light': isLight(s) ? '1' : '0',
    } as any;
}
