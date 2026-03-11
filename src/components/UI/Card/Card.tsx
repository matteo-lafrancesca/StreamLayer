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
 * Composant Carte réutilisable avec effets de survol et variantes.
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
    const classes = `
        sl-card 
        ${hover && !hoverPrimary ? 'sl-hover-lift' : ''} 
        ${hoverPrimary ? 'sl-card-hover-primary' : ''} 
        ${xl ? 'sl-card-xl' : ''} 
        ${padding === 'md' ? 'sl-card-padding' : ''} 
        ${padding === 'sm' ? 'sl-card-padding-sm' : ''} 
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}

