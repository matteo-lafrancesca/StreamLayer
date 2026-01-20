import { usePlayer } from '@context/PlayerContext';
import { AlbumCoverOrPlaceholder } from './AlbumCoverOrPlaceholder';
import { ScrollingText } from './ScrollingText';
import styles from '@styles/TrackDisplay.module.css';

/**
 * TrackDisplay - Shared component for displaying album cover and track info
 * Used by both MediaBarDesktop and MediaBarMobile to avoid code duplication
 */
export function TrackDisplay() {
    const { playingTrack } = usePlayer();

    return (
        <div className={styles.mediaBarLeft}>
            <AlbumCoverOrPlaceholder
                track={playingTrack}
                size="s"
                className={styles.coverSmall}
            />
            <div className={styles.trackInfoLarge}>
                <ScrollingText
                    text={playingTrack?.title || ''}
                    className={styles.trackTitleLarge}
                    speed={20}
                />
                <ScrollingText
                    text={playingTrack?.artists?.map(a => a.name).join(', ') || ''}
                    className={styles.trackArtist}
                    speed={16}
                />
            </div>
        </div>
    );
}
