import { useState, useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { formatDuration } from '@utils/time';

/**
 * Hook to handle track progress locally without triggering global re-renders
 * Connects directly to the audio element reference
 */
export function useTrackProgress() {
    const { audioRef, isPlaying } = usePlayer();

    // Local state for UI updates
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);

    // Animation frame reference
    const rafRef = useRef<number | null>(null);

    // Update progress from audio element
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

    // Loop for smooth updates during playback
    useEffect(() => {
        if (isPlaying) {
            const loop = () => {
                updateProgress();
                rafRef.current = requestAnimationFrame(loop);
            };

            // Start loop
            rafRef.current = requestAnimationFrame(loop);

            return () => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                }
            };
        } else {
            // When paused, update once to ensure sync
            updateProgress();
        }
    }, [isPlaying, updateProgress]);

    // Handle manual seeking
    const seek = useCallback((positionPercent: number) => {
        if (audioRef?.current) {
            const total = audioRef.current.duration || 0;
            if (total > 0) {
                const newTime = (positionPercent / 100) * total;
                audioRef.current.currentTime = newTime;

                // Update local state immediately for responsiveness
                setCurrentTime(newTime);
                setProgress(positionPercent);
            }
        }
    }, [audioRef]);

    // Format times for display
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
