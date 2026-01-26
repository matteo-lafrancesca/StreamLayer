import { memo } from 'react';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '@components/Player/AuthenticatedImage';
import { PlayingIndicator } from './PlayingIndicator';
import { getTrackDisplayInfo } from '@utils/track';
import { Play, Pause } from 'lucide-react';
import styles from '@styles/QueueTrackRow.module.css';

interface QueueTrackRowProps {
    track: Track;
    onClick: () => void;
    isPlaying?: boolean;
    isPlayingState?: boolean;
}

function QueueTrackRowComponent({ track, onClick, isPlaying = false, isPlayingState = false }: QueueTrackRowProps) {
    const displayInfo = getTrackDisplayInfo(track, 's');

    return (
        <div className={`${styles.row} ${isPlaying ? styles.rowPlaying : ''}`} onClick={onClick}>
            {/* Playing indicator or play/pause icon */}
            <div className={styles.playControl}>
                {/* Default state */}
                <div className={styles.playControlContent}>
                    {isPlaying && isPlayingState ? (
                        <PlayingIndicator />
                    ) : null}
                </div>
                {/* Hover state */}
                {isPlaying && isPlayingState ? (
                    <Pause className={styles.playIcon} fill="currentColor" />
                ) : (
                    <Play className={styles.playIcon} fill="currentColor" />
                )}
            </div>

            <AuthenticatedImage
                type="album"
                id={track.id_album}
                size="s"
                alt={displayInfo.title}
                className={styles.cover}
            />
            <div className={styles.trackInfo}>
                <div className={styles.title}>{displayInfo.title}</div>
                <div className={styles.artist}>{displayInfo.artist}</div>
            </div>
        </div >
    );
}

export const QueueTrackRow = memo(QueueTrackRowComponent);
