import type { Modifier } from '@dnd-kit/core';
import type { ThemeConfig } from '@definitions/metadata';
import type { CSSProperties } from 'react';

/**
 * Utilitaires liés à l'interface utilisateur (Thème, Drag & Drop).
 */

// --- DRAG & DROP (DND-KIT) ---

/** Restreint le mouvement à l'axe vertical */
export const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Compense les transformations pour un affichage fluide */
export const compensateForTransforms: Modifier = ({ transform }) => ({ ...transform, x: 0, y: transform.y });

/** Restreint le mouvement au conteneur de scroll parent */
export const restrictToScrollContainer: Modifier = ({ transform, draggingNodeRect, containerNodeRect }) => {
    if (!draggingNodeRect || !containerNodeRect) return transform;
    const top = containerNodeRect.top - draggingNodeRect.top;
    const bottom = containerNodeRect.bottom - draggingNodeRect.bottom;
    return { ...transform, y: Math.min(Math.max(transform.y, top), bottom) };
};

// --- THÈME ET COULEURS ---

/** Vérifie si une couleur hexadécimale est "claire" (HSP model) */
function isLight(hex: string): boolean {
    const c = hex.replace(/^#/, '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return brightness > 140;
}

/** Génère les variables CSS racine à partir de la config thème */
export function generateThemeVariables(theme?: ThemeConfig): CSSProperties {
    const p = theme?.primary || '#1e293b';
    const s = theme?.secondary || '#6366f1';

    return {
        '--sl-color-primary-raw': p,
        '--sl-color-secondary-raw': s,
        '--sl-bg-is-light': isLight(p) ? '1' : '0',
        '--sl-ui-is-light': isLight(s) ? '1' : '0',
    } as any;
}
