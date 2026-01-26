import { useEffect, useRef, useState } from 'react';

/**
 * Hook for horizontal scrolling text animation.
 * Handles overflow detection, smooth easing, and continuous loop.
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
                    // Use the provided speed prop (pixels per second)
                    const targetSpeed = speed;

                    // Fixed duration for acceleration and deceleration phrases (in seconds)
                    const rampTime = 1;

                    // Distance covered during acceleration (0 to speed in rampTime) = 0.5 * speed * rampTime
                    // Distance covered during deceleration (speed to 0 in rampTime) = 0.5 * speed * rampTime
                    const rampDistance = 0.5 * targetSpeed * rampTime;

                    // Total distance needed for full ramp up and down
                    const totalRampDistance = rampDistance * 2;

                    let linearTime = 0;
                    let actualRampTime = rampTime;
                    let actualSpeed = targetSpeed;

                    // If distance is too short for full ramp up/down at target speed
                    if (overflowDistance < totalRampDistance) {
                        // We won't reach full speed.
                        // dist = 0.5 * v * t + 0.5 * v * t = v * t
                        // v = a * t? No, simpler: 
                        // Peak velocity will be less. Let's keep it simple: reduce ramp time or speed.
                        // Actually, if it's short, linear phase is 0.
                        linearTime = 0;
                        // But we might need to adjust logic. For simplicity, let's keep linear logic
                        // but allowing negative linear time would be bad.
                        // Let's just clamp for safety or simple linear. 
                        // Realistically for music titles, overflow is usually significant or tiny.
                        // If tiny, just linear is fine.
                        actualRampTime = overflowDistance / targetSpeed / 2; // Split time
                        // This is an approximation fallback
                    } else {
                        const linearDistance = overflowDistance - totalRampDistance;
                        linearTime = linearDistance / targetSpeed;
                    }

                    const pauseAtEnd = 2000;
                    const pauseAtStart = 2000;

                    let phase = 0; // 0: pause start, 1: scroll right, 2: pause end, 3: scroll left
                    let startTime = Date.now();

                    const animate = () => {
                        const now = Date.now();
                        const elapsed = (now - startTime) / 1000; // in seconds

                        switch (phase) {
                            case 0: // Pause at start
                                setTranslateX(0);
                                if (now - startTime >= pauseAtStart) {
                                    phase = 1;
                                    startTime = Date.now();
                                }
                                break;

                            case 1: { // Scroll right
                                // Total duration of movement
                                const totalMoveTime = actualRampTime * 2 + linearTime;

                                if (elapsed >= totalMoveTime) {
                                    setTranslateX(-overflowDistance);
                                    phase = 2;
                                    startTime = Date.now();
                                } else {
                                    let currentPos = 0;

                                    if (elapsed < actualRampTime) {
                                        // Acceleration phase: d = 0.5 * a * t^2
                                        // a = speed / rampTime
                                        const a = actualSpeed / actualRampTime;
                                        currentPos = 0.5 * a * elapsed * elapsed;
                                    } else if (elapsed < actualRampTime + linearTime) {
                                        // Linear phase
                                        const linearElapsed = elapsed - actualRampTime;
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        currentPos = accelDist + (actualSpeed * linearElapsed);
                                    } else {
                                        // Deceleration phase
                                        const decelElapsed = elapsed - (actualRampTime + linearTime);
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        const linearDist = actualSpeed * linearTime;

                                        // Deceleration: v0 * t - 0.5 * a * t^2
                                        // a = speed / rampTime
                                        const a = actualSpeed / actualRampTime;
                                        const decelDist = (actualSpeed * decelElapsed) - (0.5 * a * decelElapsed * decelElapsed);

                                        currentPos = accelDist + linearDist + decelDist;
                                    }

                                    // Clamp to avoid overshoot
                                    setTranslateX(-Math.min(currentPos, overflowDistance));
                                }
                                break;
                            }

                            case 2: // Pause at end
                                setTranslateX(-overflowDistance);
                                if (now - startTime >= pauseAtEnd) {
                                    phase = 3;
                                    startTime = Date.now();
                                }
                                break;

                            case 3: { // Scroll left (rewind) - same logic but reverse
                                const totalMoveTime = actualRampTime * 2 + linearTime;

                                if (elapsed >= totalMoveTime) {
                                    setTranslateX(0);
                                    phase = 0;
                                    startTime = Date.now();
                                } else {
                                    let currentProgress = 0; // 0 to overflowDistance

                                    if (elapsed < actualRampTime) {
                                        const a = actualSpeed / actualRampTime;
                                        currentProgress = 0.5 * a * elapsed * elapsed;
                                    } else if (elapsed < actualRampTime + linearTime) {
                                        const linearElapsed = elapsed - actualRampTime;
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        currentProgress = accelDist + (actualSpeed * linearElapsed);
                                    } else {
                                        const decelElapsed = elapsed - (actualRampTime + linearTime);
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        const linearDist = actualSpeed * linearTime;
                                        const a = actualSpeed / actualRampTime;
                                        const decelDist = (actualSpeed * decelElapsed) - (0.5 * a * decelElapsed * decelElapsed);
                                        currentProgress = accelDist + linearDist + decelDist;
                                    }

                                    // Invert for rewinding: start at overflowDistance, go to 0
                                    // So translateX goes from -overflowDistance to 0
                                    // means translateX = -(overflowDistance - currentProgress)
                                    setTranslateX(-(overflowDistance - Math.min(currentProgress, overflowDistance)));
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
