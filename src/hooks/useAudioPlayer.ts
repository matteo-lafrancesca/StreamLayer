import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useHlsLoader } from './useHlsLoader';

interface UseAudioPlayerProps {
    trackId: number | null;
    accessToken: string | null;
    volume: number;
    shouldPlay: boolean;
    onEnded?: () => void;
    onError?: () => void; // Callback called after retry failure
}

interface UseAudioPlayerReturn {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    duration: number;
    isPlaying: boolean;
    isBuffering: boolean;
    seek: (time: number) => void;
}

/**
 * Hook to manage audio playback
 * Orchestrates the audio element and delegates streaming logic to useHlsLoader
 */
export function useAudioPlayer({
    trackId,
    accessToken,
    volume,
    shouldPlay,
    onEnded,
    onError,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    // Create a stable audio element instance (never changes)
    const audioElement = useMemo(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        return audio;
    }, []);

    const audioRef = useRef<HTMLAudioElement | null>(audioElement);
    // Ensure ref is always in sync
    if (audioRef.current !== audioElement) {
        audioRef.current = audioElement;
    }

    const bufferingTimeoutRef = useRef<number | null>(null); // Timeout for stalled buffering
    const BUFFERING_TIMEOUT = 10000; // 10 seconds max buffering

    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Cleanup audio element on unmount
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.removeAttribute('src'); // Avoids loading current page as access token
                audioElement.load(); // Reset element
            }
            audioRef.current = null;
            // setAudioElement(null); // No need to set state on unmount
        };
    }, []); // Empty dep array as audioElement is stable from creation

    // Setup event listeners on audio element
    useEffect(() => {
        const audio = audioElement; // Use state instance
        if (!audio) return;

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
        };

        const handlePlay = () => {
            setIsPlaying(true);
            setIsBuffering(false);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleWaiting = () => {
            setIsBuffering(true);

            // Start a buffering timeout (10s max)
            bufferingTimeoutRef.current = setTimeout(() => {
                console.error('[Audio] Buffering timeout (10s), skipping to next track');
                onError?.();
            }, BUFFERING_TIMEOUT);
        };

        const handleError = (e: Event) => {
            const target = e.target as HTMLAudioElement;
            console.error('[Audio] Error event:', e);
            if (target.error) {
                console.error('[Audio] Error details:', {
                    code: target.error.code,
                    message: target.error.message,
                    src: target.src,
                    currentSrc: target.currentSrc
                });
            }
        };

        const handlePlaying = () => {
            setIsBuffering(false);

            // Cancel timeout if playback resumes
            if (bufferingTimeoutRef.current) {
                clearTimeout(bufferingTimeoutRef.current);
                bufferingTimeoutRef.current = null;
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        // Note: timeupdate is handled locally in consumers via useTrackProgress
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('ended', handleEnded);

            // Cleanup: cancel timeout on unmount
            if (bufferingTimeoutRef.current) {
                clearTimeout(bufferingTimeoutRef.current);
                bufferingTimeoutRef.current = null;
            }
        };
    }, [audioElement, onEnded, onError]); // Dep on audioElement

    // Delegate stream loading to the specialized hook
    useHlsLoader({
        trackId,
        accessToken,
        audioElement, // Pass reactive state
        onError: () => onError?.(),
        onStreamReady: () => {
            setIsBuffering(false);
        }
    });

    // Reset loop states when track changes
    useEffect(() => {
        setDuration(0);
        setIsPlaying(false);
    }, [trackId]);

    // Sync volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]);

    // Sync play/pause with shouldPlay
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !trackId) return;

        if (shouldPlay && audio.paused) {
            audio.play().catch((error) => {
                // Ignore "AbortError" which happens during track transitions (normal behavior)
                if (error.name !== 'AbortError') {
                    console.error('Error playing audio:', error);
                }
            });
        } else if (!shouldPlay && !audio.paused) {
            audio.pause();
        }
    }, [shouldPlay, trackId]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    return {
        audioRef,
        duration,
        isPlaying,
        isBuffering,
        seek,
    };
}
