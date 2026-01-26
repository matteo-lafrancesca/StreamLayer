import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getTrackStreamUrl } from '@services/api/tracks';
import { tokenManager } from '@services/tokenManager';

interface UseHlsLoaderProps {
    trackId: number | null;
    accessToken: string | null;
    audioElement: HTMLAudioElement | null;
    onError: () => void;
    onStreamReady: () => void;
}

/**
 * Hook dedicated to HLS lifecycle management
 * Handles:
 * - Debounced loading
 * - Authentication (Token injection)
 * - Error Recovery (Retries, 401 updates)
 * - Cleanup
 */
export function useHlsLoader({
    trackId,
    accessToken,
    audioElement,
    onError,
    onStreamReady,
}: UseHlsLoaderProps) {
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef<number>(0);
    const authRetryCountRef = useRef<number>(0);

    // Stable error callback ref to avoid effect re-runs
    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    // Stable success callback ref
    const onStreamReadyRef = useRef(onStreamReady);
    useEffect(() => { onStreamReadyRef.current = onStreamReady; }, [onStreamReady]);

    // Constants
    const MAX_RETRIES = 2;
    const MAX_AUTH_RETRIES = 1;

    useEffect(() => {
        const audio = audioElement;
        const retryTimeouts: number[] = [];

        // Reset auth retry count for new track
        authRetryCountRef.current = 0;

        if (!audio || !trackId) {
            // Clean up if no track
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
            return;
        }

        // Don't pass accessToken here, let xhrSetup handle it to avoid double-auth params
        const streamUrl = getTrackStreamUrl(trackId);
        console.log('[HLS] Loading stream:', streamUrl);

        if (!streamUrl) {
            console.error('[HLS] Invalid stream URL');
            onErrorRef.current?.();
            return;
        }

        // Debounce HLS initialization to prevent request flooding
        const loadTimeout = setTimeout(() => {
            if (Hls.isSupported()) {
                if (hlsRef.current) hlsRef.current.destroy();

                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    xhrSetup: (xhr, url) => {
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
                    retryCountRef.current = 0;
                    onStreamReadyRef.current();
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    // Check for 401 on Network Error (Token expired)
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.response?.code === 401) {
                        if (authRetryCountRef.current < MAX_AUTH_RETRIES) {
                            console.log(`[HLS] Token 401 detected, refreshing... (Attempt ${authRetryCountRef.current + 1}/${MAX_AUTH_RETRIES})`);
                            authRetryCountRef.current++;

                            tokenManager.refreshAccessToken().catch((e: unknown) => {
                                console.error('[HLS] Token refresh failed:', e);
                                onErrorRef.current?.();
                            });
                        } else {
                            console.error('[HLS] Max auth retries reached, aborting.');
                            onErrorRef.current?.();
                        }
                        return;
                    }

                    if (data.fatal) {
                        console.error(`[HLS Error] Type: ${data.type}, Details:`, data.details, `(Retry ${retryCountRef.current}/${MAX_RETRIES})`);

                        if (retryCountRef.current >= MAX_RETRIES) {
                            console.error('[HLS] Max retries reached, skipping to next track');
                            hls.destroy();
                            retryCountRef.current = 0;
                            onErrorRef.current?.();
                            return;
                        }

                        retryCountRef.current++;

                        const retryTimeout = setTimeout(() => {
                            if (!hlsRef.current || hlsRef.current !== hls) return;

                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    console.log(`[HLS] Retry #${retryCountRef.current}: Network error, reloading...`);
                                    hls.loadSource(streamUrl);
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.log(`[HLS] Retry #${retryCountRef.current}: Media error, recovering...`);
                                    hls.recoverMediaError();
                                    break;
                                default:
                                    hls.destroy();
                                    retryCountRef.current = 0;
                                    onErrorRef.current?.();
                                    break;
                            }
                        }, 1000);

                        retryTimeouts.push(retryTimeout);
                    }
                });
            } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
                audio.src = streamUrl;
            } else {
                console.error('HLS is not supported in this browser');
            }
        }, 150);

        return () => {
            clearTimeout(loadTimeout);
            retryTimeouts.forEach(clearTimeout);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [trackId, accessToken, audioElement]);
}
