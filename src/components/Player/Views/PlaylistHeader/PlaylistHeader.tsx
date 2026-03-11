import { memo } from 'react';
import type { Playlist } from '@definitions/playlist';
import type { Track } from '@definitions/track';
import { AuthenticatedImage } from '../../Common/AuthenticatedImage';
import { IconButton } from '@components/UI';
import { Play, Shuffle } from 'lucide-react';
import { formatPlaylistDuration } from '@utils/player';
import styles from './PlaylistHeader.module.css';

interface PlaylistHeaderProps {
    playlist: Playlist;
    tracks: Track[];
    onPlayAll: () => void;
    onShufflePlay: () => void;
}

function PlaylistHeaderComponent({ playlist, tracks, onPlayAll, onShufflePlay }: PlaylistHeaderProps) {
    const trackCount = playlist.nb_items;

    const allTracksLoaded = tracks.length >= playlist.nb_items;
    const duration = allTracksLoaded ? formatPlaylistDuration(tracks) : 'Calcul...';

    return (
        <div className={styles.header}>
            <div className={styles.coverContainer}>
                <AuthenticatedImage
                    type="playlist"
                    id={playlist.id}
                    size="l"
                    alt={playlist.metadata.title}
                    className={styles.cover}
                />
            </div>

            <div className={styles.info}>
                <h1 className={styles.title}>{playlist.metadata.title}</h1>

                <div className={styles.metadata}>
                    <span>{trackCount} {trackCount > 1 ? 'titres' : 'titre'}</span>
                    {allTracksLoaded && (
                        <>
                            <span className={styles.metadataSeparator}>•</span>
                            <span>{duration}</span>
                        </>
                    )}
                </div>

                <div className={styles.controls}>
                    <IconButton
                        icon={<Play size={24} fill="currentColor" />}
                        onClick={onPlayAll}
                        size="lg"
                        aria-label="Tout lire"
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

export const PlaylistHeader = memo(PlaylistHeaderComponent);
