import { useEffect, useRef, useState, useCallback } from 'react';
import { useHlsLoader } from './useHlsLoader';

interface UseAudioPlayerProps {
    trackId: number | null;
    nextTrackId: number | null;
    prevTrackId: number | null; // Added for bidirectional gapless
    accessToken: string | null;
    volume: number;
    shouldPlay: boolean;
    onEnded?: () => void;
    onError?: () => void;
}

interface UseAudioPlayerReturn {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    duration: number;
    isPlaying: boolean;
    isBuffering: boolean;
    seek: (time: number) => void;
}

/**
 * Hook to manage audio playback with triple-player circular rotation
 * Enables gapless playback in both directions (forward and backward)
 * 
 * Strategy:
 * - 3 players rotate in a circular pattern (0 -> 1 -> 2 -> 0...)
 * - Active player plays current track
 * - Next player (+1 mod 3) preloads next track
 * - Prev player (-1 mod 3) preloads previous track
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
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    // Create three stable audio elements for circular rotation
    const audioRef0 = useRef<HTMLAudioElement | null>(null);
    const audioRef1 = useRef<HTMLAudioElement | null>(null);
    const audioRef2 = useRef<HTMLAudioElement | null>(null);

    // Initialize audio elements once
    if (!audioRef0.current) {
        audioRef0.current = new Audio();
        audioRef0.current.preload = 'metadata';
    }
    if (!audioRef1.current) {
        audioRef1.current = new Audio();
        audioRef1.current.preload = 'metadata';
    }
    if (!audioRef2.current) {
        audioRef2.current = new Audio();
        audioRef2.current.preload = 'metadata';
    }

    // State to track which player is currently active (0, 1, or 2)
    const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);

    // Helper to get player refs
    const getPlayerRef = (index: 0 | 1 | 2) => {
        if (index === 0) return audioRef0.current;
        if (index === 1) return audioRef1.current;
        return audioRef2.current;
    };

    const activeAudio = getPlayerRef(activeIndex);

    // Exposed ref that always points to the active element
    const exposedRef = useRef<HTMLAudioElement | null>(activeAudio);

    // Update exposed ref when active player changes
    useEffect(() => {
        if (exposedRef.current !== activeAudio) {
            exposedRef.current = activeAudio;
        }
    }, [activeAudio]);

    // Track ID history to detect changes
    const [lastTrackId, setLastTrackId] = useState<number | null>(trackId);

    // Keep track of previous next/prev IDs to determine direction
    const historyRef = useRef({ next: nextTrackId, prev: prevTrackId });

    // Update history after render
    useEffect(() => {
        historyRef.current = { next: nextTrackId, prev: prevTrackId };
    }, [nextTrackId, prevTrackId]);

    // --- State Management ---
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Derived State: Synchronously rotate active player when trackId changes
    if (trackId !== lastTrackId) {
        setLastTrackId(trackId);

        if (trackId) {
            const wasPrev = trackId === historyRef.current.prev;

            // Calculate target index based on direction
            // Backward: +2 mod 3 (equivalent to -1)
            // Forward: +1 mod 3
            const targetIndex = wasPrev
                ? ((activeIndex + 2) % 3) as 0 | 1 | 2
                : ((activeIndex + 1) % 3) as 0 | 1 | 2;

            setActiveIndex(targetIndex);

            // Reset time for the target player (crucial for "Previous" action to start at 0)
            const targetPlayer = getPlayerRef(targetIndex);
            if (targetPlayer) {
                targetPlayer.currentTime = 0;
            }
        }

        // Reset transient states
        setDuration(0);
        setIsPlaying(false);
    }

    // --- Event Listeners ---
    useEffect(() => {
        const setupListeners = (audio: HTMLAudioElement, isForActive: boolean) => {
            if (!audio) return;

            const handleDurationChange = () => {
                if (isForActive) setDuration(audio.duration || 0);
            };

            const handlePlay = () => {
                if (isForActive) {
                    setIsPlaying(true);
                    setIsBuffering(false);
                }
            };

            const handlePause = () => {
                if (isForActive) setIsPlaying(false);
            };

            const handleWaiting = () => {
                if (isForActive) setIsBuffering(true);
            };

            const handlePlaying = () => {
                if (isForActive) setIsBuffering(false);
            };

            const handleEnded = () => {
                if (isForActive) {
                    setIsPlaying(false);
                    onEnded?.();
                }
            };

            const handleError = (e: Event) => {
                if (isForActive) {
                    console.error('[Audio] Error:', e);
                }
            };

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
            };
        };

        const cleanup0 = setupListeners(audioRef0.current!, activeIndex === 0);
        const cleanup1 = setupListeners(audioRef1.current!, activeIndex === 1);
        const cleanup2 = setupListeners(audioRef2.current!, activeIndex === 2);

        return () => {
            cleanup0?.();
            cleanup1?.();
            cleanup2?.();
        };
    }, [activeIndex, onEnded, onError]);

    // --- HLS Loading with Triple Player Rotation ---
    // Calculate which track each player should load based on active index
    // Active player = trackId
    // Next player (clockwise) = nextTrackId
    // Prev player (counter-clockwise) = prevTrackId

    const nextPlayerIndex = ((activeIndex + 1) % 3) as 0 | 1 | 2;
    const prevPlayerIndex = ((activeIndex + 2) % 3) as 0 | 1 | 2; // +2 is same as -1 in mod 3

    const trackForPlayer = [
        activeIndex === 0 ? trackId : (nextPlayerIndex === 0 ? nextTrackId : prevTrackId),
        activeIndex === 1 ? trackId : (nextPlayerIndex === 1 ? nextTrackId : prevTrackId),
        activeIndex === 2 ? trackId : (nextPlayerIndex === 2 ? nextTrackId : prevTrackId),
    ];

    useHlsLoader({
        trackId: trackForPlayer[0],
        accessToken,
        audioElement: audioRef0.current,
        onError: () => {
            if (activeIndex === 0) onError?.();
        },
        onStreamReady: () => {
            if (activeIndex === 0) setIsBuffering(false);
        }
    });

    useHlsLoader({
        trackId: trackForPlayer[1],
        accessToken,
        audioElement: audioRef1.current,
        onError: () => {
            if (activeIndex === 1) onError?.();
        },
        onStreamReady: () => {
            if (activeIndex === 1) setIsBuffering(false);
        }
    });

    useHlsLoader({
        trackId: trackForPlayer[2],
        accessToken,
        audioElement: audioRef2.current,
        onError: () => {
            if (activeIndex === 2) onError?.();
        },
        onStreamReady: () => {
            if (activeIndex === 2) setIsBuffering(false);
        }
    });

    // --- Volume Sync ---
    useEffect(() => {
        if (audioRef0.current) audioRef0.current.volume = volume / 100;
        if (audioRef1.current) audioRef1.current.volume = volume / 100;
        if (audioRef2.current) audioRef2.current.volume = volume / 100;
    }, [volume]);

    // --- Play/Pause Control ---
    useEffect(() => {
        const audio = getPlayerRef(activeIndex);
        const player1 = getPlayerRef(nextPlayerIndex);
        const player2 = getPlayerRef(prevPlayerIndex);

        if (!audio || !trackId) return;

        // Ensure inactive players are paused
        if (player1 && !player1.paused) player1.pause();
        if (player2 && !player2.paused) player2.pause();

        if (shouldPlay && audio.paused) {
            const playPromise = audio.play();
            playPromise.catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Error playing audio:', error);
                }
            });
        } else if (!shouldPlay && !audio.paused) {
            audio.pause();
        }
    }, [shouldPlay, trackId, activeIndex, nextPlayerIndex, prevPlayerIndex]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef0.current) {
                audioRef0.current.pause();
                audioRef0.current.src = '';
            }
            if (audioRef1.current) {
                audioRef1.current.pause();
                audioRef1.current.src = '';
            }
            if (audioRef2.current) {
                audioRef2.current.pause();
                audioRef2.current.src = '';
            }
        };
    }, []);

    const seek = useCallback((time: number) => {
        if (exposedRef.current) {
            exposedRef.current.currentTime = time;
        }
    }, []);

    return {
        audioRef: exposedRef,
        duration,
        isPlaying,
        isBuffering,
        seek,
    };
}
