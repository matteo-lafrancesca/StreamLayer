import { usePlayer } from '../../context/PlayerContext';
import { usePlaylistTracks } from '../../hooks/usePlaylistTracks';
import { useAlbum } from '../../hooks/useAlbum';
import { getTrackDisplayInfo } from '../../utils/track';
import { AuthenticatedImage } from '../AuthenticatedImage/AuthenticatedImage';
import { usePreloadAlbumCovers } from '../../hooks/usePreloadAlbumCovers';
import { useMemo } from 'react';
import styles from '../../styles/PlayerViews.module.css';

export function PlaylistView() {
    const { selectedPlaylist, setPlayingTrack } = usePlayer();
    const { tracks, loading, error } = usePlaylistTracks(selectedPlaylist?.id);

    // Extraire les IDs d'albums uniques pour le préchargement
    const albumIds = useMemo(() => {
        if (!tracks) return [];
        const uniqueIds = new Set(tracks.map(track => track.id_album));
        return Array.from(uniqueIds);
    }, [tracks]);

    // Précharger toutes les covers
    const { loading: loadingCovers } = usePreloadAlbumCovers(albumIds, 's');

    if (!selectedPlaylist) {
        return (
            <div className={styles.statusMessage}>
                Sélectionnez une playlist
            </div>
        );
    }

    // Écran de chargement vide pendant le chargement des tracks OU des covers
    // Combine les deux états pour éviter tout flash
    if (loading || loadingCovers) {
        return (
            <div className={styles.scrollContainerLoading} />
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                Erreur lors du chargement des tracks
            </div>
        );
    }

    return (
        <div className={styles.scrollContainer}>


            <div className={styles.contentList}>
                {tracks?.map((track) => {
                    const displayInfo = getTrackDisplayInfo(track, 's');

                    return (
                        <div
                            key={track.id}
                            onClick={() => setPlayingTrack(track)}
                            className={styles.trackCard}
                        >
                            {/* Cover */}
                            <AuthenticatedImage
                                type="album"
                                id={track.id_album}
                                size="s"
                                alt={displayInfo.title}
                                className={styles.coverMedium}
                            />

                            {/* Track Info */}
                            <div className={styles.trackInfo}>
                                <div className={styles.trackTitleMedium}>
                                    {displayInfo.title}
                                </div>
                                <div className={styles.trackSubtitle}>
                                    {displayInfo.artist}
                                </div>
                            </div>

                            {/* Album Name - will be loaded separately */}
                            <TrackAlbumName albumId={track.id_album} />

                            {/* Duration */}
                            <div className={styles.durationDisplay}>
                                {displayInfo.duration}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Sous-composant pour charger le nom de l'album
function TrackAlbumName({ albumId }: { albumId: number }) {
    const { album } = useAlbum(albumId);

    return (
        <div className={styles.trackSubtitleLight} style={{ minWidth: '120px' }}>
            {album?.title || 'Chargement...'}
        </div>
    );
}
