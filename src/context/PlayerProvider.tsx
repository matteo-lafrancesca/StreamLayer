import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/Player/usePlaybackControls';
import { useAudioPlayer } from '@hooks/Audio/useAudioPlayer';
import { useQueueManager } from '@hooks/Player/useQueueManager';
import { usePlaylistTracksLazy } from '@hooks/Data/usePlaylistTracksLazy';
import { useTrackPreloader } from '@hooks/Player/useTrackPreloader';
import { useTrackReporting } from '@hooks/Reporting/useTrackReporting';
import { useMediaSession } from '@hooks/Audio/useMediaSession';
import { useAuth } from './AuthContext';
import { usePlayerUI } from './PlayerUIContext';
import { Logger } from '@utils/system';
import { PlayerStateContext, PlayerActionsContext } from './PlayerContext';

interface PlayerProviderProps {
    children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
    const { accessToken } = useAuth();
    const { selectedPlaylist, selectedTrack } = usePlayerUI();

    const { tracks: playlistTracks } = usePlaylistTracksLazy(selectedPlaylist?.id, accessToken, selectedPlaylist?.nb_items);

    const queueManager = useQueueManager({
        tracks: playlistTracks,
        initialTrack: selectedTrack,
    });

    const playingTrack = queueManager.currentTrack;
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    const [playingFromPlaylist, setPlayingFromPlaylist] = useState<Playlist | null>(null);
    const [streamFormat, setStreamFormat] = useState<'low' | 'high'>('low');

    useTrackPreloader(queueManager.queue, queueManager.currentIndex, accessToken);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { handlePlay, handlePause, handleStop, handleSeeking, handleSeeked } = useTrackReporting({
        playingTrack,
        playingFromPlaylist,
        audioRef,
        format: streamFormat
    });

    const nextTrack = queueManager.queue[queueManager.currentIndex + 1];
    const prevTrack = queueManager.queue[queueManager.currentIndex - 1];
    const audioPlayer = useAudioPlayer({
        trackId: playingTrack?.id ?? null,
        nextTrackId: nextTrack?.id ?? null,
        prevTrackId: prevTrack?.id ?? null,
        accessToken,
        volume,
        shouldPlay: isPlaying,
        onEnded: () => {
            if (queueManager.repeatMode === 'one' && audioPlayer.audioRef.current) {
                audioPlayer.audioRef.current.currentTime = 0;
                audioPlayer.audioRef.current.play().catch((err) => Logger.error('[Player] Erreur répétition', err));
                if (!isPlaying) setIsPlaying(true);
            } else if (queueManager.canPlayNext) {
                queueManager.playNext();
            } else {
                setIsPlaying(false);
            }
        },
        onError: () => {
            Logger.warn('[PlayerContext] Échec chargement piste, passage à la suivante');
            setIsPlaying(false);

            if (queueManager.canPlayNext) {
                queueManager.playNext();
            }
        },
        onPlay: handlePlay,
        onPause: handlePause,
        onStop: handleStop,
        onSeeking: handleSeeking,
        onSeeked: handleSeeked,
        onFormatChange: setStreamFormat,
    });

    // Synchronize the ref immediately after useAudioPlayer is called
    audioRef.current = audioPlayer.audioRef.current;

    const playbackControlsHook = usePlaybackControls({
        isShuffled: queueManager.isShuffled,
        repeatMode: queueManager.repeatMode,
        onShuffle: queueManager.toggleShuffle,
        onPrevious: () => {
            const currentTime = audioPlayer.audioRef.current?.currentTime || 0;
            if (currentTime > 5) {
                audioPlayer.seek(0);
                if (!isPlaying && playingTrack) setIsPlaying(true);
            } else {
                if (queueManager.canPlayPrevious) {
                    queueManager.playPrevious();
                    if (!isPlaying) setIsPlaying(true);
                } else {
                    audioPlayer.seek(0);
                    if (!isPlaying && playingTrack) setIsPlaying(true);
                }
            }
        },
        onNext: () => {
            queueManager.playNext();
            if (!isPlaying) setIsPlaying(true);
        },
        onRepeat: queueManager.toggleRepeat,
    });

