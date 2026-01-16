import { usePlayer } from '../../context/PlayerContext';
import { getTrackDisplayInfo } from '../../utils/track';
import { AuthenticatedImage } from '../AuthenticatedImage/AuthenticatedImage';
import { ScrollingText } from './ScrollingText';
import styles from '../../styles/Player.module.css';

/**
 * TrackDisplay - Shared component for displaying album cover and track info
 * Used by both MediaBarDesktop and MediaBarMobile to avoid code duplication
 */
export function TrackDisplay() {
    const { playingTrack } = usePlayer();

    const displayInfo = playingTrack
        ? getTrackDisplayInfo(playingTrack, 's')
        : { title: '', artist: '' };

    return (
        <div className={styles.mediaBarLeft}>
            {playingTrack ? (
                <AuthenticatedImage
                    type="album"
                    id={playingTrack.id_album}
                    size="s"
                    alt={displayInfo.title}
                    className={styles.coverSmall}
                />
            ) : (
                <img
                    src="/img/placeholder.png"
                    alt="No track"
                    className={styles.coverSmall}
                />
            )}
            <div className={styles.trackInfoLarge}>
                <ScrollingText
                    text={displayInfo.title}
                    className={styles.trackTitleLarge}
                    speed={20}
                />
                <ScrollingText
                    text={displayInfo.artist}
                    className={styles.trackArtist}
                    speed={16}
                />
            </div>
        </div>
    );
}
