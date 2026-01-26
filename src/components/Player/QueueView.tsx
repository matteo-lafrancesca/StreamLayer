import { useMemo } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { QueueTrackRow } from './QueueTrackRow';
import styles from '@styles/PlayerViews.module.css';

export function QueueView() {
    const { queue, playTrackFromPlaylist, playingTrack, isPlaying, setIsPlaying, selectedPlaylist, playingFromPlaylist } = usePlayer();

    // Separate current track from upcoming tracks
    const { currentTrack, upcomingTracks } = useMemo(() => {
        if (!queue || queue.length === 0 || !playingTrack) {
            return { currentTrack: null, upcomingTracks: [] };
        }

        const currentIndex = queue.findIndex(track => track.id === playingTrack.id);
        if (currentIndex === -1) {
            return { currentTrack: null, upcomingTracks: queue };
        }

        return {
            currentTrack: queue[currentIndex],
            upcomingTracks: queue.slice(currentIndex + 1)
        };
    }, [queue, playingTrack]);

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
            </div>

            {/* Now Playing */}
            {currentTrack && (
                <div className={styles.queueSection}>
                    <h3 className={styles.sectionTitle}>Titre en cours de lecture</h3>
                    <QueueTrackRow
                        track={currentTrack}
                        onClick={() => {
                            // Toggle play/pause
                            setIsPlaying(!isPlaying);
                        }}
                        isPlaying={true}
                        isPlayingState={isPlaying}
                    />
                </div>
            )}

            {/* Up Next */}
            {upcomingTracks.length > 0 && (
                <div className={styles.queueSection}>
                    <h3 className={styles.sectionTitle}>
                        À suivre dans : {(playingFromPlaylist || selectedPlaylist)?.metadata?.title || 'Playlist'}
                    </h3>
                    {upcomingTracks.map((track) => {
                        const realIndex = queue.findIndex(t => t === track);
                        return (
                            <QueueTrackRow
                                key={`${track.id}-${realIndex}`}
                                track={track}
                                onClick={() => playTrackFromPlaylist(realIndex, queue)}
                                isPlaying={false}
                                isPlayingState={false}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
