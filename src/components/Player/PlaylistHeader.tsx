import type { Playlist } from '@definitions/playlist';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '@components/Player/AuthenticatedImage';
import { IconButton } from '@components/UI';
import { Play, Shuffle } from 'lucide-react';
import { formatPlaylistDuration } from '@utils/formatPlaylistDuration';
import styles from '@styles/PlaylistHeader.module.css';

interface PlaylistHeaderProps {
    playlist: Playlist;
    tracks: Track[];
    onPlayAll: () => void;
    onShufflePlay: () => void;
}

export function PlaylistHeader({ playlist, tracks, onPlayAll, onShufflePlay }: PlaylistHeaderProps) {
    const duration = formatPlaylistDuration(tracks);
    const trackCount = tracks.length;

    return (
        <div className={styles.header}>
            {/* Cover */}
            <div className={styles.coverContainer}>
                <AuthenticatedImage
                    type="playlist"
                    id={playlist.id}
                    size="l"
                    alt={playlist.metadata.title}
                    className={styles.cover}
                />
            </div>

            {/* Info & Controls */}
            <div className={styles.info}>
                <h1 className={styles.title}>{playlist.metadata.title}</h1>

                <div className={styles.metadata}>
                    <span>{trackCount} {trackCount > 1 ? 'titres' : 'titre'}</span>
                    <span className={styles.metadataSeparator}>•</span>
                    <span>{duration}</span>
                </div>

                <div className={styles.controls}>
                    <IconButton
                        icon={<Play size={24} fill="currentColor" />}
                        onClick={onPlayAll}
                        size="lg"
                        aria-label="Lire tous les titres"
                    />
                    <IconButton
                        icon={<Shuffle size={24} />}
                        onClick={onShufflePlay}
                        size="lg"
                        aria-label="Lecture aléatoire"
                    />
                </div>
            </div>
        </div>
    );
}
