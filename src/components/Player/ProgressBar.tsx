import { Slider } from '@components/UI';
import styles from '@styles/ProgressBar.module.css';
import type { ProgressBarProps } from '@definitions/player';

interface ExtendedProgressBarProps extends ProgressBarProps {
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

export function ProgressBar({ progress, currentTime, duration, onProgressChange, onSeekStart, onSeekEnd }: ExtendedProgressBarProps) {
    return (
        <div className={styles.progressSection}>
            <span className={styles.timeText}>{currentTime}</span>
            <Slider
                value={progress}
                onChange={onProgressChange}
                variant="default"
                className={styles.progressBarNew}
                onDragStart={onSeekStart}
                onDragEnd={onSeekEnd}
            />
            <span className={styles.timeText}>-{duration}</span>
        </div>
    );
}

