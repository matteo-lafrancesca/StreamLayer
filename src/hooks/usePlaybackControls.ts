import { useState, useCallback } from 'react';

interface UsePlaybackControlsReturn {
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    handleShuffle: () => void;
    handlePrevious: () => void;
    handleNext: () => void;
    handleRepeat: () => void;
}

export function usePlaybackControls(): UsePlaybackControlsReturn {
    const [isShuffled, setIsShuffled] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

    const handleShuffle = useCallback(() => {
        setIsShuffled(prev => !prev);
        // TODO: Implement shuffle logic
    }, []);

    const handlePrevious = useCallback(() => {
        // TODO: Implement previous track logic
        console.log('Previous track');
    }, []);

    const handleNext = useCallback(() => {
        // TODO: Implement next track logic
        console.log('Next track');
    }, []);

    const handleRepeat = useCallback(() => {
        setRepeatMode(prev => {
            if (prev === 'off') return 'all';
            if (prev === 'all') return 'one';
            return 'off';
        });
    }, []);

    return {
        isShuffled,
        repeatMode,
        handleShuffle,
        handlePrevious,
        handleNext,
        handleRepeat,
    };
}
