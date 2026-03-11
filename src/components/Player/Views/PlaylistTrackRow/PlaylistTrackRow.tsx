import { memo } from 'react';
import type { Track } from '@definitions/track';
import { PlayingIndicator } from '../../Common/PlayingIndicator';
import { useAlbum } from '@hooks/Data/useAlbum';
import { getTrackDisplayInfo } from '@utils/player';
import { Play, Pause } from 'lucide-react';
import { TrackItemInfo } from '../../Common/TrackItemInfo';
import styles from './PlaylistTrackRow.module.css';

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

            <TrackItemInfo 
                track={track} 
                className={styles.trackContent} 
            />

            <div className={styles.album}>
                {album?.title || 'Chargement...'}
            </div>

            <div className={styles.duration}>{displayInfo.duration}</div>
        </div>
    );
}

export const PlaylistTrackRow = memo(PlaylistTrackRowComponent);
