import { usePlayer } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { IconButton } from '@components/UI';
import { Play, Pause, GripVertical } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/CompactMediaBar.module.css';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface CompactMediaBarProps {
    dragAttributes?: DraggableAttributes;
    dragListeners?: SyntheticListenerMap;
}

/**
 * Minimal player with cover, controls, and expand button.
 */
export function CompactMediaBar({ dragAttributes, dragListeners }: CompactMediaBarProps) {
    const {
        playingTrack,
        isPlaying,
        setIsPlaying
    } = usePlayer();
    const { setIsCompact } = usePlayerUI();

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(!isPlaying);
    };

    return (
        <div
            className={styles.compactMediaBar}
            onClick={() => setIsCompact(false)}
            title="Cliquer pour agrandir"
            role="button"
            tabIndex={0}
        >
            <div className={styles.coverContainer}>
                <AlbumCoverOrPlaceholder
                    track={playingTrack}
                    size="s"
                    className={styles.cover}
                />
            </div>

            <IconButton
                icon={isPlaying ? <Pause size={PLAYER_SIZES.DESKTOP.ICON_LARGE} /> : <Play size={PLAYER_SIZES.DESKTOP.ICON_LARGE} />}
                onClick={handlePlayPause}
                className={styles.playButton}
                enlargeHitbox
                title={isPlaying ? "Pause" : "Lecture"}
            />

            <div
                className={styles.dragHandle}
                {...dragAttributes}
                {...dragListeners}
                onClick={(e) => e.stopPropagation()}
                title="Déplacer le lecteur"
            >
                <GripVertical size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} className={styles.dragIcon} />
            </div>
        </div>
    );
}
