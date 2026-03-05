import { useState, useRef, useEffect } from 'react';
import type { Track } from '@definitions/track';
import { usePlayerState, usePlayerActions } from '@context/PlayerContext';

interface UseTrackNavigationProps {
    minSwipeDistance?: number;
}

export function useTrackNavigation({ minSwipeDistance = 5 }: UseTrackNavigationProps = {}) {
    const { playingTrack, queue } = usePlayerState();
    const { playbackControlsActions } = usePlayerActions();

    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [optimisticTrack, setOptimisticTrack] = useState<Track | null>(null);

    const touchStartX = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);
    const lockDirection = useRef<'horizontal' | 'vertical' | null>(null);

    useEffect(() => {
        if (optimisticTrack && playingTrack?.id === optimisticTrack.id) {
            setOptimisticTrack(null);
        }
    }, [playingTrack, optimisticTrack]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
        touchEndX.current = null;
        touchEndY.current = null;
        lockDirection.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;

        const dx = touchStartX.current! - touchEndX.current;
        const dy = touchStartY.current! - touchEndY.current;

        if (!lockDirection.current) {
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                lockDirection.current = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
            }
        }

        if (lockDirection.current === 'horizontal') {
            if (e.cancelable) e.preventDefault();
        }
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null || touchStartY.current === null || touchEndY.current === null) return;

        const dx = touchStartX.current - touchEndX.current;

        if (lockDirection.current !== 'horizontal' || Math.abs(dx) < minSwipeDistance) return;

        const isLeftSwipe = dx > minSwipeDistance;
        const isRightSwipe = dx < -minSwipeDistance;

        const currentIndex = queue.findIndex(t => t.id === playingTrack?.id);

        if (isLeftSwipe) {
            const nextIndex = (currentIndex + 1) % queue.length;
            if (queue[nextIndex]) {
                setOptimisticTrack(queue[nextIndex]);
                setSlideDirection('next');
                playbackControlsActions.onNext();
            }
        } else if (isRightSwipe) {
            let prevIndex = currentIndex - 1;
            if (prevIndex < 0) prevIndex = queue.length - 1;

            if (queue[prevIndex]) {
                setOptimisticTrack(queue[prevIndex]);
                setSlideDirection('prev');
                playbackControlsActions.onPrevious();
            }
        }
    };

    const handlePrevious = () => {
        setSlideDirection('prev');
        playbackControlsActions.onPrevious();
    };

    const handleNext = () => {
        setSlideDirection('next');
        playbackControlsActions.onNext();
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
