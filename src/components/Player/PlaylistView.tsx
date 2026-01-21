import { useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { usePlaylistTracks } from '@hooks/usePlaylistTracks';
import { usePreloadPlaylistImages } from '@hooks/usePreloadPlaylistImages';
import { useImageReadyState } from '@hooks/useImageReadyState';
import { useMemo } from 'react';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTableHeader } from './PlaylistTableHeader';
import { PlaylistTrackRow } from './PlaylistTrackRow';
import styles from '@styles/PlayerViews.module.css';

export function PlaylistView() {
    const { selectedPlaylist, playTrackFromPlaylist, playbackControls, playingTrack, isPlaying, setIsPlaying } = usePlayer();
    const { tracks, loading: tracksLoading, error } = usePlaylistTracks(selectedPlaylist?.id);

    // Extraire les IDs d'albums uniques pour le préchargement
    const albumIds = useMemo(() => {
        if (!tracks) return [];
        const uniqueIds = new Set(tracks.map(track => track.id_album));
        return Array.from(uniqueIds);
    }, [tracks]);

    // Précharger la cover de la playlist ET toutes les covers d'albums
    const { loading: imagesLoading } = usePreloadPlaylistImages(
        selectedPlaylist?.id,
        albumIds,
        'l', // Taille pour la cover de playlist (header)
        's'  // Taille pour les covers d'albums (lignes)
    );

    // Gérer l'affichage instantané après chargement
    const isVisible = useImageReadyState(tracksLoading || imagesLoading);

    // Handler pour lire tous les titres
    const handlePlayAll = useCallback(() => {
        if (tracks && tracks.length > 0) {
            playTrackFromPlaylist(0, tracks);
        }
    }, [tracks, playTrackFromPlaylist]);

    // Handler pour lecture aléatoire
    const handleShufflePlay = useCallback(() => {
        if (tracks && tracks.length > 0) {
            // Active le shuffle puis lance le premier track
            playbackControls.onShuffle();
            playTrackFromPlaylist(0);
        }
    }, [tracks, playTrackFromPlaylist, playbackControls]);

    if (!selectedPlaylist) {
        return (
            <div className={styles.statusMessage}>
                Sélectionnez une playlist
            </div>
        );
    }

    // Écran de chargement tant que les tracks OU les images ne sont pas chargées
    if (tracksLoading || imagesLoading) {
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

    if (!tracks || tracks.length === 0) {
        return (
            <div className={styles.statusMessage}>
                Cette playlist est vide
            </div>
        );
    }

    return (
        <div className={`${styles.scrollContainer} ${isVisible ? styles.visible : styles.hidden}`}>
            <PlaylistHeader
                playlist={selectedPlaylist}
                tracks={tracks}
                onPlayAll={handlePlayAll}
                onShufflePlay={handleShufflePlay}
            />

            <PlaylistTableHeader />

            <div className={styles.tracksList}>
                {tracks.map((track, index) => {
                    const isCurrentTrack = playingTrack?.id === track.id;
                    return (
                        <PlaylistTrackRow
                            key={track.id}
                            track={track}
                            index={index + 1}
                            onClick={() => {
                                if (isCurrentTrack) {
                                    // Toggle play/pause pour la track en cours
                                    setIsPlaying(!isPlaying);
                                } else {
                                    // Jouer une nouvelle track
                                    playTrackFromPlaylist(index, tracks);
                                }
                            }}
                            isPlaying={isCurrentTrack}
                            isPlayingState={isPlaying}
                        />
                    );
                })}
            </div>
        </div>
    );
}
