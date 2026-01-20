import { usePlayer } from '@context/PlayerContext';
import { getTrackDisplayInfo } from '@utils/track';
import { AuthenticatedImage } from '@components/AuthenticatedImage/AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo, ChevronDown } from 'lucide-react';
import styles from '@styles/TrackViewMobile.module.css';

/**
 * Full-Screen Track View for Mobile
 * Displays large album cover, track info, and playback controls
 */
export function TrackViewMobile() {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying,
        playbackControls,
        setIsSeeking,
        setCurrentView,
        selectedPlaylist,
        setIsExpanded
    } = usePlayer();

    const displayInfo = playingTrack
        ? getTrackDisplayInfo(playingTrack, 'l')
        : { title: '', artist: '' };

    return (
        <div className={styles.trackViewMobile}>
            {/* Clickable Header Bar */}
            <div className={styles.headerBar} onClick={() => setIsExpanded(false)}>
                <ChevronDown size={24} className={styles.chevronIcon} />
            </div>

            {/* Scrollable Content */}
            <div className={styles.trackContent}>
                {/* Album Cover */}
                <div className={styles.coverContainer}>
                    {playingTrack ? (
                        <AuthenticatedImage
                            type="album"
                            id={playingTrack.id_album}
                            size="l"
                            alt={displayInfo.title}
                            className={styles.coverLarge}
                        />
                    ) : (
                        <img
                            src="/img/placeholder.png"
                            alt="No track"
                            className={styles.coverLarge}
                        />
                    )}
                </div>

                {/* Track Info */}
                <div className={styles.trackInfo}>
                    <ScrollingText
                        text={displayInfo.title}
                        className={styles.trackTitle}
                        speed={20}
                    />
                    <ScrollingText
                        text={displayInfo.artist}
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

                {/* Bottom Navigation */}
                <div className={styles.bottomNavigation}>
                    <IconButton
                        icon={<ListMusic size={24} />}
                        onClick={() => setCurrentView(selectedPlaylist ? 'playlist' : 'project')}
                        title="Playlist"
                        enlargeHitbox
                    />
                    <IconButton
                        icon={<ListVideo size={24} />}
                        onClick={() => setCurrentView('queue')}
                        title="File d'attente"
                        enlargeHitbox
                    />
                </div>
            </div>
        </div>
    );
}
