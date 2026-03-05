import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { TrackDisplay } from './TrackDisplay';
import { IconButton } from '@components/UI';
import { Play, Pause } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/MediaBarMobile.module.css';
import type { MediaBarMobileProps } from '@definitions/player';

/**
 * Mobile MediaBar component.
 * Simplified player bar with click-to-expand and thin bottom progress bar.
 */
export function MediaBarMobile({ onExpandToggle }: MediaBarMobileProps) {
    const { isPlaying } = usePlayerState();
    const { setIsPlaying } = usePlayerActions();
    const { setCurrentView, isExpanded, currentView } = usePlayerUI();

    const handleExpand = () => {
        if (isExpanded && currentView !== 'track') {
            setCurrentView('track');
        } else {
            setCurrentView('track');
            onExpandToggle();
        }
    };

    return (
        <div
            className={styles.mediaBarMobile}
            onClick={handleExpand}
        >
            <TrackDisplay />

            <div className={styles.mediaBarRight}>
                <IconButton
                    icon={isPlaying
                        ? <Pause size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        : <Play size={PLAYER_SIZES.MOBILE.ICON_SMALL} strokeWidth={2.5} />
                    }
                    onClick={(e) => {
                        e.stopPropagation();
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
