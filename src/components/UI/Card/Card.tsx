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

