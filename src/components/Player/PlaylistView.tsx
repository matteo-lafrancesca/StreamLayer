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

    // Extract unique album IDs for preloading
    const albumIds = useMemo(() => {
        if (!tracks) return [];
        const uniqueIds = new Set(tracks.map(track => track.id_album));
        return Array.from(uniqueIds);
    }, [tracks]);

    // Preload images in background (non-blocking)
    usePreloadPlaylistImages(
        selectedPlaylist?.id,
        albumIds,
        'l', // Size for playlist cover (header)
        's'  // Size for album covers (rows)
    );

    // Auto-redirect to project view on error (e.g., deleted playlist)
    useEffect(() => {
        if (error) {
            // Wait briefly to show error message
            const timeoutId = setTimeout(() => {
                resetSelectedPlaylist(null);
                setCurrentView('project');
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [error, resetSelectedPlaylist, setCurrentView]);

    // Handler to play all tracks
    const handlePlayAll = useCallback(() => {
        if (tracks && tracks.length > 0) {
            playTrackFromPlaylist(0, tracks);
        }
    }, [tracks, playTrackFromPlaylist]);

    // Handler for shuffle play
    const handleShufflePlay = useCallback(() => {
        if (tracks && tracks.length > 0) {
            // Enable shuffle then play first track
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
                Erreur lors du chargement des pistes
            </div>
        );
    }

    // Distinguish between 'loading' and 'empty playlist'
    // If tracks is null and no error, lazy loading hasn't started or returned data
    if (!tracks) {
        return (
            <div className={styles.statusMessage}>
                Chargement des pistes...
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
                                    // Toggle play/pause for current track
                                    setIsPlaying(!isPlaying);
                                } else {
                                    // Play new track
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
