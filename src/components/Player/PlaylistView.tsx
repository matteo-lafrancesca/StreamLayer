import { useCallback, useEffect, useMemo } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { usePlaylistTracksLazy } from '@hooks/usePlaylistTracksLazy';
import { usePreloadPlaylistImages } from '@hooks/usePreloadPlaylistImages';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTableHeader } from './PlaylistTableHeader';
import { PlaylistTrackRow } from './PlaylistTrackRow';
import styles from '@styles/PlayerViews.module.css';

export function PlaylistView() {
    const { selectedPlaylist, playTrackFromPlaylist, playbackControls, playingTrack, isPlaying, setIsPlaying, setCurrentView, setSelectedPlaylist: resetSelectedPlaylist, accessToken } = usePlayer();
    const { tracks, error } = usePlaylistTracksLazy(selectedPlaylist?.id, accessToken, selectedPlaylist?.nb_items);

    // Extraire les IDs d'albums uniques pour le préchargement
    const albumIds = useMemo(() => {
        if (!tracks) return [];
        const uniqueIds = new Set(tracks.map(track => track.id_album));
        return Array.from(uniqueIds);
    }, [tracks]);

    // Précharger les images en arrière-plan (ne bloque pas l'affichage)
    usePreloadPlaylistImages(
        selectedPlaylist?.id,
        albumIds,
        'l', // Taille pour la cover de playlist (header)
        's'  // Taille pour les covers d'albums (lignes)
    );

    // Redirection automatique vers la vue projet en cas d'erreur (ex: playlist supprimée)
    useEffect(() => {
        if (error) {
            // Attendre un court instant pour laisser l'utilisateur voir qu'il y a eu une erreur
            const timeoutId = setTimeout(() => {
                resetSelectedPlaylist(null);
                setCurrentView('project');
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [error, resetSelectedPlaylist, setCurrentView]);

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

    if (error) {
        return (
            <div className={styles.errorMessage}>
                Erreur lors du chargement des tracks
            </div>
        );
    }

    // Distinction entre "en cours de chargement" et "playlist vide"
    // Si tracks est null et pas d'erreur, c'est que le lazy loading n'a pas encore commencé ou renvoyé de données
    if (!tracks) {
        return (
            <div className={styles.statusMessage}>
                Chargement des tracks...
            </div>
        );
    }

    if (tracks.length === 0) {
        return (
            <div className={styles.statusMessage}>
                Cette playlist est vide
            </div>
        );
    }

    return (
        <div className={styles.scrollContainer}>
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
