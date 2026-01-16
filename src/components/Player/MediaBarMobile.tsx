import { usePlayer } from '../../context/PlayerContext';
import { TrackDisplay } from './TrackDisplay';
import { IconButton } from '../UI';
import { Play, Pause } from 'lucide-react';
import styles from '../../styles/MediaBarMobile.module.css';
import type { MediaBarProps } from '../../types/player';

/**
 * Mobile MediaBar component
 * Simplified player bar with click-to-expand and thin bottom progress bar
 */
export function MediaBarMobile({ onExpandToggle }: Omit<MediaBarProps, 'isExpanded'>) {
    const {
        isPlaying,
        setIsPlaying
    } = usePlayer();

    return (
        <div
            className={styles.mediaBarMobile}
            onClick={onExpandToggle}
        >
            {/* Left Section: Cover + Track Info */}
            <TrackDisplay />

            {/* Right Section: Play/Pause Button */}
            <div className={styles.mediaBarRight}>
                <IconButton
                    icon={isPlaying ? <Pause size={24} /> : <Play size={24} strokeWidth={2.5} />}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering expand
                        setIsPlaying(!isPlaying);
                    }}
                    className={styles.playPauseButtonMobile}
                    title={isPlaying ? 'Pause' : 'Lecture'}
                    enlargeHitbox
                />
            </div>
        </div>
    );
}
