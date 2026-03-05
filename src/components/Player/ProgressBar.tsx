import { Slider } from '@components/UI';
import { usePlayerState } from '@context/PlayerContext';
import { useSeekableProgress } from '@hooks/useSeekableProgress';
import styles from '@styles/ProgressBar.module.css';

interface ProgressBarProps {
    className?: string;
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

export function ProgressBar({ className, onSeekStart, onSeekEnd }: ProgressBarProps) {
    const { playingTrack } = usePlayerState();

    const {
        progress,
        formattedCurrentTime,
        formattedRemainingTime,
        duration,
        isDragging,
        dragProgress,
        handleSeekStart,
        handleSeekChange,
        handleSeekEnd
    } = useSeekableProgress();

    // Determine state
    const isDisabled = !playingTrack;
    const isActive = playingTrack != null && duration > 0 && isFinite(duration);
    const isLoading = !isDisabled && !isActive; // Track selected but duration not yet available

    // CSS classes based on state
    let stateClass = '';
    if (isDisabled) stateClass = styles.disabled;
    else if (isLoading) stateClass = styles.loading;

    // Wrap handlers to include onSeek callbacks
    const onDragStart = (val: number) => {
        handleSeekStart(val);
        onSeekStart?.();
    };

    const onDragEnd = (val: number) => {
        handleSeekEnd(val);
        onSeekEnd?.();
    };

    return (
        <div className={`${styles.progressSection} ${className || ''}`}>
            <span className={styles.timeText} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
                {formattedCurrentTime}
            </span>
            {isLoading ? (
                <div className={styles.breathingWrapper} />
            ) : (
                <Slider
                    value={isDragging ? dragProgress : progress}
                    onChange={handleSeekChange}
                    variant="default"
                    className={`${styles.progressBar} ${stateClass}`}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    showThumb={isActive}
                />
            )}
            <span className={styles.timeText} style={{ visibility: isActive ? 'visible' : 'hidden' }}>
                {formattedRemainingTime}
            </span>
        </div>
    );
}
