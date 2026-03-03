import { useRef, useState } from 'react';

interface UseBackGestureProps {
    onBack: () => void;
    disabled?: boolean;
    minSwipeDistance?: number;
}

/**
 * Hook to detect left-to-right swipe gesture for back navigation.
 */
export function useBackGesture({ onBack, disabled = false, minSwipeDistance = 50 }: UseBackGestureProps) {
    const [translateX, setTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);
    const lockDirection = useRef<'horizontal' | 'vertical' | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (disabled) return;
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
        lockDirection.current = null;
        setIsAnimating(false);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (disabled || touchStartX.current === null || touchStartY.current === null) return;

        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;

        const dx = touchEndX.current - touchStartX.current;
        const dy = touchEndY.current - touchStartY.current;

        if (!lockDirection.current) {
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                lockDirection.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
            }
        }

        if (lockDirection.current === 'horizontal') {
            if (e.cancelable) e.preventDefault();

            if (dx > 0) {
                setTranslateX(dx);
            }
        }
    };

    const handleTouchEnd = () => {
        if (disabled || touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) {
            setTranslateX(0);
            return;
        }

        const dx = touchEndX.current - touchStartX.current;

        if (lockDirection.current !== 'horizontal' && translateX === 0) {
            setTranslateX(0);
            touchStartX.current = null;
            touchStartY.current = null;
            touchEndX.current = null;
            touchEndY.current = null;
            lockDirection.current = null;
            return;
        }

        setIsAnimating(true);

        if (lockDirection.current === 'horizontal' && dx > minSwipeDistance) {
            setTranslateX(window.innerWidth);
            // Trigger onBack after animation
            setTimeout(() => {
                onBack();
                // Reset for next time the component is active
                setTranslateX(0);
                setIsAnimating(false);
            }, 300);
        } else {
            setTranslateX(0);
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }

        // Reset refs
        touchStartX.current = null;
        touchStartY.current = null;
        touchEndX.current = null;
        touchEndY.current = null;
        lockDirection.current = null;
    };

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        translateX,
        isAnimating
    };
}
