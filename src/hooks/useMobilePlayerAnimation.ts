import { useEffect, useRef, useState } from 'react';

interface MobilePlayerAnimationStyles {
    container: React.CSSProperties;
    player: React.CSSProperties;
}

interface UseMobilePlayerAnimationProps {
    isExpanded: boolean;
    isTrackView: boolean;
    duration?: number;
}

/**
 * Custom hook for mobile player expand/collapse animation
 * Animates from bottom bar to full-screen and back
 */
export function useMobilePlayerAnimation({
    isExpanded,
    isTrackView,
    duration = 300
}: UseMobilePlayerAnimationProps): MobilePlayerAnimationStyles {
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);
    const isFullScreen = isExpanded && isTrackView;

    useEffect(() => {
        // Cancel any ongoing animation
        if (animationFrameRef.current !== undefined) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Reset start time for new animation
        startTimeRef.current = undefined;

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = currentTime;
            }

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Linear easing - smooth and uniform throughout
            const eased = progress;

            setAnimationProgress(isFullScreen ? eased : 1 - eased);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== undefined) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isFullScreen, duration]);

    // Calculate interpolated values
    const progress = animationProgress;

    // Container animations
    // Start: bottom 20px, centered with translateX(-50%), player-width
    // End: bottom 0px, full width/height covering screen
    const containerBottom = 20 - (20 * progress); // 20px → 0px

    // Player styles - height grows from 72px to viewport height
    const playerHeight = 72 + ((window.innerHeight - 72) * progress);
    const playerBorderRadius = 12 - (12 * progress); // 12px → 0px
    const playerShadow = 1 - progress; // 1 → 0 (for opacity)

    const containerStyles: React.CSSProperties = {
        position: 'fixed',
        bottom: `${containerBottom}px`,
        left: progress > 0 ? '0' : '50%',
        right: progress > 0 ? '0' : 'auto',
        transform: progress > 0 ? 'none' : 'translateX(-50%)',
        transformOrigin: 'bottom center',
        zIndex: progress > 0.5 ? 9999 : 1000,
    };

    const playerStyles: React.CSSProperties = {
        width: progress > 0 ? '100vw' : 'var(--player-width-desktop)',
        height: `${playerHeight}px`,
        borderRadius: `${playerBorderRadius}px`,
        boxShadow: playerShadow > 0.1 ? 'var(--shadow-xl)' : 'none',
        background: 'var(--bg-secondary)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
    };

    return {
        container: containerStyles,
        player: playerStyles
    };
}
