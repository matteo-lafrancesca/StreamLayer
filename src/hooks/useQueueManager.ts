import { useReducer, useCallback, useMemo } from 'react';
import type { Track } from '@definitions/track';
import { queueReducer, initialState } from './queue/queueReducer';

interface UseQueueManagerProps {
    tracks: Track[] | null;
    initialTrack?: Track | null;
}

interface UseQueueManagerReturn {
    currentTrack: Track | null;
    currentIndex: number;
    totalTracks: number;
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    canPlayNext: boolean;
    canPlayPrevious: boolean;
    playNext: () => void;
    playPrevious: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    setQueue: (tracks: Track[], startIndex?: number, options?: { keepState?: boolean; shuffle?: boolean }) => void;
    playTrackAtIndex: (index: number) => void;
    playTrackById: (trackId: number) => void;
    reorderQueue: (oldIndex: number, newIndex: number) => void;
    queue: Track[];
}

/**
 * Hook to manage track queue and navigation
 * Handles shuffle, repeat modes, next/previous logic
 */
export function useQueueManager({ }: UseQueueManagerProps): UseQueueManagerReturn {
    const [state, dispatch] = useReducer(queueReducer, initialState);

    // Active track list (shuffled or original)
    const activeTrackList = useMemo(() => {
        return state.isShuffled ? state.shuffledTracks : state.originalTracks;
    }, [state.isShuffled, state.shuffledTracks, state.originalTracks]);

    const currentTrack = activeTrackList[state.currentIndex] || null;
    const totalTracks = activeTrackList.length;

    // Derived states
    const canPlayNext = state.repeatMode === 'all' || state.repeatMode === 'one' || state.currentIndex < totalTracks - 1;
    const canPlayPrevious = state.repeatMode === 'all' || state.currentIndex > 0;

    // Callbacks
    const setQueue = useCallback((newTracks: Track[], startIndex: number = 0, options: { keepState?: boolean; shuffle?: boolean } = {}) => {
        dispatch({ type: 'SET_QUEUE', tracks: newTracks, startIndex, ...options });
    }, []);

    const playNext = useCallback(() => dispatch({ type: 'PLAY_NEXT' }), []);
    const playPrevious = useCallback(() => dispatch({ type: 'PLAY_PREVIOUS' }), []);
    const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
    const toggleRepeat = useCallback(() => dispatch({ type: 'TOGGLE_REPEAT' }), []);
    const playTrackAtIndex = useCallback((index: number) => dispatch({ type: 'PLAY_INDEX', index }), []);
    const playTrackById = useCallback((trackId: number) => dispatch({ type: 'PLAY_ID', trackId }), []);
    const reorderQueue = useCallback((oldIndex: number, newIndex: number) => dispatch({ type: 'REORDER', oldIndex, newIndex }), []);

    return useMemo(() => ({
        currentTrack,
        currentIndex: state.currentIndex,
        totalTracks,
        isShuffled: state.isShuffled,
        repeatMode: state.repeatMode,
        canPlayNext,
        canPlayPrevious,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        setQueue,
        playTrackAtIndex,
        playTrackById,
        reorderQueue,
        queue: activeTrackList,
    }), [
        currentTrack,
        state.currentIndex,
        totalTracks,
        state.isShuffled,
        state.repeatMode,
        canPlayNext,
        canPlayPrevious,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        setQueue,
        playTrackAtIndex,
        playTrackById,
        reorderQueue,
        activeTrackList
    ]);
}
