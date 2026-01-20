import { usePlayer } from '@context/PlayerContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { IconButton } from '@components/UI';
import { Play, Pause, Maximize2 } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/CompactMediaBar.module.css';

/**
 * Compact Media Bar Component
 * Minimal player showing only cover, play/pause, and fullscreen toggle
 */
export function CompactMediaBar() {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying,
        setIsCompact
    } = usePlayer();

    return (
        <div className={styles.compactMediaBar}>
            {/* Album Cover */}
            <div className={styles.coverContainer}>
                <AlbumCoverOrPlaceholder
                    track={playingTrack}
                    size="s"
                    className={styles.cover}
                />
            </div>

            {/* Play/Pause Button */}
            <IconButton
                icon={isPlaying ? <Pause size={PLAYER_SIZES.DESKTOP.ICON_LARGE} /> : <Play size={PLAYER_SIZES.DESKTOP.ICON_LARGE} />}
                onClick={() => setIsPlaying(!isPlaying)}
                className={styles.playButton}
                enlargeHitbox
            />

            {/* Fullscreen Toggle */}
            <IconButton
                icon={<Maximize2 size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                onClick={() => setIsCompact(false)}
                className={styles.expandButton}
                title="Agrandir le lecteur"
                enlargeHitbox
            />
        </div>
    );
}
