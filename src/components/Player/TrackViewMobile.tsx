import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useTrackNavigation } from '@hooks/useTrackNavigation';

import { AuthenticatedImage } from './AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { IconButton } from '@components/UI';
import { ListMusic, ChevronDown, ListVideo } from 'lucide-react';
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
        setIsExpanded,
    } = usePlayerUI();

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
            <div className={styles.header}>
                <IconButton
                    icon={<ChevronDown size={PLAYER_SIZES.MOBILE.CHEVRON} />}
                    onClick={() => setIsExpanded(false)}
                    className={styles.dismissButton}
                    title="Fermer"
                />
                <div className={styles.headerInfo}>
                    <span className={styles.headerLabel}>LECTURE À PARTIR DE</span>
                    <span className={styles.headerContext}>
                        {selectedPlaylist?.metadata?.title || 'Projets'}
                    </span>
                </div>
                <div style={{ width: PLAYER_SIZES.MOBILE.CHEVRON }} />
            </div>

            <div className={styles.trackContent} data-scrollable>
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

                <div className={styles.progressSection}>
                    <ProgressBar
                        onSeekStart={() => setIsSeeking(true)}
                        onSeekEnd={() => setIsSeeking(false)}
                    />
                </div>

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

                <div className={styles.navigationFooter}>
                    <button
                        className={styles.navButton}
                        onClick={() => setCurrentView(selectedPlaylist ? 'playlist' : 'project')}
                    >
                        <ListMusic size={20} />
                        <span>Playlist</span>
                    </button>

                    <button
                        className={styles.navButton}
                        onClick={() => setCurrentView('queue')}
                    >
                        <ListVideo size={20} />
                        <span>File d'attente</span>
                    </button>
                </div>

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
