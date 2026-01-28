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
 * Reusable Card component with hover effects and variants.
 * @param hover - If true, applies lift effect on hover.
 * @param hoverPrimary - If true, applies primary color hover effect.
 * @param xl - If true, uses extra large borders.
 * @param padding - Internal padding size ('none', 'sm', 'md').
 * @param children - Card content.
 * @param className - Additional CSS classes.
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
        'sl-card',
        hover && !hoverPrimary ? 'sl-hover-lift' : '',
        hoverPrimary ? 'sl-card-hover-primary' : '',
        xl ? 'sl-card-xl' : '',
        padding === 'md' ? 'sl-card-padding' : '',
        padding === 'sm' ? 'sl-card-padding-sm' : '',
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

