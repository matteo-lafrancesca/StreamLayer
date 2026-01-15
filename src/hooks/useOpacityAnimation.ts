import { useState, useEffect, useRef } from 'react';

interface UseOpacityAnimationProps {
    isVisible: boolean;
    duration?: number;
    delay?: number; // Delay before appearing (in ms)
}

/**
 * Custom hook for smooth opacity animation using requestAnimationFrame
 * Replaces CSS transitions for better control and synchronization
 */
export function useOpacityAnimation({
    isVisible,
    duration = 300,
    delay = 0,
}: UseOpacityAnimationProps) {
    const defaultOpacity = isVisible ? 1 : 0;
    const [opacity, setOpacity] = useState(defaultOpacity);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const startOpacityRef = useRef<number>(defaultOpacity);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Clear any pending timeout
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Cancel any ongoing animation
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        const targetOpacity = isVisible ? 1 : 0;

        // If hiding, we might want to do it immediately or animate out without delay
        // If showing, we might want to wait for the delay

        const startAnimation = () => {
            startOpacityRef.current = opacity;
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

                const currentOpacity =
                    startOpacityRef.current +
                    (targetOpacity - startOpacityRef.current) * easedProgress;

                setOpacity(currentOpacity);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    animationRef.current = null;
                    setOpacity(targetOpacity); // Ensure precise final value
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        };

        if (isVisible && delay > 0) {
            // Apply delay only when showing
            // When hiding, we usually want to react immediately
            timeoutRef.current = window.setTimeout(startAnimation, delay);
        } else {
            startAnimation();
        }

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isVisible, duration, delay]);

    return opacity;
}
