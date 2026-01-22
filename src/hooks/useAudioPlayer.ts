import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { getTrackStreamUrl } from '@services/api/tracks';

interface UseAudioPlayerProps {
    trackId: number | null;
    accessToken: string | null;
    volume: number;
    shouldPlay: boolean;
    onEnded?: () => void;
    onError?: () => void; // Callback appelé après échec de retry
}

interface UseAudioPlayerReturn {
    audioRef: React.MutableRefObject<HTMLAudioElement | null>;
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
    onError,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef<number>(0); // Compteur de retries
    const bufferingTimeoutRef = useRef<number | null>(null); // Timeout pour buffering bloqué
    const MAX_RETRIES = 2;
    const BUFFERING_TIMEOUT = 10000; // 10 secondes max de buffering

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

            // Démarrer un timeout de buffering (10s max)
            bufferingTimeoutRef.current = setTimeout(() => {
                console.error('[Audio] Buffering timeout (10s), skipping to next track');
                onError?.();
            }, BUFFERING_TIMEOUT);
        };

        const handlePlaying = () => {
            setIsBuffering(false);

            // Annuler le timeout si la lecture reprend
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
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('playing', handlePlaying);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('playing', handlePlaying);
            audio.removeEventListener('ended', handleEnded);

            // Cleanup: annuler le timeout si le composant démonte
            if (bufferingTimeoutRef.current) {
                clearTimeout(bufferingTimeoutRef.current);
                bufferingTimeoutRef.current = null;
            }
        };
    }, [onEnded, onError]);

    // Load track when trackId changes
    useEffect(() => {
        const audio = audioRef.current;
        const retryTimeouts: number[] = []; // Stocker tous les timeouts pour cleanup

        // Immediately reset states when track changes (for instant UI update)
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
                // Stream is ready, reset retry counter
                retryCountRef.current = 0;
                setIsBuffering(false);
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (data.fatal) {
                    console.error(`[HLS Error] Type: ${data.type}, Details:`, data.details, `(Retry ${retryCountRef.current}/${MAX_RETRIES})`);

                    // Vérifier si on a atteint le max de retries
                    if (retryCountRef.current >= MAX_RETRIES) {
                        console.error('[HLS] Max retries reached, skipping to next track');
                        hls.destroy();
                        retryCountRef.current = 0; // Reset pour la prochaine track
                        onError?.(); // Notifier l'échec -> passer à la track suivante
                        return;
                    }

                    // Incrémenter le compteur de retry
                    retryCountRef.current++;

                    // Délai avant retry (1 seconde) pour donner le temps au backend de générer les fichiers
                    const retryTimeout = setTimeout(() => {
                        // Vérifier que l'instance HLS est toujours valide (pas détruite entre temps)
                        if (!hlsRef.current || hlsRef.current !== hls) {
                            console.log('[HLS] Instance destroyed during retry, aborting');
                            return;
                        }

                        // Tentative de récupération selon le type d'erreur
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log(`[HLS] Retry #${retryCountRef.current}: Network error (${data.details}), reloading manifest...`);
                                // Pour les erreurs réseau (notamment 404 manifest), recharger le manifest
                                hls.loadSource(streamUrl);
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log(`[HLS] Retry #${retryCountRef.current}: Media error, recovering...`);
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('[HLS] Unrecoverable error type');
                                hls.destroy();
                                retryCountRef.current = 0;
                                onError?.();
                                break;
                        }
                    }, 1000); // Attendre 1 seconde entre chaque retry

                    // Stocker le timeout pour cleanup
                    retryTimeouts.push(retryTimeout);
                }
            });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            audio.src = streamUrl;
        } else {
            console.error('HLS is not supported in this browser');
        }

        return () => {
            // Cleanup: annuler tous les timeouts de retry
            retryTimeouts.forEach(clearTimeout);

            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [trackId, accessToken, onError]);

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
