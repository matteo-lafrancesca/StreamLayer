import { usePlayer } from '@context/PlayerContext';
import { getTrackDisplayInfo } from '@utils/track';
import { AuthenticatedImage } from '@components/AuthenticatedImage/AuthenticatedImage';
import { IconButton } from '@components/UI';
import { Play, Pause, Maximize2 } from 'lucide-react';
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

    const displayInfo = playingTrack
        ? getTrackDisplayInfo(playingTrack, 's')
        : { title: '', artist: '' };

    return (
        <div className={styles.compactMediaBar}>
            {/* Album Cover */}
            <div className={styles.coverContainer}>
                {playingTrack ? (
                    <AuthenticatedImage
                        type="album"
                        id={playingTrack.id_album}
                        size="s"
                        alt={displayInfo.title}
                        className={styles.cover}
                    />
                ) : (
                    <img
                        src="/img/placeholder.png"
                        alt="No track"
                        className={styles.cover}
                    />
                )}
            </div>

            {/* Play/Pause Button */}
            <IconButton
                icon={isPlaying ? <Pause size={24} /> : <Play size={24} />}
                onClick={() => setIsPlaying(!isPlaying)}
                className={styles.playButton}
                enlargeHitbox
            />

            {/* Fullscreen Toggle */}
            <IconButton
                icon={<Maximize2 size={20} />}
                onClick={() => setIsCompact(false)}
                className={styles.expandButton}
                title="Agrandir le lecteur"
                enlargeHitbox
            />
        </div>
    );
}
