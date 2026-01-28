import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonSize = 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    size?: IconButtonSize;
    icon: ReactNode;
    enlargeHitbox?: boolean;
    className?: string;
}

/**
 * Icon button component with hit area enlargement option.
 * @param size - Button size ('md' or 'lg').
 * @param icon - Icon to display.
 * @param enlargeHitbox - If true, enlarges clickable area without visual shift.
 * @param className - Additional CSS classes.
 */
export function IconButton({
    size = 'md',
    icon,
    enlargeHitbox = false,
    className = '',
    ...props
}: IconButtonProps) {
    const classes = [
        'sl-icon-btn',
        size === 'lg' ? 'sl-icon-btn-lg' : '',
        enlargeHitbox ? 'sl-icon-btn-hitbox' : '',
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

