import { type ReactNode, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    hoverPrimary?: boolean;
    xl?: boolean;
    padding?: 'none' | 'sm' | 'md';
    children: ReactNode;
    className?: string;
}

/**
 * Composant Card réutilisable avec effets de hover et variants
 * @param hover - Si true, applique un effet de lift au hover
 * @param hoverPrimary - Si true, applique hover effect avec couleur primaire
 * @param xl - Si true, utilise des bordures extra larges
 * @param padding - Taille du padding interne ('none', 'sm', 'md')
 * @param children - Contenu de la card
 * @param className - Classes CSS supplémentaires
 */
export function Card({
    hover = true,
    hoverPrimary = false,
    xl = false,
    padding = 'md',
    children,
    className = '',
    ...props
}: CardProps) {
    const classes = [
        'card',
        hover && !hoverPrimary ? 'hover-lift' : '',
        hoverPrimary ? 'card-hover-primary' : '',
        xl ? 'card-xl' : '',
        padding === 'md' ? 'card-padding' : '',
        padding === 'sm' ? 'card-padding-sm' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}
