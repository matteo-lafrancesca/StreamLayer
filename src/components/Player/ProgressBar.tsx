import { Slider } from '../UI';
import styles from '../../styles/Player.module.css';
import type { ProgressBarProps } from '../../types/player';

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
