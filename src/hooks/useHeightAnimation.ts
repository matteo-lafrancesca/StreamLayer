import { useEffect, useRef } from 'react';

interface UseHeightAnimationProps {
    isExpanded: boolean;
    collapsedHeight: number;
    expandedHeight: number;
    duration?: number;
}

/**
 * Custom hook for smooth height animation using requestAnimationFrame
 * Provides precise control to eliminate trembling
 */
export function useHeightAnimation({
    isExpanded,
    collapsedHeight,
    expandedHeight,
    duration = 300,
}: UseHeightAnimationProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startHeightRef = useRef<number>(collapsedHeight);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Cancel any ongoing animation
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
        }

        const targetHeight = isExpanded ? expandedHeight : collapsedHeight;
        const currentHeight = parseFloat(element.style.height || String(collapsedHeight));

        // If already at target, don't animate
        if (Math.abs(currentHeight - targetHeight) < 0.5) {
            element.style.height = `${targetHeight}px`;
            return;
        }

        startHeightRef.current = currentHeight;
        startTimeRef.current = null;

        // Easing function (ease-in-out cubic)
        const easeInOutCubic = (t: number): number => {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const animate = (timestamp: number) => {
            if (startTimeRef.current === null) {
                startTimeRef.current = timestamp;
            }

            const elapsed = timestamp - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeInOutCubic(progress);

            const currentAnimatedHeight =
                startHeightRef.current +
                (targetHeight - startHeightRef.current) * easedProgress;

            element.style.height = `${currentAnimatedHeight}px`;

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                animationRef.current = null;
                element.style.height = `${targetHeight}px`;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isExpanded, collapsedHeight, expandedHeight, duration]);

    return elementRef;
}
