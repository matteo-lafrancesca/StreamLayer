import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { usePlaybackControls } from '@hooks/usePlaybackControls';
import { useProgressTimer } from '@hooks/useProgressTimer';
import { useTimeDisplay } from '@hooks/useTimeDisplay';
import { useAuthTokens } from '@hooks/useAuthTokens';

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
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
    progress: number;
    setProgress: (progress: number) => void;
    currentTime: string;
    duration: string;

    // UI state
    selectedPlaylist: Playlist | null;
    setSelectedPlaylist: (playlist: Playlist | null) => void;
    selectedTrack: Track | null;
    setSelectedTrack: (track: Track | null) => void;

    // Player expansion state
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    currentView: 'playlist' | 'project';
    setCurrentView: (view: 'playlist' | 'project') => void;

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
    const [currentView, setCurrentView] = useState<'playlist' | 'project'>('project');

    // Playback controls
    const playbackControlsHook = usePlaybackControls();

    // Auto-increment progress when playing
    useProgressTimer({
        isPlaying,
        progress,
        duration: playingTrack?.duration || 0,
        onProgressChange: setProgress,
    });

    // Time display
    const { currentTime, duration } = useTimeDisplay({
        playingTrack,
        progress,
    });

    // Reset progress and auto-play when track changes
    useEffect(() => {
        if (playingTrack) {
            setProgress(0);
            setIsPlaying(true);
        }
    }, [playingTrack?.id]);

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
                selectedPlaylist,
                setSelectedPlaylist,
                selectedTrack,
                setSelectedTrack,
                isPlaying,
                setIsPlaying,
                volume,
                setVolume,
                progress,
                setProgress,
                currentTime,
                duration,
                isExpanded,
                setIsExpanded,
                currentView,
                setCurrentView,
                playbackControls,
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
