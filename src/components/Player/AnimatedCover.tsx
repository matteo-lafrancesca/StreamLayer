import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (track?.id !== displayTrack?.id) {
            if (direction) {
                setPrevTrack(displayTrack);
                setDisplayTrack(track);
                setAnimating(true);
            } else {
                setDisplayTrack(track);
                setAnimating(false);
                setPrevTrack(null);
            }
        }
    }, [track, direction, displayTrack]);

    const handleAnimationEnd = () => {
        if (animating) {
            setAnimating(false);
            setPrevTrack(null);
            if (onAnimationEnd) onAnimationEnd();
        }
    };

    const getAnimationClass = (isIncoming: boolean) => {
        if (!animating || !direction) return '';
        if (direction === 'next') {
            return isIncoming ? styles.slideInRight : styles.slideOutLeft;
        } else {
            return isIncoming ? styles.slideInLeft : styles.slideOutRight;
        }
    };

    return (
        <div className={styles.animatingContainer}>
            {prevTrack && animating && (
                <div className={`${styles.coverWrapper} ${getAnimationClass(false)}`}>
                    <AlbumCoverOrPlaceholder
                        track={prevTrack}
                        size="l"
                        className={styles.coverLarge}
                    />
                </div>
            )}

            <div
                className={`${styles.coverWrapper} ${animating ? getAnimationClass(true) : ''}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <AlbumCoverOrPlaceholder
                    track={displayTrack}
                    size="l"
                    className={styles.coverLarge}
                />
            </div>
        </div>
    );
}
