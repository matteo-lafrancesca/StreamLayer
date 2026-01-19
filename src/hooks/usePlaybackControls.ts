import { useCallback } from 'react';

interface UsePlaybackControlsProps {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
}

interface UsePlaybackControlsReturn {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    handleShuffle: () => void;
    handlePrevious: () => void;
    handleNext: () => void;
    handleRepeat: () => void;
}

/**
 * Controlled hook for playback controls
 * Delegates all logic to parent (PlayerContext via queueManager)
 */
export function usePlaybackControls({
    isShuffled,
    repeatMode,
    onShuffle,
    onPrevious,
    onNext,
    onRepeat,
}: UsePlaybackControlsProps): UsePlaybackControlsReturn {
    const handleShuffle = useCallback(() => {
        onShuffle();
    }, [onShuffle]);

    const handlePrevious = useCallback(() => {
        onPrevious();
    }, [onPrevious]);

    const handleNext = useCallback(() => {
        onNext();
    }, [onNext]);

    const handleRepeat = useCallback(() => {
        onRepeat();
    }, [onRepeat]);

    return {
        isShuffled,
        repeatMode,
        handleShuffle,
        handlePrevious,
        handleNext,
        handleRepeat,
    };
}
