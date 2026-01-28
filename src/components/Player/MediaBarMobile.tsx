import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { useAlbumCover } from '@hooks/useAlbumCover';
import { useImageReadyState } from '@hooks/useImageReadyState';
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
    const {
        isPlaying,
        setIsPlaying,
        playingTrack,
    } = usePlayer();
    const { setCurrentView, isExpanded, currentView } = usePlayerUI();

    const handleExpand = () => {
        if (isExpanded && currentView !== 'track') {
            setCurrentView('track');
        } else {
            setCurrentView('track'); // Set to track view before expanding
            onExpandToggle();
        }
    };

    // Check if cover is loaded
    const coverUrl = useAlbumCover(playingTrack?.id_album, 's');
    // Hide if track exists but cover not loaded
    const isVisible = useImageReadyState(playingTrack != null && !coverUrl);

    return (
        <div
            className={`${styles.mediaBarMobile} ${isVisible ? styles.visible : styles.hidden}`}
            onClick={handleExpand}
        >
            {/* Left: Cover + Track Info */}
            <TrackDisplay />

            {/* Right: Play/Pause */}
            <div className={styles.mediaBarRight}>
                <IconButton
                    icon={isPlaying
                        ? <Pause size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        : <Play size={PLAYER_SIZES.MOBILE.ICON_SMALL} strokeWidth={2.5} />
                    }
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent expand trigger
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
