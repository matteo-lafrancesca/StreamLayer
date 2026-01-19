import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { getTrackStreamUrl } from '@services/api/tracks';

interface UseAudioPlayerProps {
    trackId: number | null;
    accessToken: string | null;
    volume: number;
    shouldPlay: boolean;
    onEnded?: () => void;
}

interface UseAudioPlayerReturn {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isBuffering: boolean;
    seek: (time: number) => void;
}

/**
 * Hook to manage HLS audio playback
 * Handles initialization of Hls.js and the audio element, and provides playback controls
 */
export function useAudioPlayer({
    trackId,
    accessToken,
    volume,
    shouldPlay,
    onEnded,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Initialize audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = '';
            audioRef.current = null;
        };
    }, []);

    // Setup event listeners on audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

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
        };

        const handlePlaying = () => {
            setIsBuffering(false);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [onEnded]);

    // Load track when trackId changes
    useEffect(() => {
        const audio = audioRef.current;

        // Immediately reset states when track changes (for instant UI update)
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);

        if (!audio || !trackId) {
            // Clean up if no track
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (audio) {
                audio.pause();
                audio.src = '';
            }
            return;
        }

        const streamUrl = getTrackStreamUrl(trackId, accessToken ?? undefined);

        // Check if HLS is supported
        if (Hls.isSupported()) {
            // Destroy previous instance if exists
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                xhrSetup: (xhr, url) => {
                    // Add authorization query param to ALL requests (manifest + segments)
                    if (accessToken) {
                        const separator = url.includes('?') ? '&' : '?';
                        const urlWithAuth = `${url}${separator}authorization=${encodeURIComponent(accessToken)}`;
                        xhr.open('GET', urlWithAuth, true);
                    }
                },
            });

            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(audio);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // Stream is ready
                setIsBuffering(false);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('HLS Network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('HLS Media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('HLS Fatal error, cannot recover');
                            hls.destroy();
                            break;
                    }
                }
            });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            audio.src = streamUrl;
        } else {
            console.error('HLS is not supported in this browser');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [trackId, accessToken]);

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
        currentTime,
        duration,
        isPlaying,
        isBuffering,
        seek,
    };
}
