import { useState, useRef, useEffect } from 'react';
import type { Track } from '@definitions/track';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import styles from '@styles/TrackViewMobile.module.css';

interface AnimatedCoverProps {
    track: Track | null;
    direction: 'next' | 'prev' | null;
    onAnimationEnd?: () => void;
}

/**
 * Animated Cover Component
 * Handles the transition between two covers.
 */
export function AnimatedCover({ track, direction, onAnimationEnd }: AnimatedCoverProps) {
    const [displayTrack, setDisplayTrack] = useState<Track | null>(track);
    const [prevTrack, setPrevTrack] = useState<Track | null>(null);
    const [animating, setAnimating] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    // 1. Derived State: Detect change and update state immediately (during render)
    if (track?.id !== displayTrack?.id) {
        if (direction) {
            setPrevTrack(displayTrack);
            setDisplayTrack(track);
            setAnimating(true);
        } else {
            setDisplayTrack(track);
        }
    }

    // 2. Effect: Handle animation cleanup side-effect
    useEffect(() => {
        if (animating) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => {
                setAnimating(false);
                setPrevTrack(null);
                if (onAnimationEnd) onAnimationEnd();
            }, 300);
        }
    }, [animating, onAnimationEnd]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const getAnimationClass = (isIncoming: boolean) => {
        if (!animating || !direction) return '';
        if (direction === 'next') { // Swipe Left -> Next
            // Old (Prev) slides out Left. New (Incoming) slides in from Right.
            return isIncoming ? styles.slideInRight : styles.slideOutLeft;
        } else { // Swipe Right -> Prev
            // Old (Prev) slides out Right. New (Incoming) slides in from Left.
            return isIncoming ? styles.slideInLeft : styles.slideOutRight;
        }
    };

    return (
        <div className={styles.animatingContainer}>
            {/* Previous Track - Exiting */}
            {prevTrack && animating && (
                <div className={`${styles.coverWrapper} ${getAnimationClass(false)}`}>
                    <AlbumCoverOrPlaceholder
                        track={prevTrack}
                        size="l"
                        className={styles.coverLarge}
                    />
                </div>
            )}

            {/* Current Track - Entering or Static */}
            <div className={`${styles.coverWrapper} ${animating ? getAnimationClass(true) : ''}`}>
                <AlbumCoverOrPlaceholder
                    track={displayTrack}
                    size="l"
                    className={styles.coverLarge}
                />
            </div>
        </div>
    );
}
