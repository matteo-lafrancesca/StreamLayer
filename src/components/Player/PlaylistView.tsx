import { useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { usePlaylistTracks } from '@hooks/usePlaylistTracks';
import { usePreloadAlbumCovers } from '@hooks/usePreloadAlbumCovers';
import { useMemo } from 'react';
import { PlaylistHeader } from './PlaylistHeader';
import { PlaylistTableHeader } from './PlaylistTableHeader';
import { PlaylistTrackRow } from './PlaylistTrackRow';
import styles from '@styles/PlayerViews.module.css';

export function PlaylistView() {
    const { selectedPlaylist, playTrackFromPlaylist, playbackControls } = usePlayer();
    const { tracks, loading, error } = usePlaylistTracks(selectedPlaylist?.id);

    // Extraire les IDs d'albums uniques pour le préchargement
    const albumIds = useMemo(() => {
        if (!tracks) return [];
        const uniqueIds = new Set(tracks.map(track => track.id_album));
        return Array.from(uniqueIds);
    }, [tracks]);

    // Précharger toutes les covers (silencieusement)
    usePreloadAlbumCovers(albumIds, 's');

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

    // Écran de chargement vide pendant le chargement des tracks UNIQUEMENT
    // Les covers chargeront en arrière-plan (Lazy Loading) sans bloquer l'UI
    if (loading) {
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
        <div className={styles.scrollContainer}>
            <PlaylistHeader
                playlist={selectedPlaylist}
                tracks={tracks}
                onPlayAll={handlePlayAll}
                onShufflePlay={handleShufflePlay}
            />

            <PlaylistTableHeader />

            <div className={styles.tracksList}>
                {tracks.map((track, index) => (
                    <PlaylistTrackRow
                        key={track.id}
                        track={track}
                        index={index + 1}
                        onClick={() => playTrackFromPlaylist(index, tracks)}
                    />
                ))}
            </div>
        </div>
    );
}
