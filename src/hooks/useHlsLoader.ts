import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getTrackStreamUrl } from '@services/api/tracks';
import { tokenManager } from '@services/tokenManager';
import { appendAuthToUrl } from '@utils/hls';
import { Logger } from '@utils/logger';

interface UseHlsLoaderProps {
    trackId: number | null;
    accessToken: string | null;
    audioElement: HTMLAudioElement | null;
    onError: () => void;
    onStreamReady: () => void;
    priority?: boolean;
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
    priority = false,
}: UseHlsLoaderProps) {
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef<number>(0);
    const authRetryCountRef = useRef<number>(0);

    // Stable error callback ref
    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    // Stable success callback ref
    const onStreamReadyRef = useRef(onStreamReady);
    useEffect(() => { onStreamReadyRef.current = onStreamReady; }, [onStreamReady]);

    // Stable Token Ref
    const accessTokenRef = useRef(accessToken);
    useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);

    // Constants
    const MAX_RETRIES = 2;
    const MAX_AUTH_RETRIES = 1;

    useEffect(() => {
        const audio = audioElement;
        const retryTimeouts: number[] = [];

        // Reset auth retry count for new track
        authRetryCountRef.current = 0;

        if (!audio || !trackId) {
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

        // Include token for native playback
        const streamUrl = getTrackStreamUrl(trackId, accessTokenRef.current || undefined);
        Logger.info('[HLS] Loading stream:', streamUrl);

        if (!streamUrl) {
            Logger.error('[HLS] Invalid stream URL');
            onErrorRef.current?.();
            return;
        }

        // Debounce HLS initialization
        const initHls = () => {
            if (Hls.isSupported()) {
                if (hlsRef.current) hlsRef.current.destroy();

                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,

                    xhrSetup: (xhr, url) => {
                        const currentToken = accessTokenRef.current;
                        if (currentToken) {
                            const urlWithAuth = appendAuthToUrl(url, currentToken);
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
                    // Check for 401/403 on Network Error (Token expired)
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && (data.response?.code === 401 || data.response?.code === 403)) {
                        if (authRetryCountRef.current < MAX_AUTH_RETRIES) {
                            Logger.info(`[HLS] Token 401 detected, refreshing... (Attempt ${authRetryCountRef.current + 1}/${MAX_AUTH_RETRIES})`);
                            authRetryCountRef.current++;

                            tokenManager.refreshAccessToken().catch((e: unknown) => {
                                Logger.error('[HLS] Token refresh failed:', e);
                                onErrorRef.current?.();
                            });
                        } else {
                            Logger.error('[HLS] Max auth retries reached, aborting.');
                            onErrorRef.current?.();
                        }
                        return;
                    }

                    if (data.fatal) {
                        Logger.error(`[HLS Error] Type: ${data.type}, Details:`, data.details, `(Retry ${retryCountRef.current}/${MAX_RETRIES})`);

                        if (retryCountRef.current >= MAX_RETRIES) {
                            Logger.error('[HLS] Max retries reached, skipping to next track');
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
                                    Logger.info(`[HLS] Retry #${retryCountRef.current}: Network error, reloading...`);
                                    hls.loadSource(streamUrl);
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    Logger.info(`[HLS] Retry #${retryCountRef.current}: Media error, recovering...`);
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
                Logger.error('HLS is not supported in this browser');
            }
        };

        let loadTimeout: number | undefined;
        if (priority) {
            initHls();
        } else {
            loadTimeout = window.setTimeout(initHls, 150);
        }

        return () => {
            if (loadTimeout) clearTimeout(loadTimeout);
            retryTimeouts.forEach(clearTimeout);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [trackId, audioElement]);
}
