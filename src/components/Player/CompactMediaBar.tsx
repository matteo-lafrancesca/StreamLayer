import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { IconButton } from '@components/UI';
import { Play, Pause, Maximize2 } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/CompactMediaBar.module.css';

/**
 * Minimal player with cover, controls, and expand button.
 */
export function CompactMediaBar() {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying
    } = usePlayer();
    const { setIsCompact } = usePlayerUI();

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

            {/* Expand button */}
            <IconButton
                icon={<Maximize2 size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                onClick={() => setIsCompact(false)}
                className={styles.expandButton}
                title="Retourner au lecteur standard"
                enlargeHitbox
            />
        </div>
    );
}
