import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonSize = 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: IconButtonSize;
    icon: ReactNode;
    enlargeHitbox?: boolean;
    className?: string;
}

/**
 * Composant bouton iconique avec option d'agrandissement de la zone cliquable
 * @param size - Taille du bouton ('md' ou 'lg')
 * @param icon - Icône à afficher (composant Lucide React)
 * @param enlargeHitbox - Si true, agrandit la zone cliquable sans décalage visuel
 * @param className - Classes CSS supplémentaires
 */
export function IconButton({
    size = 'md',
    icon,
    enlargeHitbox = false,
    className = '',
    ...props
}: IconButtonProps) {
    const classes = [
        'icon-btn',
        size === 'lg' ? 'icon-btn-lg' : '',
        enlargeHitbox ? 'icon-btn-hitbox' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...props}>
            {icon}
        </button>
    );
}

