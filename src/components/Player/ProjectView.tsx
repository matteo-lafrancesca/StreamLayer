import { usePlayer } from '../../context/PlayerContext';
import { usePlaylists } from '../../hooks/usePlaylists';
import { getPlaylistDisplayInfo } from '../../utils/playlist';
import { AuthenticatedImage } from '../AuthenticatedImage/AuthenticatedImage';
import type { Playlist } from '../../types/playlist';
import styles from '../../styles/Player.module.css';

interface ProjectViewProps {
    onPlaylistSelect: () => void;
}

export function ProjectView({ onPlaylistSelect }: ProjectViewProps) {
    const { projectId, setSelectedPlaylist } = usePlayer();
    const { playlists, loading, error } = usePlaylists(projectId);

    if (loading) {
        return (
            <div className={styles.statusMessage}>
                Chargement des playlists...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                Erreur lors du chargement des playlists
            </div>
        );
    }

    const handlePlaylistClick = (playlist: Playlist) => {
        setSelectedPlaylist(playlist);
        onPlaylistSelect();
    };

    return (
        <div className={styles.scrollContainer}>
            <h2 className={styles.sectionHeader}>
                Playlists du projet
            </h2>

            <div className={styles.contentGrid}>
                {playlists?.map((playlist) => {
                    const displayInfo = getPlaylistDisplayInfo(playlist, 'm');

                    return (
                        <div
                            key={playlist.id}
                            onClick={() => handlePlaylistClick(playlist)}
                            className={styles.playlistCard}
                        >
                            {/* Cover */}
                            <AuthenticatedImage
                                type="playlist"
                                id={playlist.id}
                                size="m"
                                alt={displayInfo.title}
                                className={styles.coverPlaylist}
                            />

                            {/* Playlist Info */}
                            <div className={styles.playlistInfo}>
                                <div className={styles.playlistTitle}>
                                    {displayInfo.title}
                                </div>
                                <div className={styles.playlistMeta}>
                                    {displayInfo.nbTracks} tracks
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
