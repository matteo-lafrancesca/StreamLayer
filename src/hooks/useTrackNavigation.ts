import { useState, useRef, useEffect } from 'react';
import type { Track } from '@definitions/track';
import { usePlayer } from '@context/PlayerContext';

interface UseTrackNavigationProps {
    minSwipeDistance?: number;
}

export function useTrackNavigation({ minSwipeDistance = 50 }: UseTrackNavigationProps = {}) {
    const { playingTrack, playbackControls, queue } = usePlayer();

    // Optimistic UI state
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [optimisticTrack, setOptimisticTrack] = useState<Track | null>(null);

    // Swipe refs
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);

    // Reset optimistic state when real track updates to match
    useEffect(() => {
        if (optimisticTrack && playingTrack?.id === optimisticTrack.id) {
            setOptimisticTrack(null);
        }
    }, [playingTrack, optimisticTrack]);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;

        const distance = touchStart.current - touchEnd.current; // + = Left Swipe, - = Right Swipe
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

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
