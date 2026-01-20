import { Slider } from '@components/UI';
import { useTrackProgress } from '@hooks/useTrackProgress';
import styles from '@styles/ProgressBar.module.css';

interface ProgressBarProps {
    className?: string; // Allow custom styling
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

export function ProgressBar({ className, onSeekStart, onSeekEnd }: ProgressBarProps) {
    const { progress, formattedCurrentTime, formattedRemainingTime, seek } = useTrackProgress();

    return (
        <div className={`${styles.progressSection} ${className || ''}`}>
            <span className={styles.timeText}>{formattedCurrentTime}</span>
            <Slider
                value={progress}
                onChange={seek}
                variant="default"
                className={styles.progressBar}
                onDragStart={onSeekStart}
                onDragEnd={onSeekEnd}
            />
            <span className={styles.timeText}>{formattedRemainingTime}</span>
        </div>
    );
}
