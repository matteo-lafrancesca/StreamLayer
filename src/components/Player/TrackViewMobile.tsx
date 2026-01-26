import { usePlayer } from '@context/PlayerContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/TrackViewMobile.module.css';

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
        setIsSeeking,
        setCurrentView,
        selectedPlaylist
    } = usePlayer();

    return (
        <div className={styles.trackViewMobile}>
            {/* Scrollable Content */}
            <div className={styles.trackContent} data-scrollable>
                {/* Album Cover */}
                <div className={styles.coverContainer}>
                    <AlbumCoverOrPlaceholder
                        track={playingTrack}
                        size="l"
                        className={styles.coverLarge}
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
                        onPrevious={playbackControls.onPrevious}
                        onNext={playbackControls.onNext}
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
            </div>
        </div>
    );
}
