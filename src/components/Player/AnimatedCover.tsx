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

    // 1. Detect change and animate
    useEffect(() => {
        if (track?.id !== displayTrack?.id) {
            if (direction) {
                // If we have a direction, animate
                setPrevTrack(displayTrack);
                setDisplayTrack(track);
                setAnimating(true);

                // Clear previous timeout if exists
                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                // Set new timeout for cleanup
                timeoutRef.current = window.setTimeout(() => {
                    setAnimating(false);
                    setPrevTrack(null);
                    if (onAnimationEnd) onAnimationEnd();
                }, 300);
            } else {
                // No direction (e.g. initial load or jump), just update immediately
                setDisplayTrack(track);
                setAnimating(false);
                setPrevTrack(null);
            }
        }
    }, [track, direction, displayTrack, onAnimationEnd]);

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
