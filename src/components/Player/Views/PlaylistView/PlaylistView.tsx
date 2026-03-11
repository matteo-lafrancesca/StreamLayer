import { useCallback, useEffect, useMemo } from 'react';
import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
import { useAuth } from '@context/AuthContext';
import { usePlayerUI } from '@context/PlayerUIContext';
import { usePlaylistTracksLazy } from '@hooks/Data/usePlaylistTracksLazy';
import { usePreloadPlaylistImages } from '@hooks/cache/usePreloadPlaylistImages';
import { PlaylistHeader } from '../PlaylistHeader/index';
import { PlaylistTableHeader } from '../PlaylistTableHeader/index';
import { PlaylistTrackRow } from '../PlaylistTrackRow/index';
import styles from '../../../../styles/PlayerViews.module.css';

export function PlaylistView() {
    const { playingTrack, isPlaying, playingFromPlaylist } = usePlayerState();
    const { playTrackFromPlaylist, setIsPlaying } = usePlayerActions();
    const { selectedPlaylist, setCurrentView, setSelectedPlaylist: resetSelectedPlaylist } = usePlayerUI();
    const { accessToken } = useAuth();
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
        if (!tracks?.length) return;

        if (playingFromPlaylist?.id === selectedPlaylist?.id) {
            if (!isPlaying) setIsPlaying(true);
        } else {
            playTrackFromPlaylist(0, tracks);
        }
    }, [tracks, playTrackFromPlaylist, playingFromPlaylist, selectedPlaylist, isPlaying, setIsPlaying]);

    // Handler for shuffle play
    const handleShufflePlay = useCallback(() => {
        if (tracks && tracks.length > 0) {
            // Pick a random track index to start with
            const randomIndex = Math.floor(Math.random() * tracks.length);
            playTrackFromPlaylist(randomIndex, tracks, { shuffle: true });
        }
    }, [tracks, playTrackFromPlaylist]);

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
