import { useState, useRef, useCallback } from 'react';

interface UseVolumeControlReturn {
    isMuted: boolean;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
}

export function useVolumeControl(
    initialVolume: number,
    onVolumeChange: (volume: number) => void
): UseVolumeControlReturn {
    const [isMuted, setIsMuted] = useState(false);
    const previousVolumeRef = useRef(initialVolume);

    const toggleMute = useCallback(() => {
        if (isMuted) {
            const volumeToRestore = previousVolumeRef.current > 0 ? previousVolumeRef.current : 100;
            onVolumeChange(volumeToRestore);
            setIsMuted(false);
        } else {
            if (initialVolume > 0) {
                previousVolumeRef.current = initialVolume;
            }
            onVolumeChange(0);
            setIsMuted(true);
        }
    }, [isMuted, initialVolume, onVolumeChange]);

    const setVolume = useCallback((volume: number) => {
        if (volume > 0) {
            previousVolumeRef.current = volume;
            setIsMuted(false);
        }
        onVolumeChange(volume);
    }, [onVolumeChange]);

    return {
        isMuted,
        toggleMute,
        setVolume,
    };
}

