import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    pill?: boolean;
    children: ReactNode;
    className?: string;
}

/**
 * Composant bouton générique avec variantes et tailles prédéfinies.
 */
export function Button({
    variant = 'secondary',
    size = 'md',
    pill = false,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const classes = `
        sl-btn 
        sl-btn-${variant} 
        ${size !== 'md' ? `sl-btn-${size}` : ''} 
        ${pill ? 'sl-btn-pill' : ''} 
        ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}

