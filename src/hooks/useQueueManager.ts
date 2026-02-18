import { useReducer, useCallback, useMemo } from 'react';
import type { Track } from '@definitions/track';

interface QueueState {
    currentIndex: number;
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    originalTracks: Track[];
    shuffledTracks: Track[];
}

type QueueAction =
    | { type: 'SET_QUEUE'; tracks: Track[]; startIndex: number; shuffle?: boolean; keepState?: boolean }
    | { type: 'PLAY_NEXT' }
    | { type: 'PLAY_PREVIOUS' }
    | { type: 'TOGGLE_SHUFFLE' }
    | { type: 'TOGGLE_REPEAT' }
    | { type: 'PLAY_INDEX'; index: number }
    | { type: 'PLAY_ID'; trackId: number }
    | { type: 'REORDER'; oldIndex: number; newIndex: number };

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
 * Fisher-Yates shuffle with current track preservation
 * Places current track at index 0, then shuffles the rest
 */
function shuffleArray(array: Track[], currentTrack: Track | null): Track[] {
    const shuffled = [...array];
    if (currentTrack) {
        const currentIndex = shuffled.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
        }
    }
    for (let i = shuffled.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i)) + 1;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function queueReducer(state: QueueState, action: QueueAction): QueueState {
    const activeList = state.isShuffled ? state.shuffledTracks : state.originalTracks;
    const currentTrack = activeList[state.currentIndex] || null;

    switch (action.type) {
        case 'SET_QUEUE': {
            const { tracks, startIndex, shuffle, keepState } = action;

            if (keepState) {
                if (state.isShuffled) {
                    const exists = tracks.find(t => t.id === currentTrack?.id);
                    if (exists) {
                        return {
                            ...state,
                            originalTracks: tracks,
                            shuffledTracks: shuffleArray(tracks, exists),
                            currentIndex: 0
                        };
                    }
                } else {
                    const newIndex = tracks.findIndex(t => t.id === currentTrack?.id);
                    return {
                        ...state,
                        originalTracks: tracks,
                        currentIndex: newIndex !== -1 ? newIndex : startIndex
                    };
                }
            }

            return {
                ...state,
                originalTracks: tracks,
                shuffledTracks: shuffleArray(tracks, tracks[startIndex] || null),
                currentIndex: startIndex,
                isShuffled: shuffle ?? false
            };
        }

        case 'PLAY_NEXT': {
            let nextRepeatMode = state.repeatMode;
            let nextIndex = state.currentIndex;
            const total = activeList.length;

            if (state.repeatMode === 'one') {
                nextRepeatMode = 'all';
            }

            if (state.currentIndex < total - 1) {
                nextIndex = state.currentIndex + 1;
            } else if (nextRepeatMode === 'all') {
                nextIndex = 0;
            }

            return { ...state, currentIndex: nextIndex, repeatMode: nextRepeatMode };
        }

        case 'PLAY_PREVIOUS': {
            let nextIndex = state.currentIndex;
            const total = activeList.length;

            if (state.currentIndex > 0) {
                nextIndex = state.currentIndex - 1;
            } else if (state.repeatMode === 'all') {
                nextIndex = total - 1;
            }

            return { ...state, currentIndex: nextIndex };
        }

        case 'TOGGLE_SHUFFLE': {
            const willShuffle = !state.isShuffled;
            if (willShuffle) {
                const newShuffled = shuffleArray(state.originalTracks, currentTrack);
                return { ...state, isShuffled: true, shuffledTracks: newShuffled, currentIndex: 0 };
            } else {
                const originalIndex = currentTrack
                    ? state.originalTracks.findIndex(t => t.id === currentTrack.id)
                    : 0;
                return { ...state, isShuffled: false, currentIndex: Math.max(0, originalIndex) };
            }
        }

        case 'TOGGLE_REPEAT': {
            const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
            const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % 3];
            return { ...state, repeatMode: nextMode };
        }

        case 'PLAY_INDEX': {
            if (action.index >= 0 && action.index < activeList.length) {
                return { ...state, currentIndex: action.index };
            }
            return state;
        }

        case 'PLAY_ID': {
            const index = activeList.findIndex(t => t.id === action.trackId);
            if (index !== -1) {
                return { ...state, currentIndex: index };
            }
            return state;
        }

        case 'REORDER': {
            const { oldIndex, newIndex } = action;
            if (oldIndex === newIndex) return state;

            const listKey = state.isShuffled ? 'shuffledTracks' : 'originalTracks';
            const newList = [...state[listKey]];
            const [removed] = newList.splice(oldIndex, 1);
            newList.splice(newIndex, 0, removed);

            let nextIndex = state.currentIndex;
            if (oldIndex === state.currentIndex) {
                nextIndex = newIndex;
            } else if (oldIndex < state.currentIndex && newIndex >= state.currentIndex) {
                nextIndex = state.currentIndex - 1;
            } else if (oldIndex > state.currentIndex && newIndex <= state.currentIndex) {
                nextIndex = state.currentIndex + 1;
            }

            return { ...state, [listKey]: newList, currentIndex: nextIndex };
        }

        default:
            return state;
    }
}

const initialState: QueueState = {
    currentIndex: 0,
    isShuffled: false,
    repeatMode: 'off',
    originalTracks: [],
    shuffledTracks: [],
};

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
