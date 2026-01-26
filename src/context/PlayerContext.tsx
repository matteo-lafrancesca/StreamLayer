import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode, type RefObject } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useAuthTokens } from '@hooks/useAuthTokens';
import { useQueueManager } from '@hooks/useQueueManager';
import { usePlaylistTracksLazy } from '@hooks/usePlaylistTracksLazy';

interface PlaybackControls {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
}

interface PlayerContextType {
    // Auth state
    projectId: string;
    accessToken: string | null;
    setAccessToken: (token: string | null) => void;
    refreshToken: string | null;
    setRefreshToken: (token: string | null) => void;

    // Playback state
    // Audio Ref for direct access
    audioRef: RefObject<HTMLAudioElement | null>;

    // Playback state
    playingTrack: Track | null;
    setPlayingTrack: (track: Track | null) => void;
    playTrackFromPlaylist: (trackIndex: number, tracks?: Track[]) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;

    // Total duration (rarely changes, kept in context)
    duration: number;
    isBuffering: boolean;

    // UI state
    selectedPlaylist: Playlist | null;
    setSelectedPlaylist: (playlist: Playlist | null) => void;
    playingFromPlaylist: Playlist | null;
    selectedTrack: Track | null;
    setSelectedTrack: (track: Track | null) => void;

    // Player expansion state
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;

    // Player compact mode state
    isCompact: boolean;
    setIsCompact: (isCompact: boolean) => void;

    // Queue state
    queue: Track[];

    // Seek state
    isSeeking: boolean;
    setIsSeeking: (isSeeking: boolean) => void;

    // Playback controls
    playbackControls: PlaybackControls;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
    projectId: string;
    children: ReactNode;
}

export function PlayerProvider({ projectId, children }: PlayerProviderProps) {
    // Auth tokens
    const { accessToken, refreshToken, setAccessToken, setRefreshToken } = useAuthTokens({ projectId });

    // Playback state
    const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);

    // UI state
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [playingFromPlaylist, setPlayingFromPlaylist] = useState<Playlist | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project' | 'queue' | 'track'>('project');
    const [isSeeking, setIsSeeking] = useState(false);
    const [isCompact, setIsCompact] = useState(false);

    // Load playlist tracks (pass accessToken to avoid circular dependency)
    const { tracks: playlistTracks } = usePlaylistTracksLazy(selectedPlaylist?.id, accessToken, selectedPlaylist?.nb_items);

    // Queue manager
    const queueManager = useQueueManager({
        tracks: playlistTracks,
        initialTrack: selectedTrack,
    });

    // Audio player with HLS support
    const audioPlayer = useAudioPlayer({
        trackId: playingTrack?.id ?? null,
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
    });

    // Sync queue track to playing track (one-way: queue is the source of truth)
    useEffect(() => {
        if (queueManager.currentTrack && queueManager.currentTrack.id !== playingTrack?.id) {
            setPlayingTrack(queueManager.currentTrack);
        } else if (!queueManager.currentTrack && playingTrack) {
            // If queue is cleared, stop immediately
            setPlayingTrack(null);
        }
    }, [queueManager.currentTrack, playingTrack]);

    // Playback controls (connected to queue manager)
    const playbackControlsHook = usePlaybackControls({
        isShuffled: queueManager.isShuffled,
        repeatMode: queueManager.repeatMode,
        onShuffle: queueManager.toggleShuffle,
        onPrevious: () => queueManager.playPrevious(audioPlayer.audioRef.current?.currentTime || 0),
        onNext: queueManager.playNext,
        onRepeat: queueManager.toggleRepeat,
    });

    // Play a track from playlist (creates new queue)
    const playTrackFromPlaylist = useCallback((trackIndex: number, tracks?: Track[]) => {
        const tracksToPlay = tracks || playlistTracks;
        if (tracksToPlay && tracksToPlay.length > 0) {
            // Create new queue starting from the clicked track
            queueManager.setQueue(tracksToPlay, trackIndex);
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
                queueManager.setQueue(playlistTracks, currentTrackIndex);
            }
        }
    }, [playlistTracks, playingFromPlaylist, selectedPlaylist, queueManager]);

    // Auto-play when track changes
    useEffect(() => {
        if (playingTrack) {
            // Reset logic is handled locally or by audio player
            setIsPlaying(true);
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

    return (
        <PlayerContext.Provider
            value={{
                projectId,
                accessToken,
                setAccessToken,
                refreshToken,
                setRefreshToken,
                playingTrack,
                setPlayingTrack,
                playTrackFromPlaylist,
                selectedPlaylist,
                setSelectedPlaylist,
                playingFromPlaylist,
                selectedTrack,
                setSelectedTrack,
                isPlaying,
                setIsPlaying,
                volume,
                setVolume,
                audioRef: audioPlayer.audioRef,
                duration: audioPlayer.duration,
                isBuffering: audioPlayer.isBuffering,
                isExpanded,
                setIsExpanded,
                currentView,
                setCurrentView,
                queue: queueManager.queue,
                playbackControls,
                isSeeking,
                setIsSeeking,
                isCompact,
                setIsCompact,
            }}
        >
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
