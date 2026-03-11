import { useEffect, useRef, useState, useCallback } from 'react';
import { useHlsLoader } from './useHlsLoader';
import { Logger } from '@utils/system';

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
    onSeeking?: () => void;
    onSeeked?: () => void;
    onFormatChange?: (format: 'low' | 'high') => void;
}

interface UseAudioPlayerReturn {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    duration: number;
    isPlaying: boolean;
    isBuffering: boolean;
    seek: (time: number) => void;
}

// Gère la lecture audio avec une rotation circulaire de 3 lecteurs (triple-buffering)
// Permet un enchaînement sans blanc (gapless) dans les deux sens
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
    onSeeking,
    onSeeked,
    onFormatChange,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    const audioElements = useRef<[HTMLAudioElement, HTMLAudioElement, HTMLAudioElement] | null>(null);
    if (!audioElements.current) {
        audioElements.current = [new Audio(), new Audio(), new Audio()];
        audioElements.current.forEach(audio => {
            audio.preload = 'metadata';
        });
    }

    const [activeIndex, setActiveIndex] = useState<0 | 1 | 2>(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    const [lastTrackId, setLastTrackId] = useState<number | null>(trackId);
    const historyRef = useRef({ next: nextTrackId, prev: prevTrackId });

    if (trackId !== lastTrackId) {
        const wasPrev = trackId === historyRef.current.prev;
        const targetIndex = wasPrev
            ? ((activeIndex + 2) % 3) as 0 | 1 | 2
            : ((activeIndex + 1) % 3) as 0 | 1 | 2;

        // On signale l'arrêt de la piste précédente
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

    useEffect(() => {
        historyRef.current = { next: nextTrackId, prev: prevTrackId };
    }, [nextTrackId, prevTrackId]);

    // On garde les dernières versions des callbacks pour éviter de réattacher les évents
    const callbacksRef = useRef({ onEnded, onError, onPlay, onPause, onStop, onSeeking, onSeeked });
    const activeIndexRef = useRef(activeIndex);

    useEffect(() => {
        callbacksRef.current = { onEnded, onError, onPlay, onPause, onStop, onSeeking, onSeeked };
        activeIndexRef.current = activeIndex;
    });

    const activeAudio = audioElements.current[activeIndex];
    const exposedRef = useRef<HTMLAudioElement | null>(activeAudio);
    exposedRef.current = activeAudio;

    // On attache les écouteurs d'évènements UNE SEULE FOIS
    useEffect(() => {
        const audios = audioElements.current!;

        const handlers = audios.map((audio, index) => {
            const events = {
                durationchange: () => {
                    if (index === activeIndexRef.current) setDuration(audio.duration || 0);
                },
                play: () => {
                    if (index === activeIndexRef.current) {
                        setIsPlaying(true);
                        setIsBuffering(false);
                        callbacksRef.current.onPlay?.();
                    }
                },
                pause: () => {
                    if (index === activeIndexRef.current) {
                        setIsPlaying(false);
                        callbacksRef.current.onPause?.();
                    }
                },
                waiting: () => {
                    if (index === activeIndexRef.current) setIsBuffering(true);
                },
                playing: () => {
                    if (index === activeIndexRef.current) setIsBuffering(false);
                },
                ended: () => {
                    if (index === activeIndexRef.current) {
                        setIsPlaying(false);
                        callbacksRef.current.onEnded?.();
                        callbacksRef.current.onStop?.(audio.duration || 0);
                    }
                },
                seeking: () => {
                    if (index === activeIndexRef.current) callbacksRef.current.onSeeking?.();
                },
                seeked: () => {
                    if (index === activeIndexRef.current) callbacksRef.current.onSeeked?.();
                },
                error: (e: Event) => {
                    if (index === activeIndexRef.current) {
                        Logger.error('[Audio] Erreur lecteur :', e);
                        callbacksRef.current.onError?.();
                    }
                },
            };

            Object.entries(events).forEach(([name, fn]) => audio.addEventListener(name, fn as EventListener));
            return events;
        });

        return () => {
            audios.forEach((audio, index) => {
                Object.entries(handlers[index]).forEach(([name, fn]) => audio.removeEventListener(name, fn as EventListener));
            });
        };
    }, []);

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
                if (shouldPlay && audioElements.current![0].paused) {
                    audioElements.current![0].play().catch(() => { });
                }
            }
        },
        onFormatChange: (format) => {
            if (activeIndex === 0) onFormatChange?.(format);
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
        onFormatChange: (format) => {
            if (activeIndex === 1) onFormatChange?.(format);
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
        onFormatChange: (format) => {
            if (activeIndex === 2) onFormatChange?.(format);
        },
        priority: activeIndex === 2
    });

    useEffect(() => {
        audioElements.current!.forEach(audio => {
            audio.volume = volume / 100;
        });
    }, [volume]);

    useEffect(() => {
        const audios = audioElements.current!;
        const activePlayer = audios[activeIndex];

        if (!activePlayer || !trackId) return;

        // On s'assure que les autres sont en pause
        audios.forEach((audio, idx) => {
            if (idx !== activeIndex && !audio.paused) audio.pause();
        });

        if (shouldPlay && activePlayer.paused) {
            activePlayer.play().catch(err => {
                if (err.name !== 'AbortError') Logger.error('[Audio] Échec lecture :', err);
            });
        } else if (!shouldPlay && !activePlayer.paused) {
            activePlayer.pause();
        }
    }, [shouldPlay, trackId, activeIndex, isBuffering, duration]);

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
