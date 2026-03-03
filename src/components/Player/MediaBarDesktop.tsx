import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useCompactMode } from '@hooks/useCompactMode';
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
    } = usePlayer();

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
        const ASYNC_TRANSITION_MS = 300;

        if (isExpanded && currentView !== targetView) {
            onExpandToggle();

            setTimeout(() => {
                setCurrentView(targetView);
                onExpandToggle();
            }, ASYNC_TRANSITION_MS);
        } else {
            setCurrentView(targetView);
            if (!isExpanded) {
                onExpandToggle();
            }
        }
    };

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
                        onShuffle={playbackControls.onShuffle}
                        onPrevious={playbackControls.onPrevious}
                        onNext={playbackControls.onNext}
                        onRepeat={playbackControls.onRepeat}
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
        </div>
    );
}
