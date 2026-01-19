import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useAudioPlayer } from '@hooks/useAudioPlayer';
import { useAuthTokens } from '@hooks/useAuthTokens';
import { useQueueManager } from '@hooks/useQueueManager';
import { usePlaylistTracks } from '@hooks/usePlaylistTracks';

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
    playingTrack: Track | null;
    setPlayingTrack: (track: Track | null) => void;
    playTrackFromPlaylist: (trackIndex: number, tracks?: Track[]) => void;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
    progress: number;
    setProgress: (progress: number) => void;
    currentTime: string;
    duration: string;
    isBuffering: boolean;

    // UI state
    selectedPlaylist: Playlist | null;
    setSelectedPlaylist: (playlist: Playlist | null) => void;
    selectedTrack: Track | null;
    setSelectedTrack: (track: Track | null) => void;

    // Player expansion state
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    currentView: 'playlist' | 'project' | 'queue';
    setCurrentView: (view: 'playlist' | 'project' | 'queue') => void;

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
    const [progress, setProgress] = useState(0);

    // UI state
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project' | 'queue'>('project');
    const [isSeeking, setIsSeeking] = useState(false);

    // Load playlist tracks (pass accessToken to avoid circular dependency)
    const { tracks: playlistTracks } = usePlaylistTracks(selectedPlaylist?.id, accessToken);

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
            if (queueManager.canPlayNext) {
                queueManager.playNext();
            } else {
                setIsPlaying(false);
            }
        },
    });

    // Sync queue track to playing track (one-way: queue is the source of truth)
    useEffect(() => {
        if (queueManager.currentTrack && queueManager.currentTrack.id !== playingTrack?.id) {
            setPlayingTrack(queueManager.currentTrack);
        }
    }, [queueManager.currentTrack, playingTrack]);

    // Playback controls (connected to queue manager)
    const playbackControlsHook = usePlaybackControls({
        isShuffled: queueManager.isShuffled,
        repeatMode: queueManager.repeatMode,
        onShuffle: queueManager.toggleShuffle,
        onPrevious: () => queueManager.playPrevious(audioPlayer.currentTime),
        onNext: queueManager.playNext,
        onRepeat: queueManager.toggleRepeat,
    });

    // Calculate progress percentage once (avoid duplication)
    const progressPercent = useMemo(() => {
        return audioPlayer.duration > 0
            ? (audioPlayer.currentTime / audioPlayer.duration) * 100
            : 0;
    }, [audioPlayer.currentTime, audioPlayer.duration]);

    // Sync progress from audio player
    useEffect(() => {
        if (!isSeeking && audioPlayer.duration > 0) {
            setProgress(progressPercent);
        }
    }, [progressPercent, isSeeking, audioPlayer.duration]);

    // Time display (format from audio player's actual time)
    const currentTime = useMemo(() => {
        if (!audioPlayer.duration) return '0:00';
        const currentSeconds = Math.floor((progressPercent / 100) * audioPlayer.duration);
        const mins = Math.floor(currentSeconds / 60);
        const secs = Math.floor(currentSeconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, [progressPercent, audioPlayer.duration]);

    const duration = useMemo(() => {
        if (!audioPlayer.duration) return '0:00';
        const remainingSeconds = Math.floor(audioPlayer.duration - (progressPercent / 100) * audioPlayer.duration);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = Math.floor(remainingSeconds % 60);
        return `-${mins}:${secs.toString().padStart(2, '0')}`;
    }, [progressPercent, audioPlayer.duration]);

    // Function to play a track from the playlist (creates new queue)
    const playTrackFromPlaylist = useCallback((trackIndex: number, tracks?: Track[]) => {
        const tracksToPlay = tracks || playlistTracks;
        if (tracksToPlay && tracksToPlay.length > 0) {
            // Create new queue starting from the clicked track
            queueManager.setQueue(tracksToPlay, trackIndex);
        }
    }, [playlistTracks, queueManager]);

    // Auto-play when track changes
    useEffect(() => {
        if (playingTrack) {
            setProgress(0);
            setIsPlaying(true);
        }
    }, [playingTrack?.id]);

    // Handle manual progress changes (seeking)
    const handleProgressChange = useCallback((newProgress: number) => {
        setProgress(newProgress);
        // Convert percentage to seconds and seek
        if (audioPlayer.duration > 0) {
            const seekTime = (newProgress / 100) * audioPlayer.duration;
            audioPlayer.seek(seekTime);
        }
    }, [audioPlayer.duration, audioPlayer.seek]);

    // Playback controls object
    const playbackControls: PlaybackControls = {
        isShuffled: playbackControlsHook.isShuffled,
        repeatMode: playbackControlsHook.repeatMode,
        onShuffle: playbackControlsHook.handleShuffle,
        onPrevious: playbackControlsHook.handlePrevious,
        onNext: playbackControlsHook.handleNext,
        onRepeat: playbackControlsHook.handleRepeat,
    };

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
                selectedTrack,
                setSelectedTrack,
                isPlaying,
                setIsPlaying,
                volume,
                setVolume,
                progress,
                setProgress: handleProgressChange,
                currentTime,
                duration,
                isBuffering: audioPlayer.isBuffering,
                isExpanded,
                setIsExpanded,
                currentView,
                setCurrentView,
                queue: queueManager.queue,
                playbackControls,
                isSeeking,
                setIsSeeking,
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