    const playTrackFromPlaylist = useCallback((trackIndex: number, tracks?: Track[], options?: { shuffle?: boolean }) => {
        const tracksToPlay = tracks || playlistTracks;
        if (tracksToPlay && tracksToPlay.length > 0) {
            queueManager.setQueue(tracksToPlay, trackIndex, { shuffle: options?.shuffle });
            setPlayingFromPlaylist(selectedPlaylist);
            setIsPlaying(true);
        }
    }, [playlistTracks, queueManager.setQueue, selectedPlaylist]);

    useEffect(() => {
        if (
            playingFromPlaylist &&
            playlistTracks &&
            selectedPlaylist?.id === playingFromPlaylist.id &&
            selectedPlaylist?.nb_items &&
            playlistTracks.length < selectedPlaylist.nb_items
        ) {
            return;
        }

        if (
            playingFromPlaylist &&
            playlistTracks &&
            selectedPlaylist?.id === playingFromPlaylist.id &&
            selectedPlaylist?.nb_items &&
            playlistTracks.length === selectedPlaylist.nb_items &&
            queueManager.totalTracks < selectedPlaylist.nb_items
        ) {
            const currentTrackIndex = playlistTracks.findIndex(t => t.id === queueManager.currentTrack?.id);
            if (currentTrackIndex >= 0) {
                queueManager.setQueue(playlistTracks, currentTrackIndex, { keepState: true });
            }
        }
    }, [playlistTracks, playingFromPlaylist, selectedPlaylist, queueManager.totalTracks, queueManager.currentTrack?.id, queueManager.setQueue]);


    const playbackControlsActions = useMemo(() => ({
        onShuffle: playbackControlsHook.handleShuffle,
        onPrevious: playbackControlsHook.handlePrevious,
        onNext: playbackControlsHook.handleNext,
        onRepeat: playbackControlsHook.handleRepeat,
    }), [playbackControlsHook.handleShuffle, playbackControlsHook.handlePrevious, playbackControlsHook.handleNext, playbackControlsHook.handleRepeat]);

    useMediaSession({
        playingTrack,
        isPlaying,
        onPlay: () => setIsPlaying(true),
        onPause: () => setIsPlaying(false),
        onPrevious: playbackControlsActions.onPrevious,
        onNext: playbackControlsActions.onNext,
        onSeek: audioPlayer.seek,
        audioRef: audioPlayer.audioRef
    });

    const stateValue = useMemo(() => ({
        playingTrack,
        nextTrack,
        prevTrack,
        isPlaying,
        volume,
        duration: audioPlayer.duration,
        isBuffering: audioPlayer.isBuffering,
        playingFromPlaylist,
        queue: queueManager.queue,
        playbackControlsState: {
            isShuffled: playbackControlsHook.isShuffled,
            repeatMode: playbackControlsHook.repeatMode,
        }
    }), [
        playingTrack,
        nextTrack,
        prevTrack,
        isPlaying,
        volume,
        audioPlayer.duration,
        audioPlayer.isBuffering,
        playingFromPlaylist,
        queueManager.queue,
        playbackControlsHook.isShuffled,
        playbackControlsHook.repeatMode,
    ]);

    const actionsValue = useMemo(() => ({
        audioRef: audioPlayer.audioRef,
        playTrackFromPlaylist,
        setIsPlaying,
        setVolume,
        reorderQueue: queueManager.reorderQueue,
        playbackControlsActions,
    }), [
        audioPlayer.audioRef,
        playTrackFromPlaylist,
        queueManager.reorderQueue,
        playbackControlsActions,
    ]);

    return (
        <PlayerActionsContext.Provider value={actionsValue}>
            <PlayerStateContext.Provider value={stateValue}>
                {children}
            </PlayerStateContext.Provider>
        </PlayerActionsContext.Provider>
    );
}
