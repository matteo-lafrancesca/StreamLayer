import { usePlayer } from '@context/PlayerContext';
import { TrackDisplay } from './TrackDisplay';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { IconButton } from '@components/UI';
import { ListMusic, ListVideo } from 'lucide-react';
import styles from '@styles/MediaBarDesktop.module.css';
import type { MediaBarProps } from '@definitions/player';

/**
 * Desktop MediaBar component
 * Full-featured player bar with all controls
 */
export function MediaBarDesktop({ isExpanded, onExpandToggle }: MediaBarProps) {
    const {
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        progress,
        setProgress,
        currentTime,
        duration,
        playbackControls,
        setIsSeeking,
        selectedPlaylist,
        setCurrentView,
        currentView
    } = usePlayer();

    const handleOpenPlaylist = () => {
        if (!isExpanded) {
            onExpandToggle();
        }
        if (selectedPlaylist) {
            setCurrentView('playlist');
        } else {
            setCurrentView('project');
        }
    };

    const handleOpenQueue = () => {
        if (!isExpanded) {
            onExpandToggle();
        }
        setCurrentView('queue');
    };

    return (
        <div className={styles.mediaBarNew}>
            {/* Left Section: Cover + Track Info */}
            <TrackDisplay />

            {/* Center Section: Progress Bar + Controls */}
            <div className={styles.mediaBarCenter}>
                <ProgressBar
                    progress={progress}
                    currentTime={currentTime}
                    duration={duration}
                    onProgressChange={setProgress}
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
                        icon={<ListMusic size={20} />}
                        onClick={handleOpenPlaylist}
                        className={currentView === 'playlist' || currentView === 'project' ? styles.activeButton : ''}
                        title={selectedPlaylist ? "Playlist en cours" : "Projets"}
                        enlargeHitbox
                    />
                    <IconButton
                        icon={<ListVideo size={20} />}
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

