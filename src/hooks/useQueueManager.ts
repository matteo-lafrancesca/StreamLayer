import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Track } from '@definitions/track';

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
    setQueue: (tracks: Track[], startIndex?: number, options?: { keepState?: boolean }) => void;
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

    // Place current track at index 0
    if (currentTrack) {
        const currentIndex = shuffled.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
        }
    }

    // Shuffle from index 1 onwards
    for (let i = shuffled.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * i) + 1;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

/**
 * Hook to manage track queue and navigation
 * Handles shuffle, repeat modes, next/previous logic
 */
export function useQueueManager({ }: UseQueueManagerProps): UseQueueManagerReturn {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
    const [originalTracks, setOriginalTracks] = useState<Track[]>([]);
    const [shuffledTracks, setShuffledTracks] = useState<Track[]>([]);

    // Use refs to avoid dependency issues in callbacks
    const shuffledTracksRef = useRef<Track[]>([]);
    const originalTracksRef = useRef<Track[]>([]);
    const currentIndexRef = useRef<number>(0);

    // Keep refs in sync with state (single useEffect to minimize hook count)
    useEffect(() => {
        shuffledTracksRef.current = shuffledTracks;
        originalTracksRef.current = originalTracks;
        currentIndexRef.current = currentIndex;
    }, [shuffledTracks, originalTracks, currentIndex]);

    // Active track list (shuffled or original)
    const activeTrackList = useMemo(() => {
        return isShuffled ? shuffledTracks : originalTracks;
    }, [isShuffled, shuffledTracks, originalTracks]);

    // Current track
    const currentTrack = useMemo(() => {
        return activeTrackList[currentIndex] || null;
    }, [activeTrackList, currentIndex]);

    // Total tracks
    const totalTracks = activeTrackList.length;

    // Can play next/previous
    const canPlayNext = repeatMode === 'all' || repeatMode === 'one' || currentIndex < totalTracks - 1;
    const canPlayPrevious = repeatMode === 'all' || currentIndex > 0;

    // Set queue (called when playlist changes or loads)
    const setQueue = useCallback((newTracks: Track[], startIndex: number = 0, options: { keepState?: boolean } = {}) => {
        setOriginalTracks(newTracks);

        if (options.keepState) {
            // Update mode: preserve shuffle and current track/index if possible
            if (isShuffled) {
                const current = shuffledTracksRef.current[currentIndexRef.current];
                const exists = newTracks.find(t => t.id === current?.id);

                if (exists) {
                    // Re-shuffle everything
                    const newShuffled = shuffleArray(newTracks, exists);
                    setShuffledTracks(newShuffled);
                    setCurrentIndex(0);
                } else {
                    // Current track removed? Fallback to standard reset
                    setShuffledTracks(shuffleArray(newTracks, newTracks[startIndex] || null));
                    setCurrentIndex(startIndex);
                }
            } else {
                // Not shuffled: Find where the current track is in the new list
                const current = originalTracksRef.current[currentIndexRef.current];
                const newIndex = newTracks.findIndex(t => t.id === current?.id);
                setCurrentIndex(newIndex !== -1 ? newIndex : startIndex);
            }
        } else {
            // Default reset
            setOriginalTracks(newTracks);
            setShuffledTracks(shuffleArray(newTracks, newTracks[startIndex] || null));
            setCurrentIndex(startIndex);
            setIsShuffled(false);
        }
    }, [isShuffled]);

    // Play next track
    const playNext = useCallback(() => {
        let effectiveRepeatMode = repeatMode;

        if (repeatMode === 'one') {
            // User requested skip while in 'repeat one': switch to 'repeat all' and skip
            setRepeatMode('all');
            effectiveRepeatMode = 'all';
        }

        if (currentIndex < totalTracks - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (effectiveRepeatMode === 'all') {
            setCurrentIndex(0); // Loop to start
        }
        // If repeat is 'off' and we're at the end, don't change index
    }, [currentIndex, totalTracks, repeatMode]);

    // Play previous track (restart if > 3s into current track)
    // Play previous track
    const playPrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else if (repeatMode === 'all') {
            setCurrentIndex(totalTracks - 1); // Loop to end
        }
        // If at the start and repeat is 'off', do nothing (PlayerContext handles seek to 0 if needed)
    }, [currentIndex, totalTracks, repeatMode]);

    // Toggle shuffle
    const toggleShuffle = useCallback(() => {
        setIsShuffled(prev => {
            const newShuffled = !prev;

            if (newShuffled) {
                // Switching to shuffle
                const newShuffledList = shuffleArray(originalTracks, currentTrack);
                setShuffledTracks(newShuffledList);
                setCurrentIndex(0); // Current track is now at index 0
            } else {
                // Switching back to original order
                if (currentTrack) {
                    const originalIndex = originalTracks.findIndex(t => t.id === currentTrack.id);
                    setCurrentIndex(Math.max(0, originalIndex));
                }
            }

            return newShuffled;
        });
    }, [originalTracks, currentTrack]);

    // Reorder queue (for drag & drop)
    const reorderQueue = useCallback((oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;

        if (isShuffled) {
            setShuffledTracks(prev => {
                const newQueue = [...prev];
                const [removed] = newQueue.splice(oldIndex, 1);
                newQueue.splice(newIndex, 0, removed);

                // Update current index if the current track moved
                if (oldIndex === currentIndex) {
                    setCurrentIndex(newIndex);
                } else if (oldIndex < currentIndex && newIndex >= currentIndex) {
                    setCurrentIndex(prevIndex => prevIndex - 1);
                } else if (oldIndex > currentIndex && newIndex <= currentIndex) {
                    setCurrentIndex(prevIndex => prevIndex + 1);
                }

                return newQueue;
            });
        } else {
            setOriginalTracks(prev => {
                const newQueue = [...prev];
                const [removed] = newQueue.splice(oldIndex, 1);
                newQueue.splice(newIndex, 0, removed);

                // Update current index if the current track moved
                if (oldIndex === currentIndex) {
                    setCurrentIndex(newIndex);
                } else if (oldIndex < currentIndex && newIndex >= currentIndex) {
                    setCurrentIndex(prevIndex => prevIndex - 1);
                } else if (oldIndex > currentIndex && newIndex <= currentIndex) {
                    setCurrentIndex(prevIndex => prevIndex + 1);
                }

                return newQueue;
            });
        }
    }, [isShuffled, currentIndex]);

    // Toggle repeat mode
    const toggleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    }, []);

    // Play specific track by index
    const playTrackAtIndex = useCallback((index: number) => {
        if (index >= 0 && index < totalTracks) {
            setCurrentIndex(index);
        }
    }, [totalTracks]);

    // Play track by ID (for manual track selection from UI)
    const playTrackById = useCallback((trackId: number) => {
        const index = activeTrackList.findIndex(t => t.id === trackId);
        if (index >= 0) {
            setCurrentIndex(index);
        }
    }, [activeTrackList]);

    return useMemo(() => ({
        currentTrack,
        currentIndex,
        totalTracks,
        isShuffled,
        repeatMode,
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
        currentIndex,
        totalTracks,
        isShuffled,
        repeatMode,
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
