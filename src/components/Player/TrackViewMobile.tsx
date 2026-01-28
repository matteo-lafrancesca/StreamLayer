import { useState, useRef, useEffect } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { AuthenticatedImage } from './AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/TrackViewMobile.module.css';
import type { Track } from '@definitions/track';

/**
 * Animated Cover Component
 * Handles the transition between two covers.
 */
function AnimatedCover({ track, direction, onAnimationEnd }: { track: Track | null, direction: 'next' | 'prev' | null, onAnimationEnd?: () => void }) {
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

/**
 * Full-screen track view for mobile.
 * Large cover, track info, and playback controls.
 */
export function TrackViewMobile() {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying,
        playbackControls,
        queue // Access queue
    } = usePlayer();

    const {
        setIsSeeking,
        setCurrentView,
        selectedPlaylist,
    } = usePlayerUI();

    // Swipe Logic
    const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
    const [optimisticTrack, setOptimisticTrack] = useState<Track | null>(null);
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);
    const minSwipeDistance = 50;

    // Reset optimistic state when real track updates
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

    // Handlers for button clicks
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

    return (
        <div className={styles.trackViewMobile}>
            {/* Scrollable Content */}
            <div className={styles.trackContent} data-scrollable>
                {/* Album Cover with Swipe & Animation */}
                <div
                    className={styles.coverContainer}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <AnimatedCover
                        track={optimisticTrack || playingTrack}
                        direction={slideDirection}
                        onAnimationEnd={handleAnimationEnd}
                    />
                </div>

                {/* Track Info */}
                <div className={styles.trackInfo}>
                    <ScrollingText
                        text={playingTrack?.title || ''}
                        className={styles.trackTitle}
                        speed={20}
                    />
                    <ScrollingText
                        text={playingTrack?.artists?.map(a => a.name).join(', ') || ''}
                        className={styles.trackArtist}
                        speed={16}
                    />
                </div>

                {/* Progress Bar */}
                <div className={styles.progressSection}>
                    <ProgressBar
                        onSeekStart={() => setIsSeeking(true)}
                        onSeekEnd={() => setIsSeeking(false)}
                    />
                </div>

                {/* Playback Controls */}
                <div className={styles.controlsSection}>
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onShuffle={playbackControls.onShuffle}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        onRepeat={playbackControls.onRepeat}
                        variant="mobile"
                    />
                </div>

                {/* Navigation Buttons - Centered below controls */}
                <div className={styles.navigationButtons}>
                    <IconButton
                        icon={<ListMusic size={PLAYER_SIZES.MOBILE.ICON_SMALL} />}
                        onClick={() => setCurrentView(selectedPlaylist ? 'playlist' : 'project')}
                        title="Playlist"
                        enlargeHitbox
                    />
                    <IconButton
                        icon={<ListVideo size={PLAYER_SIZES.MOBILE.ICON_SMALL} />}
                        onClick={() => setCurrentView('queue')}
                        title="File d'attente"
                        enlargeHitbox
                    />
                </div>

                {/* Preloader for Adjacent Tracks - using visibility hidden instead of display none to force load */}
                <div style={{ width: 0, height: 0, opacity: 0, overflow: 'hidden', position: 'absolute' }}>
                    {(() => {
                        const currentIndex = queue.findIndex(t => t.id === playingTrack?.id);
                        if (currentIndex === -1) return null;

                        const nextTrack = queue[(currentIndex + 1) % queue.length];
                        const prevTrack = queue[(currentIndex - 1 + queue.length) % queue.length];

                        return (
                            <>
                                {nextTrack && (
                                    <AuthenticatedImage
                                        type="album"
                                        id={nextTrack.id_album}
                                        size="l"
                                        alt="preload-next"
                                    />
                                )}
                                {prevTrack && (
                                    <AuthenticatedImage
                                        type="album"
                                        id={prevTrack.id_album}
                                        size="l"
                                        alt="preload-prev"
                                    />
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
