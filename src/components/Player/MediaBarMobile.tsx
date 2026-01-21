import { usePlayer } from '@context/PlayerContext';
import { useAlbumCover } from '@hooks/useAlbumCover';
import { useImageReadyState } from '@hooks/useImageReadyState';
import { TrackDisplay } from './TrackDisplay';
import { IconButton } from '@components/UI';
import { Play, Pause } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
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
        setCurrentView,
        playingTrack,
    } = usePlayer();

    const handleExpand = () => {
        setCurrentView('track'); // Set to track view before expanding
        onExpandToggle();
    };

    // Vérifier si la cover est chargée
    const coverUrl = useAlbumCover(playingTrack?.id_album, 's');
    // Cacher seulement si un track existe MAIS que la cover n'est pas encore chargée
    const isVisible = useImageReadyState(playingTrack != null && !coverUrl);

    return (
        <div
            className={`${styles.mediaBarMobile} ${isVisible ? styles.visible : styles.hidden}`}
            onClick={handleExpand}
        >
            {/* Left Section: Cover + Track Info */}
            <TrackDisplay />

            {/* Right Section: Play/Pause Button */}
            <div className={styles.mediaBarRight}>
                <IconButton
                    icon={isPlaying
                        ? <Pause size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        : <Play size={PLAYER_SIZES.MOBILE.ICON_SMALL} strokeWidth={2.5} />
                    }
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
