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
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            if (containerRef.current && contentRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const contentWidth = contentRef.current.scrollWidth;
                const isOverflowing = contentWidth > containerWidth;

                setShouldScroll(isOverflowing);

                if (isOverflowing) {
                    const overflowDistance = contentWidth - containerWidth;
                    const targetSpeed = speed;

                    const rampTime = 1;
                    const rampDistance = 0.5 * targetSpeed * rampTime;
                    const totalRampDistance = rampDistance * 2;

                    let linearTime = 0;
                    let actualRampTime = rampTime;
                    let actualSpeed = targetSpeed;

                    if (overflowDistance < totalRampDistance) {
                        linearTime = 0;
                        actualRampTime = overflowDistance / targetSpeed / 2;
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
                            case 0:
                                setTranslateX(0);
                                if (now - startTime >= pauseAtStart) {
                                    phase = 1;
                                    startTime = Date.now();
                                }
                                break;

                            case 1: {
                                const totalMoveTime = actualRampTime * 2 + linearTime;

                                if (elapsed >= totalMoveTime) {
                                    setTranslateX(-overflowDistance);
                                    phase = 2;
                                    startTime = Date.now();
                                } else {
                                    let currentPos = 0;

                                    if (elapsed < actualRampTime) {
                                        const a = actualSpeed / actualRampTime;
                                        currentPos = 0.5 * a * elapsed * elapsed;
                                    } else if (elapsed < actualRampTime + linearTime) {
                                        const linearElapsed = elapsed - actualRampTime;
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        currentPos = accelDist + (actualSpeed * linearElapsed);
                                    } else {
                                        const decelElapsed = elapsed - (actualRampTime + linearTime);
                                        const accelDist = 0.5 * actualSpeed * actualRampTime;
                                        const linearDist = actualSpeed * linearTime;

                                        const a = actualSpeed / actualRampTime;
                                        const decelDist = (actualSpeed * decelElapsed) - (0.5 * a * decelElapsed * decelElapsed);

                                        currentPos = accelDist + linearDist + decelDist;
                                    }

                                    setTranslateX(-Math.min(currentPos, overflowDistance));
                                }
                                break;
                            }

                            case 2:
                                setTranslateX(-overflowDistance);
                                if (now - startTime >= pauseAtEnd) {
                                    phase = 3;
                                    startTime = Date.now();
                                }
                                break;

                            case 3: {
                                const totalMoveTime = actualRampTime * 2 + linearTime;

                                if (elapsed >= totalMoveTime) {
                                    setTranslateX(0);
                                    phase = 0;
                                    startTime = Date.now();
                                } else {
                                    let currentProgress = 0;

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

        const resizeObserver = new ResizeObserver(() => {
            checkOverflow();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
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
