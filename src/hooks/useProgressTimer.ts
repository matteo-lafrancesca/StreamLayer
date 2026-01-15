import { useEffect, useRef } from 'react';

interface UseProgressTimerProps {
    isPlaying: boolean;
    progress: number;
    duration: number; // duration in seconds
    onProgressChange: (progress: number) => void;
}

/**
 * Hook to automatically increment progress when playing
 * Simulates playback without actual audio
 */
export function useProgressTimer({
    isPlaying,
    progress,
    duration,
    onProgressChange,
}: UseProgressTimerProps) {
    const animationRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isPlaying || duration <= 0) {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            lastTimeRef.current = null;
            return;
        }

        const updateProgress = (timestamp: number) => {
            if (lastTimeRef.current === null) {
                lastTimeRef.current = timestamp;
            }

            const elapsed = (timestamp - lastTimeRef.current) / 1000; // Convert to seconds
            lastTimeRef.current = timestamp;

            const progressIncrement = (elapsed / duration) * 100;
            const newProgress = Math.min(progress + progressIncrement, 100);

            onProgressChange(newProgress);

            // Stop if we've reached the end
            if (newProgress < 100) {
                animationRef.current = requestAnimationFrame(updateProgress);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(updateProgress);

        return () => {
            if (animationRef.current !== null) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, progress, duration, onProgressChange]);
}
