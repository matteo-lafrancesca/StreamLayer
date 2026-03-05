import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
import { formatDuration } from '@utils/time';

/**
 * Hook for local track progress without global re-renders.
 */
export function useTrackProgress() {
    const { isPlaying } = usePlayerState();
    const { audioRef } = usePlayerActions();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    const rafRef = useRef<number | null>(null);

    const updateProgress = useCallback(() => {
        if (audioRef?.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || 0;

            setCurrentTime(current);
            setDuration(total);

            if (total > 0) {
                setProgress((current / total) * 100);
            } else {
                setProgress(0);
            }
        }
    }, [audioRef]);

    useEffect(() => {
        if (isPlaying) {
            const loop = () => {
                updateProgress();
                rafRef.current = requestAnimationFrame(loop);
            };

            rafRef.current = requestAnimationFrame(loop);

            return () => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        } else {
            updateProgress();
        }
    }, [isPlaying, updateProgress]);

    const seek = useCallback((positionPercent: number) => {
        if (audioRef?.current) {
            const total = audioRef.current.duration || 0;
            if (total > 0) {
                const newTime = (positionPercent / 100) * total;
                audioRef.current.currentTime = newTime;

                setCurrentTime(newTime);
                setProgress(positionPercent);
            }
        }
    }, [audioRef]);

    const formattedCurrentTime = formatDuration(currentTime);
    const formattedRemainingTime = `-${formatDuration(Math.max(0, duration - currentTime))}`;

    return {
        currentTime,
        duration,
        progress,
        formattedCurrentTime,
        formattedRemainingTime,
        seek
    };
}
