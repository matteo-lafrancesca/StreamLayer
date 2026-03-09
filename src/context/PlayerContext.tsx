import { createContext, useContext, type RefObject } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';

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

export const PlayerStateContext = createContext<PlayerStateContextType | undefined>(undefined);
export const PlayerActionsContext = createContext<PlayerActionsContextType | undefined>(undefined);


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
