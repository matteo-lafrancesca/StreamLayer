import type { ReactNode } from 'react';
import { useBackGesture } from '@hooks/useBackGesture';

interface NavStackProps {
    children: ReactNode;
    state: 'hidden' | 'active' | 'obscured';
    onBack?: () => void;
    zIndex: number;
}

export function NavStack({ children, state, onBack, zIndex }: NavStackProps) {
    const {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        translateX,
        isAnimating
    } = useBackGesture({
        onBack: onBack || (() => { }),
        disabled: state !== 'active'
    });

    let transform = 'translateX(100%)';
    if (state === 'active') {
        transform = `translateX(${translateX}px)`;
    } else if (state === 'obscured') {
        transform = 'translateX(0px)';
    }

    const isDragging = state === 'active' && translateX > 0 && !isAnimating;

    return (
        <div
            onTouchStart={state === 'active' ? handleTouchStart : undefined}
            onTouchMove={state === 'active' ? handleTouchMove : undefined}
            onTouchEnd={state === 'active' ? handleTouchEnd : undefined}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex,
                background: 'var(--bg-secondary)',
                pointerEvents: (state === 'active' && !isAnimating) ? 'auto' : 'none',
                transform,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: state === 'active' && translateX > 0 ? '-5px 0 15px rgba(0,0,0,0.1)' : 'none',
            }}
        >
            {children}
        </div>
    );
}
