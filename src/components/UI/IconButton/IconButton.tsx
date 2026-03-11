import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonSize = 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: IconButtonSize;
    icon: ReactNode;
    enlargeHitbox?: boolean;
    className?: string;
}

/**
 * Composant bouton d'icône.
 * @param size - Taille du bouton ('md' ou 'lg').
 * @param icon - Icône à afficher.
 * @param enlargeHitbox - Si vrai, agrandit la zone cliquable sans changer l'aspect visuel.
 */
export function IconButton({
    size = 'md',
    icon,
    enlargeHitbox = false,
    className = '',
    ...props
}: IconButtonProps) {
    const classes = `
        sl-icon-btn 
        ${size === 'lg' ? 'sl-icon-btn-lg' : ''} 
        ${enlargeHitbox ? 'sl-icon-btn-hitbox' : ''} 
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <button className={classes} {...props}>
            {icon}
        </button>
    );
}

