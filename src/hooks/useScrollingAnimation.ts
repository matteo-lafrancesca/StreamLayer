import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for horizontal scrolling text animation
 * Handles overflow detection, smooth easing, and continuous loop animation
 * 
 * @param text - The text content to animate
 * @param speed - Animation speed (unused currently, kept for API compatibility)
 * @returns Animation state and refs to attach to DOM elements
 */
export function useScrollingAnimation(text: string, speed: number = 30) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const [translateX, setTranslateX] = useState(0);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = contentRef.current.scrollWidth;
                const isOverflowing = contentWidth > containerWidth;

                setShouldScroll(isOverflowing);

                if (isOverflowing) {
                    const overflowDistance = contentWidth - containerWidth;
                    const scrollVelocity = 10; // Fixed speed (px/s)
                    const scrollDuration = (overflowDistance / scrollVelocity) * 1000; // Convert to ms
                    const pauseAtEnd = 3000; // 3 seconds pause
                    const pauseAtStart = 3000; // 3 seconds pause

                    // Easing function: ease-in-out (smooth acceleration and deceleration)
                    const easeInOut = (t: number): number => {
                        return t < 0.5
                            ? 2 * t * t // Accelerate
                            : -1 + (4 - 2 * t) * t; // Decelerate
                    };

                    let phase = 0; // 0: pause start, 1: scroll right, 2: pause end, 3: scroll left
                    let startTime = Date.now();

                    const animate = () => {
                        const elapsed = Date.now() - startTime;

                        switch (phase) {
                            case 0: // Pause at start
                                setTranslateX(0);
                                if (elapsed >= pauseAtStart) {
                                    phase = 1;
                                    startTime = Date.now();
                                }
                                break;

                            case 1: { // Scroll to show overflow (with easing)
                                const progress1 = Math.min(elapsed / scrollDuration, 1);
                                const eased1 = easeInOut(progress1);
                                setTranslateX(-overflowDistance * eased1);
                                if (progress1 >= 1) {
                                    phase = 2;
                                    startTime = Date.now();
                                }
                                break;
                            }

                            case 2: // Pause at end
                                setTranslateX(-overflowDistance);
                                if (elapsed >= pauseAtEnd) {
                                    phase = 3;
                                    startTime = Date.now();
                                }
                                break;

                            case 3: { // Scroll back to start (with easing)
                                const progress2 = Math.min(elapsed / scrollDuration, 1);
                                const eased2 = easeInOut(progress2);
                                setTranslateX(-overflowDistance * (1 - eased2));
                                if (progress2 >= 1) {
                                    phase = 0;
                                    startTime = Date.now();
                                }
                                break;
                            }
                        }

                        animationRef.current = requestAnimationFrame(animate);
                    };

                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setTranslateX(0);
                }
            }
        };

        checkOverflow();

        window.addEventListener('resize', checkOverflow);
        return () => {
            window.removeEventListener('resize', checkOverflow);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [text, speed]);

    return {
        shouldScroll,
        translateX,
        containerRef,
        contentRef
    };
}
