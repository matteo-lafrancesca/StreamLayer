import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useCompactMode } from '@hooks/UI/useCompactMode';
import { TrackDisplay } from '../../Common/TrackDisplay';
import { PlaybackControls } from '../../Common/PlaybackControls';
import { ProgressBar } from '../../Common/ProgressBar';
import { VolumeControl } from '../../Common/VolumeControl';
import { IconButton } from '@components/UI';
import { Minimize2, ListMusic } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from './MediaBarDesktop.module.css';
import type { MediaBarDesktopProps } from '@definitions/player';

/**
 * Desktop MediaBar component
 * Full-featured player bar with all controls
 */
export function MediaBarDesktop({ isExpanded, onExpandToggle }: MediaBarDesktopProps) {
    const {
        isPlaying,
        volume,
    } = usePlayerState();

    const {
        setIsPlaying,
        setVolume,
        playbackControlsActions,
    } = usePlayerActions();

    const {
        setIsSeeking,
        currentView,
        setCurrentView,
        selectedPlaylist
    } = usePlayerUI();

    const { enableCompactMode } = useCompactMode();

    const handleInteractiveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const switchViewWithAnimation = (targetView: 'playlist' | 'project' | 'queue') => {
        if (isExpanded && currentView !== targetView) {
            onExpandToggle();
            setTimeout(() => {
                setCurrentView(targetView);
                onExpandToggle();
            }, 300);
        } else {
            setCurrentView(targetView);
            if (!isExpanded) onExpandToggle();
        }
    };

    const handleMainClick = () => {
        if (currentView === 'queue') {
            switchViewWithAnimation(selectedPlaylist ? 'playlist' : 'project');
        } else {
            onExpandToggle();
        }
    };

    return (
        <footer
            className={styles.mediaBar}
            onClick={handleMainClick}
            title={isExpanded && currentView !== 'queue' ? "Réduire" : "Ouvrir le lecteur"}
        >
            <TrackDisplay />

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
                        onShuffle={playbackControlsActions.onShuffle}
                        onPrevious={playbackControlsActions.onPrevious}
                        onNext={playbackControlsActions.onNext}
                        onRepeat={playbackControlsActions.onRepeat}
                    />
                </div>
            </div>

            <div className={styles.mediaBarRight}>
                <div onClick={handleInteractiveClick}>
                    <IconButton
                        icon={<ListMusic size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                        onClick={() => {
                            if (currentView === 'queue') {
                                onExpandToggle();
                            } else {
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
        </footer>
    );
}
