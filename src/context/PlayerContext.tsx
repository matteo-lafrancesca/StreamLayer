import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useQueueManager } from '@hooks/useQueueManager';
import { usePlaylistTracksLazy } from '@hooks/usePlaylistTracksLazy';
import { useTrackPreloader } from '@hooks/useTrackPreloader';
import { useTrackReporting } from '@hooks/useTrackReporting';
import { useAuth } from './AuthContext';
import { usePlayerUI } from './PlayerUIContext';

interface PlaybackControls {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
}

interface PlayerContextType {
    audioRef: RefObject<HTMLAudioElement | null>;

    // Playback state
    playingTrack: Track | null;

    playTrackFromPlaylist: (trackIndex: number, tracks?: Track[], options?: { shuffle?: boolean }) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;

    duration: number;
    isBuffering: boolean;

    // Playlist logic
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
    const { accessToken } = useAuth();
    const { selectedPlaylist, selectedTrack } = usePlayerUI();

    const { tracks: playlistTracks } = usePlaylistTracksLazy(selectedPlaylist?.id, accessToken, selectedPlaylist?.nb_items);

    // Queue manager
    const queueManager = useQueueManager({
        tracks: playlistTracks,
        initialTrack: selectedTrack,
    });

    // Playback state
    const playingTrack = queueManager.currentTrack;
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    // Queue generation state
    const [playingFromPlaylist, setPlayingFromPlaylist] = useState<Playlist | null>(null);

    // Session Preloader
    useTrackPreloader(queueManager.queue, queueManager.currentIndex, accessToken);

    // Audio Elements Reference
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reporting
    const { handlePlay, handlePause, handleStop } = useTrackReporting({
        playingTrack,
        playingFromPlaylist,
        audioRef
    });

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
            if (queueManager.repeatMode === 'one' && audioPlayer.audioRef.current) {
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
            console.log('[PlayerContext] Track loading failed, skipping to next');
            setIsPlaying(false);

            if (queueManager.canPlayNext) {
                queueManager.playNext();
            }
        },
        onPlay: handlePlay,
        onPause: handlePause,
        onStop: handleStop,
    });

    useEffect(() => {
        audioRef.current = audioPlayer.audioRef.current;
    }, [audioPlayer.audioRef]);

    // Playback controls
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

    // Auto-update queue when all playlist tracks are loaded
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
            console.log('[PlayerContext] All tracks loaded, updating queue with full playlist');
            const currentTrackIndex = playlistTracks.findIndex(t => t.id === queueManager.currentTrack?.id);
            if (currentTrackIndex >= 0) {
                queueManager.setQueue(playlistTracks, currentTrackIndex, { keepState: true });
            }
        }
    }, [playlistTracks, playingFromPlaylist, selectedPlaylist, queueManager.totalTracks, queueManager.currentTrack?.id, queueManager.setQueue]);



    const playbackControls: PlaybackControls = useMemo(() => ({
        isShuffled: playbackControlsHook.isShuffled,
        repeatMode: playbackControlsHook.repeatMode,
        onShuffle: playbackControlsHook.handleShuffle,
        onPrevious: playbackControlsHook.handlePrevious,
        onNext: playbackControlsHook.handleNext,
        onRepeat: playbackControlsHook.handleRepeat,
    }), [playbackControlsHook]);

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
