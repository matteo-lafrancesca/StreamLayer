import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useTrackNavigation } from '@hooks/useTrackNavigation';

import { AuthenticatedImage } from './AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/TrackViewMobile.module.css';


import { AnimatedCover } from './AnimatedCover';

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
        queue
    } = usePlayer();

    const {
        setIsSeeking,
        setCurrentView,
        selectedPlaylist,
    } = usePlayerUI();

    // Swipe & Navigation Logic
    const {
        slideDirection,
        optimisticTrack,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handlePrevious,
        handleNext,
        handleAnimationEnd
    } = useTrackNavigation();

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
