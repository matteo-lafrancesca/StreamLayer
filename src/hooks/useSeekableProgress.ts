import { useState, useCallback, useMemo } from 'react';
import { useTrackProgress } from './useTrackProgress';
import { formatDuration } from '@utils/time';

interface UseSeekableProgressReturn {
    progress: number;
    currentTime: number;
    duration: number;
    formattedCurrentTime: string;
    formattedRemainingTime: string;
    isDragging: boolean;
    dragProgress: number;
    handleSeekStart: (val: number) => void;
    handleSeekChange: (val: number) => void;
    handleSeekEnd: (val: number) => void;
    seek: (val: number) => void;
}

/**
 * Hook to manage track progress with seek (drag) capability.
 * Consolidates logic for ProgressBar and ProgressSlider.
 */
export function useSeekableProgress(interactive: boolean = true): UseSeekableProgressReturn {
    const { progress, currentTime, duration, formattedCurrentTime, formattedRemainingTime, seek } = useTrackProgress();

    const [isDragging, setIsDragging] = useState(false);
    const [dragProgress, setDragProgress] = useState(0);

    const handleSeekStart = useCallback((val: number) => {
        setIsDragging(true);
        setDragProgress(val);
    }, []);

    const handleSeekChange = useCallback((val: number) => {
        if (interactive) {
            setDragProgress(val);
        }
    }, [interactive]);

    const handleSeekEnd = useCallback((val: number) => {
        setIsDragging(false);
        if (interactive) {
            seek(val);
        }
    }, [interactive, seek]);

    const displayTime = useMemo(() => {
        if (isDragging) {
            const dragTime = (dragProgress / 100) * duration;
            return {
                current: formatDuration(dragTime),
                remaining: `-${formatDuration(Math.max(0, duration - dragTime))}`
            };
        }
        return {
            current: formattedCurrentTime,
            remaining: formattedRemainingTime
        };
    }, [isDragging, dragProgress, duration, formattedCurrentTime, formattedRemainingTime]);

    return {
        progress,
        currentTime,
        duration,
        formattedCurrentTime: displayTime.current,
        formattedRemainingTime: displayTime.remaining,
        isDragging,
        dragProgress,
        handleSeekStart,
        handleSeekChange,
        handleSeekEnd,
        seek
    };
}
