import { usePlayer } from '@context/PlayerContext';
import { useMediaBarNavigation } from '@hooks/useMediaBarNavigation';
import { useCompactMode } from '@hooks/useCompactMode';
import { TrackDisplay } from './TrackDisplay';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo, Minimize2 } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/MediaBarDesktop.module.css';
import type { MediaBarDesktopProps } from '@definitions/player';

/**
 * Desktop MediaBar component
 * Full-featured player bar with all controls
 */
export function MediaBarDesktop({ isExpanded, onExpandToggle }: MediaBarDesktopProps) {
    const {
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        playbackControls,
        setIsSeeking,
        selectedPlaylist,
        currentView,
    } = usePlayer();

    // Extract navigation and compact mode logic to hooks
    const { handleOpenPlaylist, handleOpenQueue } = useMediaBarNavigation(isExpanded, onExpandToggle);
    const { enableCompactMode } = useCompactMode();

    return (
        <div className={styles.mediaBar}>
            {/* Left Section: Cover + Track Info */}
            <TrackDisplay />

            {/* Center Section: Progress Bar + Controls */}
            <div className={styles.mediaBarCenter}>
                <ProgressBar
                    onSeekStart={() => setIsSeeking(true)}
                    onSeekEnd={() => setIsSeeking(false)}
                />

                <PlaybackControls
                    isPlaying={isPlaying}
                    onPlayPause={() => setIsPlaying(!isPlaying)}
                    onShuffle={playbackControls.onShuffle}
                    onPrevious={playbackControls.onPrevious}
                    onNext={playbackControls.onNext}
                    onRepeat={playbackControls.onRepeat}
                />
            </div>

            {/* Right Section: Volume + View Toggles */}
            <div className={styles.mediaBarRight}>
                <div className={styles.viewControls}>
                    <IconButton
                        icon={<Minimize2 size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={enableCompactMode}
                        title="Mode compact"
                        enlargeHitbox
                    />
                    <IconButton
                        icon={<ListMusic size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={handleOpenPlaylist}
                        className={currentView === 'playlist' || currentView === 'project' ? styles.activeButton : ''}
                        title={selectedPlaylist ? "Playlist en cours" : "Projets"}
                        enlargeHitbox
                    />
                    <IconButton
                        icon={<ListVideo size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={handleOpenQueue}
                        className={currentView === 'queue' ? styles.activeButton : ''}
                        title="File d'attente"
                        enlargeHitbox
                    />
                </div>

                <VolumeControl
                    volume={volume}
                    onVolumeChange={setVolume}
                />
            </div>
        </div>
    );
}
