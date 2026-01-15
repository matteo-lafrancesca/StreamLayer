import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Track } from '../types/track';
import type { Playlist } from '../types/playlist';
import { getInitialTokens } from '../services/api/auth';
import { usePlaybackControls } from '../hooks/usePlaybackControls';
import { useProgressTimer } from '../hooks/useProgressTimer';

// Structured state types (for documentation)
// These types help organize the context structure conceptually
// interface AuthState {
//     projectId: string;
//     accessToken: string | null;
//     refreshToken: string | null;
// }
//
// interface PlaybackState {
//     playingTrack: Track | null;
//     isPlaying: boolean;
//     volume: number;
//     progress: number; // 0-100
//     currentTime: string; // formatted as "M:SS"
//     duration: string; // formatted as "M:SS"
// }
//
// interface UIState {
//     selectedPlaylist: Playlist | null;
//     selectedTrack: Track | null;
// }

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
    refreshToken: string | null;

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

    // Playback controls
    playbackControls: PlaybackControls;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
    projectId: string;
    children: ReactNode;
}

export function PlayerProvider({ projectId, children }: PlayerProviderProps) {
    const [playingTrack, setPlayingTrack] = useState<Track | null>(null);
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);
    const [progress, setProgress] = useState(0);

    // Playback controls hook
    const playbackControlsHook = usePlaybackControls();

    // Récupérer les tokens au montage du composant
    useEffect(() => {
        getInitialTokens(projectId)
            .then((tokens) => {
                setAccessToken(tokens.access_token);
                setRefreshToken(tokens.refresh_token);
            })
            .catch((error) => {
                console.error('Erreur lors de la récupération des tokens:', error);
            });
    }, [projectId]);

    // Auto-increment progress when playing
    useProgressTimer({
        isPlaying,
        progress,
        duration: playingTrack?.duration || 0,
        onProgressChange: setProgress,
    });

    // Reset progress and auto-play when track changes
    useEffect(() => {
        if (playingTrack) {
            setProgress(0);
            setIsPlaying(true); // Auto-play when selecting a new track
        }
    }, [playingTrack?.id]);

    // Calculate currentTime and duration from track and progress
    const { currentTime, duration } = useMemo(() => {
        if (!playingTrack) {
            return { currentTime: '0:00', duration: '0:00' };
        }

        const currentSeconds = Math.floor((progress / 100) * playingTrack.duration);
        const remainingSeconds = playingTrack.duration - currentSeconds;

        const currentMinutes = Math.floor(currentSeconds / 60);
        const currentSecs = currentSeconds % 60;
        const currentTimeFormatted = `${currentMinutes}:${currentSecs.toString().padStart(2, '0')}`;

        const remainingMinutes = Math.floor(remainingSeconds / 60);
        const remainingSecs = remainingSeconds % 60;
        const remainingTimeFormatted = `${remainingMinutes}:${remainingSecs.toString().padStart(2, '0')}`;

        return {
            currentTime: currentTimeFormatted,
            duration: remainingTimeFormatted,
        };
    }, [playingTrack, progress]);

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
                refreshToken,
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
