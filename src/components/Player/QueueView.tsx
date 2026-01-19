import { usePlayer } from '@context/PlayerContext';
import { PlaylistTrackRow } from './PlaylistTrackRow';
import { PlaylistTableHeader } from './PlaylistTableHeader';
import styles from '@styles/PlayerViews.module.css';

export function QueueView() {
    const { queue, playTrackFromPlaylist } = usePlayer();

    if (!queue || queue.length === 0) {
        return (
            <div className={styles.statusMessage}>
                La liste d'attente est vide
            </div>
        );
    }

    return (
        <div className={styles.scrollContainer}>
            <div className={styles.header}>
                <h2>File d'attente</h2>
                <div className={styles.subtitle}>{queue.length} titres</div>
            </div>

            <PlaylistTableHeader />

            <div className={styles.tracksList}>
                {queue.map((track, index) => (
                    <PlaylistTrackRow
                        key={`${track.id}-${index}`} // Composite key as tracks might repeat or be same ID
                        track={track}
                        index={index + 1}
                        onClick={() => playTrackFromPlaylist(index, queue)}
                    />
                ))}
            </div>
        </div>
    );
}
