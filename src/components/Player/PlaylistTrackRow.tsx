import { memo } from 'react';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '@components/Player/AuthenticatedImage';
import { PlayingIndicator } from './PlayingIndicator';
import { useAlbum } from '@hooks/useAlbum';
import { getTrackDisplayInfo } from '@utils/track';
import { Play, Pause } from 'lucide-react';
import styles from '@styles/PlaylistTrackRow.module.css';

interface PlaylistTrackRowProps {
    track: Track;
    index: number;
    onClick: () => void;
    isPlaying?: boolean;
    isPlayingState?: boolean;
}

function PlaylistTrackRowComponent({ track, index, onClick, isPlaying = false, isPlayingState = false }: PlaylistTrackRowProps) {
    const displayInfo = getTrackDisplayInfo(track, 's');
    const { album } = useAlbum(track.id_album);

    return (
        <div className={`${styles.row} ${isPlaying ? styles.rowPlaying : ''}`} onClick={onClick}>
            <div className={styles.index}>
                <div className={styles.indexContent}>
                    {isPlaying && isPlayingState ? (
                        <PlayingIndicator />
                    ) : (
                        <span className={styles.indexNumber}>{index}</span>
                    )}
                </div>

                {isPlaying && isPlayingState ? (
                    <Pause className={styles.playIcon} fill="currentColor" />
                ) : (
                    <Play className={styles.playIcon} fill="currentColor" />
                )}
            </div>

            <div className={styles.trackContent}>
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
            </div>

            <div className={styles.album}>
                {album?.title || 'Chargement...'}
            </div>

            <div className={styles.duration}>{displayInfo.duration}</div>
        </div>
    );
}

export const PlaylistTrackRow = memo(PlaylistTrackRowComponent);
