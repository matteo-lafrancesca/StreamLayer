import { Slider } from '@components/UI';
import { usePlayer } from '@context/PlayerContext';
import { useTrackProgress } from '@hooks/useTrackProgress';
import styles from '@styles/ProgressBar.module.css';

interface ProgressBarProps {
    className?: string;
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

export function ProgressBar({ className, onSeekStart, onSeekEnd }: ProgressBarProps) {
    const { playingTrack } = usePlayer();
    const { progress, formattedCurrentTime, formattedRemainingTime, seek, duration } = useTrackProgress();

    // Determine state
    const isDisabled = !playingTrack;
    const isActive = playingTrack != null && duration > 0 && isFinite(duration);
    const isLoading = !isDisabled && !isActive; // Track selected but duration not yet available

    // CSS classes based on state
    let stateClass = '';
    if (isDisabled) stateClass = styles.disabled;
    else if (isLoading) stateClass = styles.loading;

    return (
        <div className={`${styles.progressSection} ${className || ''}`}>
            <span className={styles.timeText} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
                {formattedCurrentTime}
            </span>
            {isLoading ? (
                <div className={styles.breathingWrapper} />
            ) : (
                <Slider
                    value={progress}
                    onChange={seek}
                    variant="default"
                    className={`${styles.progressBar} ${stateClass}`}
                    onDragStart={onSeekStart}
                    onDragEnd={onSeekEnd}
                    showThumb={isActive}
                />
            )}
            <span className={styles.timeText} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
                {formattedRemainingTime}
            </span>
        </div>
    );
}
