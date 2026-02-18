import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useCompactMode } from '@hooks/useCompactMode';
import { useCover } from '@hooks/useCover';
import { useImageReadyState } from '@hooks/useImageReadyState';
import { TrackDisplay } from './TrackDisplay';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { IconButton } from '@components/UI';
import { Minimize2, ListMusic } from 'lucide-react';
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
        playingTrack,
    } = usePlayer();

    const {
        setIsSeeking,
        currentView,
        setCurrentView,
        selectedPlaylist
    } = usePlayerUI();

    const { enableCompactMode } = useCompactMode();

    // Check if cover is loaded
    const coverUrl = useCover('album', playingTrack?.id_album, 's');

    // Stop propagation for interactive elements to prevent expansion
    const handleInteractiveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Helper for smooth view transitions: Close -> Wait -> Switch -> Open
    const switchViewWithAnimation = (targetView: 'playlist' | 'project' | 'queue') => {
        if (isExpanded && currentView !== targetView) {
            // 1. Collapse
            onExpandToggle();

            // 2. Wait for animation (matched with CSS transition)
            setTimeout(() => {
                // 3. Switch View
                setCurrentView(targetView);
                // 4. Expand
                onExpandToggle();
            }, 300);
        } else {
            // Immediate switch if not expanded
            setCurrentView(targetView);
            if (!isExpanded) {
                onExpandToggle();
            }
        }
    };

    // Handle main bar click:
    // - If in Queue mode: Animate switch to Project/Playlist
    // - If in Project mode: Toggle expand/collapse
    const handleMainClick = () => {
        if (currentView === 'queue') {
            const target = selectedPlaylist ? 'playlist' : 'project';
            switchViewWithAnimation(target);
        } else {
            onExpandToggle();
        }
    };

    return (
        <div
            className={styles.mediaBar}
            onClick={handleMainClick}
            title={isExpanded && currentView !== 'queue' ? "Réduire" : "Ouvrir le lecteur"}
        >
            {/* Left: Cover + Track Info */}
            <TrackDisplay />

            {/* Center: Progress + Controls */}
            <div className={styles.mediaBarCenter}>
                <div onClick={handleInteractiveClick} style={{ width: '100%' }}>
                    <ProgressBar
                        onSeekStart={() => setIsSeeking(true)}
                        onSeekEnd={() => setIsSeeking(false)}
                    />
                </div>

                <div onClick={handleInteractiveClick}>
                    <PlaybackControls
                        isPlaying={isPlaying}
                        onPlayPause={() => setIsPlaying(!isPlaying)}
                        onShuffle={playbackControls.onShuffle}
                        onPrevious={playbackControls.onPrevious}
                        onNext={playbackControls.onNext}
                        onRepeat={playbackControls.onRepeat}
                    />
                </div>
            </div>

            {/* Right: Volume + View Toggles */}
            <div className={styles.mediaBarRight}>
                <div onClick={handleInteractiveClick}>
                    <IconButton
                        icon={<ListMusic size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={() => {
                            if (currentView === 'queue') {
                                // If already in queue, just minimize
                                onExpandToggle();
                            } else {
                                // Switch to queue with animation
                                switchViewWithAnimation('queue');
                            }
                        }}
                        title="File d'attente"
                        className={currentView === 'queue' ? styles.activeButton : ''}
                        enlargeHitbox
                    />
                </div>

                <div onClick={handleInteractiveClick}>
                    <VolumeControl
                        volume={volume}
                        onVolumeChange={setVolume}
                    />
                </div>

                <div onClick={handleInteractiveClick}>
                    <IconButton
                        icon={<Minimize2 size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={enableCompactMode}
                        title="Mode compact"
                        enlargeHitbox
                    />
                </div>
            </div>
        </div>
    );
}
