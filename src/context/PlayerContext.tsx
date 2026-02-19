import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useQueueManager } from '@hooks/useQueueManager';
import { usePlaylistTracksLazy } from '@hooks/usePlaylistTracksLazy';
import { useTrackPreloader } from '@hooks/useTrackPreloader';
import { useAuth } from './AuthContext';
import { usePlayerUI } from './PlayerUIContext';
import { useReporting } from '@hooks/useReporting';
import type { ReportingStatus } from '../types/Reporting';

interface PlaybackControls {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
}

interface PlayerContextType {
    // Playback state
    // Audio Ref for direct access
    audioRef: RefObject<HTMLAudioElement | null>;

    // Playback state
    playingTrack: Track | null;

    playTrackFromPlaylist: (trackIndex: number, tracks?: Track[], options?: { shuffle?: boolean }) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;

    // Total duration (rarely changes, kept in context)
    duration: number;
    isBuffering: boolean;

    // Playlist logic (queue generation source)
    playingFromPlaylist: Playlist | null;

    // Queue state
    queue: Track[];
    reorderQueue: (oldIndex: number, newIndex: number) => void;

    // Playback controls
    playbackControls: PlaybackControls;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
    children: ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
    // Consume other contexts
    const { accessToken } = useAuth();
    const { selectedPlaylist, selectedTrack } = usePlayerUI();

    // Load playlist tracks (pass accessToken to avoid circular dependency)
    const { tracks: playlistTracks } = usePlaylistTracksLazy(selectedPlaylist?.id, accessToken, selectedPlaylist?.nb_items);

    // Queue manager
    const queueManager = useQueueManager({
        tracks: playlistTracks,
        initialTrack: selectedTrack,
    });

    // Playback state
    // Derived directly from QueueManager to avoid state duplication and sync loops
    const playingTrack = queueManager.currentTrack;
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    // Queue generation state
    const [playingFromPlaylist, setPlayingFromPlaylist] = useState<Playlist | null>(null);

    // Session Preloader (Preload next 5 tracks)
    useTrackPreloader(queueManager.queue, queueManager.currentIndex, accessToken);

    // Reporting
    const { trackEvent } = useReporting();
    const lastTrackRef = useRef<Track | null>(null);
    const lastEventRef = useRef<{ id: string; status: ReportingStatus } | null>(null);

    const handleReport = useCallback((track: Track, status: ReportingStatus, time: number) => {
        // Dedup logic for stopped (avoid double send on end + skip)
        if (status === 'stopped' && lastEventRef.current?.id === String(track.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        lastEventRef.current = { id: String(track.id), status };

        lastEventRef.current = { id: String(track.id), status };

        trackEvent({
            id: track.id,
            container_type: 'list', // Default to list for now
            id_container: playingFromPlaylist?.id || 0, // 0 if no container
            full: true,
            creation_datetime: Math.floor(Date.now() / 1000), // Seconds
            device_type: 'web',
            online: navigator.onLine,
            status,
            time: Math.floor(time),
            format: 'low',
            current_position: Math.floor(audioPlayer.audioRef.current?.currentTime || 0),
            play_mode: 'online',
            territory_code: 'FR', // Defaulting to FR
        });
    }, [trackEvent]);

    const handlePlay = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioPlayer.audioRef.current?.currentTime || 0;
        // Logic: if near 0, started, else resume.
        // Tolerance 1s to account for minor seek or latency
        const status: ReportingStatus = currentTime < 1 ? 'started' : 'resume';
        // Spec says: if started, time = 0.
        const time = status === 'started' ? 0 : currentTime;

        handleReport(playingTrack, status, time);
    }, [playingTrack, handleReport]); // audioPlayer ref is stable-ish

