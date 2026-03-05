import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useQueueManager } from '@hooks/useQueueManager';
import { usePlaylistTracksLazy } from '@hooks/usePlaylistTracksLazy';
import { useTrackPreloader } from '@hooks/useTrackPreloader';
import { useTrackReporting } from '@hooks/useTrackReporting';
import { useMediaSession } from '@hooks/useMediaSession';
import { useAuth } from './AuthContext';
import { usePlayerUI } from './PlayerUIContext';
import { Logger } from '@utils/logger';

interface PlaybackControls {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
}

interface PlayerStateContextType {
    playingTrack: Track | null;
    nextTrack: Track | null;
    prevTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    duration: number;
    isBuffering: boolean;
    playingFromPlaylist: Playlist | null;
    queue: Track[];
    playbackControlsState: {
        isShuffled: boolean;
        repeatMode: 'off' | 'all' | 'one';
    };
}

interface PlayerActionsContextType {
    audioRef: RefObject<HTMLAudioElement | null>;
    playTrackFromPlaylist: (trackIndex: number, tracks?: Track[], options?: { shuffle?: boolean }) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setVolume: (volume: number) => void;
    reorderQueue: (oldIndex: number, newIndex: number) => void;
    playbackControlsActions: {
        onShuffle: () => void;
        onPrevious: () => void;
        onNext: () => void;
        onRepeat: () => void;
    };
}

const PlayerStateContext = createContext<PlayerStateContextType | undefined>(undefined);
const PlayerActionsContext = createContext<PlayerActionsContextType | undefined>(undefined);

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

    useTrackPreloader(queueManager.queue, queueManager.currentIndex, accessToken);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { handlePlay, handlePause, handleStop } = useTrackReporting({
        playingTrack,
        playingFromPlaylist,
        audioRef
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
                audioPlayer.audioRef.current.play().catch((err) => Logger.error('[Player] Repeat play failed', err));
                if (!isPlaying) setIsPlaying(true);
            } else if (queueManager.canPlayNext) {
                queueManager.playNext();
            } else {
                setIsPlaying(false);
            }
        },
        onError: () => {
            Logger.warn('[PlayerContext] Track loading failed, skipping to next');
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

export function usePlayerState() {
    const context = useContext(PlayerStateContext);
    if (context === undefined) {
        throw new Error('usePlayerState must be used within a PlayerProvider');
    }
    return context;
}

export function usePlayerActions() {
    const context = useContext(PlayerActionsContext);
    if (context === undefined) {
        throw new Error('usePlayerActions must be used within a PlayerProvider');
    }
    return context;
}

export function usePlayer() {
    const state = usePlayerState();
    const actions = usePlayerActions();

    return {
        ...state,
        ...actions,
        playbackControls: {
            ...state.playbackControlsState,
            ...actions.playbackControlsActions
        }
    };
}
