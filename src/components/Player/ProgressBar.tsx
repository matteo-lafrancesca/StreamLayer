import { Slider } from '@components/UI';
import styles from '@styles/ProgressBar.module.css';
import type { ProgressBarProps } from '@definitions/player';

export function ProgressBar({ progress, currentTime, duration, onProgressChange }: ProgressBarProps) {
    return (
        <div className={styles.progressSection}>
            <span className={styles.timeText}>{currentTime}</span>
            <Slider
                value={progress}
                onChange={onProgressChange}
                variant="default"
                className={styles.progressBarNew}
            />
            <span className={styles.timeText}>-{duration}</span>
        </div>
    );
}

