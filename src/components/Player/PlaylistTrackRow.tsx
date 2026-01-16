import { memo } from 'react';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '@components/AuthenticatedImage/AuthenticatedImage';
import { useAlbum } from '@hooks/useAlbum';
import { getTrackDisplayInfo } from '@utils/track';
import { Play } from 'lucide-react';
import styles from '@styles/PlaylistTrackRow.module.css';

interface PlaylistTrackRowProps {
    track: Track;
    index: number;
    onClick: () => void;
}

function PlaylistTrackRowComponent({ track, index, onClick }: PlaylistTrackRowProps) {
    const displayInfo = getTrackDisplayInfo(track, 's');
    const { album } = useAlbum(track.id_album);

    return (
        <div className={styles.row} onClick={onClick}>
            {/* Index with Play Icon on Hover */}
            <div className={styles.index}>
                <span className={styles.indexNumber}>{index}</span>
                <Play className={styles.playIcon} fill="currentColor" />
            </div>

            {/* Track Content (Cover + Info) */}
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

            {/* Album */}
            <div className={styles.album}>
                {album?.title || 'Chargement...'}
            </div>

            {/* Duration */}
            <div className={styles.duration}>{displayInfo.duration}</div>
        </div>
    );
}

// Memoize the component to optimize renders
export const PlaylistTrackRow = memo(PlaylistTrackRowComponent);
