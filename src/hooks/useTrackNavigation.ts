import { useState, useRef, useEffect } from 'react';
import type { Track } from '@definitions/track';
import { usePlayer } from '@context/PlayerContext';

interface UseTrackNavigationProps {
    minSwipeDistance?: number;
}

export function useTrackNavigation({ minSwipeDistance = 5 }: UseTrackNavigationProps = {}) {
    const { playingTrack, playbackControls, queue } = usePlayer();

    // Optimistic UI state
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [optimisticTrack, setOptimisticTrack] = useState<Track | null>(null);

    // Swipe refs
    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);

    // Reset optimistic state when real track updates to match
    useEffect(() => {
        if (optimisticTrack && playingTrack?.id === optimisticTrack.id) {
            setOptimisticTrack(null);
        }
    }, [playingTrack, optimisticTrack]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchEndX.current = null;
        touchEndY.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) return;

        const dx = touchStartX.current - touchEndX.current; // + = Left Swipe, - = Right Swipe
        const dy = touchStartY.current - touchEndY.current;

        console.log(`[SwipeDebug] dx: ${dx}, dy: ${dy}, min: ${minSwipeDistance}`);

        // Vertical vs Horizontal logic:
        // We allow swipe only if horizontal movement is dominant and clearly intentional.
        if (Math.abs(dx) < minSwipeDistance) return;

        // Veto if vertical movement is too significant (relaxed to 2x horizontal)
        if (Math.abs(dy) > Math.abs(dx) * 2) {
            console.log('[SwipeDebug] Vetoed by vertical movement');
            return;
        }

        const isLeftSwipe = dx > minSwipeDistance;
        const isRightSwipe = dx < -minSwipeDistance;

        const currentIndex = queue.findIndex(t => t.id === playingTrack?.id);

        if (isLeftSwipe) {
            // Next Track Optimistic
            const nextIndex = (currentIndex + 1) % queue.length;
            if (queue[nextIndex]) {
                setOptimisticTrack(queue[nextIndex]);
                setSlideDirection('next');
                playbackControls.onNext();
            }
        } else if (isRightSwipe) {
            // Prev Track Optimistic
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = queue.length - 1;

            if (queue[prevIndex]) {
                setOptimisticTrack(queue[prevIndex]);
                setSlideDirection('prev');
                playbackControls.onPrevious();
            }
        }
    };

    const handlePrevious = () => {
        setSlideDirection('prev');
        playbackControls.onPrevious();
    };

    const handleNext = () => {
        setSlideDirection('next');
        playbackControls.onNext();
    };

    const handleAnimationEnd = () => {
        setSlideDirection(null);
    };

    return {
        slideDirection,
        optimisticTrack,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handlePrevious,
        handleNext,
        handleAnimationEnd
    };
}
