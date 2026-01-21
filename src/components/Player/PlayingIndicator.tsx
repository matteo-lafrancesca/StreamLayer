import styles from '@styles/PlayingIndicator.module.css';

/**
 * Animated playing indicator with 3 moving bars
 */
export function PlayingIndicator() {
    return (
        <div className={styles.playingIndicator}>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
            <span className={styles.bar}></span>
        </div>
    );
}
