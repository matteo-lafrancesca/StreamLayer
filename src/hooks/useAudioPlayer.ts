import { useEffect, useRef, useState, useCallback } from 'react';
import { useHlsLoader } from './useHlsLoader';

interface UseAudioPlayerProps {
    trackId: number | null;
    nextTrackId: number | null;
    prevTrackId: number | null;
    accessToken: string | null;
    volume: number;
    shouldPlay: boolean;
    onEnded?: () => void;
    onError?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: (time: number) => void;
}

interface UseAudioPlayerReturn {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    duration: number;
    isPlaying: boolean;
    isBuffering: boolean;
    seek: (time: number) => void;
}

/**
 * Hook to manage audio playback with triple-player circular rotation.
 * Ensures gapless playback in both directions.
 */
export function useAudioPlayer({
    trackId,
    nextTrackId,
    prevTrackId,
    accessToken,
    volume,
    shouldPlay,
    onEnded,
    onError,
    onPlay,
    onPause,
    onStop,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    // Stable Audio Elements
    const audioElements = useRef<[HTMLAudioElement, HTMLAudioElement, HTMLAudioElement] | null>(null);
    if (!audioElements.current) {
        audioElements.current = [new Audio(), new Audio(), new Audio()];
        audioElements.current.forEach(audio => {
            audio.preload = 'metadata';
        });
    }

    // State & Refs
    const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Rotation Logic
    const [lastTrackId, setLastTrackId] = useState<number | null>(trackId);
    const historyRef = useRef({ next: nextTrackId, prev: prevTrackId });

    if (trackId !== lastTrackId) {
        const wasPrev = trackId === historyRef.current.prev;
        const targetIndex = wasPrev
            ? ((activeIndex + 2) % 3) as 0 | 1 | 2
            : ((activeIndex + 1) % 3) as 0 | 1 | 2;

        // Report stop for previous track if it was active
        if (lastTrackId && audioElements.current) {
            onStop?.(audioElements.current[activeIndex].currentTime);
        }

        if (trackId) {
            setActiveIndex(targetIndex);
            audioElements.current![targetIndex].currentTime = 0;
        }

        setLastTrackId(trackId);
        setDuration(0);
        setIsPlaying(false);
    }

    // Update history ref for next rotation
    useEffect(() => {
        historyRef.current = { next: nextTrackId, prev: prevTrackId };
    }, [nextTrackId, prevTrackId]);

    // Exposed ref pointing to current active element
    const activeAudio = audioElements.current[activeIndex];
    const exposedRef = useRef<HTMLAudioElement | null>(activeAudio);
    exposedRef.current = activeAudio;

    // Centralized Event Listeners
    useEffect(() => {
        const audios = audioElements.current!;

        const handlers = audios.map((audio, index) => {
            const isForActive = index === activeIndex;

            const events = {
                durationchange: () => isForActive && setDuration(audio.duration || 0),
                play: () => isForActive && (setIsPlaying(true), setIsBuffering(false), onPlay?.()),
                pause: () => isForActive && (setIsPlaying(false), onPause?.()),
                waiting: () => isForActive && setIsBuffering(true),
                playing: () => isForActive && setIsBuffering(false),
                ended: () => isForActive && (setIsPlaying(false), onEnded?.(), onStop?.(audio.duration || 0)),
                error: (e: Event) => isForActive && (console.error('[Audio] Player Error:', e), onError?.()),
            };

            Object.entries(events).forEach(([name, fn]) => audio.addEventListener(name, fn));
            return events;
        });

        return () => {
            audios.forEach((audio, index) => {
                Object.entries(handlers[index]).forEach(([name, fn]) => audio.removeEventListener(name, fn));
            });
        };
    }, [activeIndex, onEnded, onError, onPlay, onPause]);

    // HLS Loading
    const nextIndex = ((activeIndex + 1) % 3) as 0 | 1 | 2;
    const prevIndex = ((activeIndex + 2) % 3) as 0 | 1 | 2;

    const getTrackForIndex = (idx: 0 | 1 | 2) => {
        if (idx === activeIndex) return trackId;
        if (idx === nextIndex) return nextTrackId;
        if (idx === prevIndex) return prevTrackId;
        return null;
    };

    useHlsLoader({
        trackId: getTrackForIndex(0),
        accessToken,
        audioElement: audioElements.current![0],
        onError: () => activeIndex === 0 && onError?.(),
        onStreamReady: () => {
            if (activeIndex === 0) {
                setIsBuffering(false);
                // If we should be playing but were blocked by loading, try again
                if (shouldPlay && audioElements.current![0].paused) {
                    audioElements.current![0].play().catch(() => { });
                }
            }
        },
        priority: activeIndex === 0
    });

    useHlsLoader({
        trackId: getTrackForIndex(1),
        accessToken,
        audioElement: audioElements.current![1],
        onError: () => activeIndex === 1 && onError?.(),
        onStreamReady: () => {
            if (activeIndex === 1) {
                setIsBuffering(false);
                if (shouldPlay && audioElements.current![1].paused) {
                    audioElements.current![1].play().catch(() => { });
                }
            }
        },
        priority: activeIndex === 1
    });

    useHlsLoader({
        trackId: getTrackForIndex(2),
        accessToken,
        audioElement: audioElements.current![2],
        onError: () => activeIndex === 2 && onError?.(),
        onStreamReady: () => {
            if (activeIndex === 2) {
                setIsBuffering(false);
                if (shouldPlay && audioElements.current![2].paused) {
                    audioElements.current![2].play().catch(() => { });
                }
            }
        },
        priority: activeIndex === 2
    });

    // Volume & Playback Controls
    useEffect(() => {
        audioElements.current!.forEach(audio => {
            audio.volume = volume / 100;
        });
    }, [volume]);

    useEffect(() => {
        const audios = audioElements.current!;
        const activePlayer = audios[activeIndex];

        if (!activePlayer || !trackId) return;

        // Ensure others are paused
        audios.forEach((audio, idx) => {
            if (idx !== activeIndex && !audio.paused) audio.pause();
        });

        if (shouldPlay && activePlayer.paused) {
            activePlayer.play().catch(err => {
                if (err.name !== 'AbortError') console.error('[Audio] Play failed:', err);
            });
        } else if (!shouldPlay && !activePlayer.paused) {
            activePlayer.pause();
        }
    }, [shouldPlay, trackId, activeIndex, isBuffering, duration]);

    // Cleanup
    useEffect(() => {
        return () => {
            audioElements.current?.forEach(audio => {
                audio.pause();
                audio.src = '';
                audio.load();
            });
        };
    }, []);

    const seek = useCallback((time: number) => {
        if (activeAudio) activeAudio.currentTime = time;
    }, [activeAudio]);

    return {
        audioRef: exposedRef,
        duration,
        isPlaying,
        isBuffering,
        seek,
    };
}
