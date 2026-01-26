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
 * Button component with multiple variants and sizes.
 */
export function Button({
    variant = 'secondary',
    size = 'md',
    pill = false,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' ? `btn-${size}` : '',
        pill ? 'btn-pill' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}