    const handlePause = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioPlayer.audioRef.current?.currentTime || 0;
        handleReport(playingTrack, 'paused', currentTime);
    }, [playingTrack, handleReport]);

    const handleStop = useCallback((time: number) => {
        // Determine which track stopped
        // If we in rotation (render), playingTrack is NEW, lastTrackRef is OLD.
        // If we in onEnded (event), playingTrack is CURRENT (same as lastTrackRef).

        const trackToReport = (playingTrack?.id !== lastTrackRef.current?.id)
            ? lastTrackRef.current
            : playingTrack;

        if (trackToReport) {
            handleReport(trackToReport, 'stopped', time);
        }
    }, [playingTrack, handleReport]);


    // Audio player with HLS support
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
            // Auto-play next track based on queue and repeat mode
            if (queueManager.repeatMode === 'one' && audioPlayer.audioRef.current) {
                // If repeat one, reset to 0 and play
                audioPlayer.audioRef.current.currentTime = 0;
                audioPlayer.audioRef.current.play().catch(console.error);
                if (!isPlaying) setIsPlaying(true);
            } else if (queueManager.canPlayNext) {
                queueManager.playNext();
            } else {
                setIsPlaying(false);
            }
        },
        onError: () => {
            // If loading fails after retries, skip to next
            console.log('[PlayerContext] Track loading failed, skipping to next');
            // Force stop playback to avoid inconsistent UI state
            setIsPlaying(false);

            if (queueManager.canPlayNext) {
                queueManager.playNext();
            }
        },
        onPlay: handlePlay,
        onPause: handlePause,
        onStop: handleStop,
    });



    // Playback controls (connected to queue manager)
    const playbackControlsHook = usePlaybackControls({
        isShuffled: queueManager.isShuffled,
        repeatMode: queueManager.repeatMode,
        onShuffle: queueManager.toggleShuffle,
        onPrevious: () => {
            const currentTime = audioPlayer.audioRef.current?.currentTime || 0;
            if (currentTime > 5) {
                // If more than 5s, restart current track
                audioPlayer.seek(0);
                if (!isPlaying && playingTrack) setIsPlaying(true);
            } else {
                if (queueManager.canPlayPrevious) {
                    queueManager.playPrevious();
                } else {
                    // If can't go back (first track) and below 5s, restart anyway
                    audioPlayer.seek(0);
                    if (!isPlaying && playingTrack) setIsPlaying(true);
                }
            }
        },
        onNext: queueManager.playNext,
        onRepeat: queueManager.toggleRepeat,
    });

    // Play a track from playlist (creates new queue)
    const playTrackFromPlaylist = useCallback((trackIndex: number, tracks?: Track[], options?: { shuffle?: boolean }) => {
        const tracksToPlay = tracks || playlistTracks;
        if (tracksToPlay && tracksToPlay.length > 0) {
            // Create new queue starting from the clicked track
            queueManager.setQueue(tracksToPlay, trackIndex, { shuffle: options?.shuffle });
            // Set the playlist we're playing from
            setPlayingFromPlaylist(selectedPlaylist);
        }
    }, [playlistTracks, queueManager, selectedPlaylist]);

    // Auto-update queue when all playlist tracks are loaded
    useEffect(() => {
        // Only update if:
        // 1. We're currently playing from a playlist
        // 2. We have loaded tracks
        // 3. The playlist indicates it has more tracks than what we have loaded
        if (
            playingFromPlaylist &&
            playlistTracks &&
            selectedPlaylist?.id === playingFromPlaylist.id &&
            selectedPlaylist?.nb_items &&
            playlistTracks.length < selectedPlaylist.nb_items
        ) {
            // Queue is incomplete, will be updated when playlistTracks grows
            return;
        }

        // If we have all tracks and are playing from this playlist, update the queue
        if (
            playingFromPlaylist &&
            playlistTracks &&
            selectedPlaylist?.id === playingFromPlaylist.id &&
            selectedPlaylist?.nb_items &&
            playlistTracks.length === selectedPlaylist.nb_items &&
            queueManager.totalTracks < selectedPlaylist.nb_items
        ) {
            console.log('[PlayerContext] All tracks loaded, updating queue with full playlist');
            // Find current track index in full list
            const currentTrackIndex = playlistTracks.findIndex(t => t.id === queueManager.currentTrack?.id);
            if (currentTrackIndex >= 0) {
                queueManager.setQueue(playlistTracks, currentTrackIndex, { keepState: true });
            }
        }
    }, [playlistTracks, playingFromPlaylist, selectedPlaylist, queueManager]);

    // Auto-play when track changes
    const hasUserInteractedRef = useRef(false);

    useEffect(() => {
        if (playingTrack) {
            // On iOS/Web, autoplay is often blocked unless there's an interaction.
            // We set isPlaying to true, but the actual play() call in useAudioPlayer 
            // will handle the catch() if blocked.
            
            // If it's a cold start (no user interaction yet), we might want to be careful,
            // but setting setIsPlaying(true) here is intended to start the flow.
            setIsPlaying(true);
            hasUserInteractedRef.current = true;
        }
    }, [playingTrack?.id]);

    // Playback controls object
    const playbackControls: PlaybackControls = useMemo(() => ({
        isShuffled: playbackControlsHook.isShuffled,
        repeatMode: playbackControlsHook.repeatMode,
        onShuffle: playbackControlsHook.handleShuffle,
        onPrevious: playbackControlsHook.handlePrevious,
        onNext: playbackControlsHook.handleNext,
        onRepeat: playbackControlsHook.handleRepeat,
    }), [playbackControlsHook]);

    // Update lastTrackRef for reporting detection
    useEffect(() => {
        lastTrackRef.current = playingTrack;
    }, [playingTrack]);


    const contextValue = useMemo(() => ({
        playingTrack,

        playTrackFromPlaylist,
        isPlaying,
        setIsPlaying,
        volume,
        setVolume,
        audioRef: audioPlayer.audioRef,
        duration: audioPlayer.duration,
        isBuffering: audioPlayer.isBuffering,
        queue: queueManager.queue,
        playbackControls,
        playingFromPlaylist,
        reorderQueue: queueManager.reorderQueue,
    }), [
        playingTrack,
        playTrackFromPlaylist,
        isPlaying,
        volume,
        audioPlayer.audioRef,
        audioPlayer.duration,
        audioPlayer.isBuffering,
        queueManager.queue,
        playbackControls,
        playingFromPlaylist,
        queueManager.reorderQueue
    ]);

    return (
        <PlayerContext.Provider value={contextValue}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
