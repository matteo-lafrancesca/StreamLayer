import { usePlayer } from '@context/PlayerContext';
import { TrackDisplay } from './TrackDisplay';
import { IconButton } from '@components/UI';
import { Play, Pause } from 'lucide-react';
import styles from '@styles/MediaBarMobile.module.css';
import type { MediaBarMobileProps } from '@definitions/player';

/**
 * Mobile MediaBar component
 * Simplified player bar with click-to-expand and thin bottom progress bar
 */
export function MediaBarMobile({ onExpandToggle }: MediaBarMobileProps) {
    const {
        isPlaying,
        setIsPlaying,
        setCurrentView
    } = usePlayer();

    const handleExpand = () => {
        setCurrentView('track'); // Set to track view before expanding
        onExpandToggle();
    };

    return (
        <div
            className={styles.mediaBarMobile}
            onClick={handleExpand}
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

