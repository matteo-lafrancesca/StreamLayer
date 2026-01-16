import { usePlayer } from '../../context/PlayerContext';
import { TrackDisplay } from './TrackDisplay';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { IconButton } from '../UI';
import { ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../../styles/Player.module.css';
import type { MediaBarProps } from '../../types/player';

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
        playbackControls
    } = usePlayer();

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

            {/* Right Section: Volume + Expand Button */}
            <div className={styles.mediaBarRight}>
                <VolumeControl
                    volume={volume}
                    onVolumeChange={setVolume}
                />
                <IconButton
                    icon={isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    onClick={onExpandToggle}
                    className={styles.expandButton}
                    title={isExpanded ? 'Réduire' : 'Agrandir'}
                    enlargeHitbox
                />
            </div>
        </div>
    );
}
