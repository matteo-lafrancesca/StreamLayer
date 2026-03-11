import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { getTrackStreamUrl } from '@services/api/tracks';
import { tokenManager } from '@services/api/tokenManager';
import { appendAuthToUrl } from '@utils/audio';
import { Logger } from '@utils/system';

interface UseHlsLoaderProps {
    trackId: number | null;
    accessToken: string | null;
    audioElement: HTMLAudioElement | null;
    onError: () => void;
    onStreamReady: () => void;
    onFormatChange?: (format: 'low' | 'high') => void;
    priority?: boolean;
}

// Gère le cycle de vie de HLS.js
// - Chargement temporisé (debounce)
// - Authentification (injection de tokens)
// - Récupération après erreur (retries)
// - Nettoyage
export function useHlsLoader({
    trackId,
    accessToken,
    audioElement,
    onError,
    onStreamReady,
    onFormatChange,
    priority = false,
}: UseHlsLoaderProps) {
    const hlsRef = useRef<Hls | null>(null);
    const retryCountRef = useRef<number>(0);
    const authRetryCountRef = useRef<number>(0);

    const onErrorRef = useRef(onError);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    const onStreamReadyRef = useRef(onStreamReady);
    useEffect(() => { onStreamReadyRef.current = onStreamReady; }, [onStreamReady]);

    const onFormatChangeRef = useRef(onFormatChange);
    useEffect(() => { onFormatChangeRef.current = onFormatChange; }, [onFormatChange]);

    const accessTokenRef = useRef(accessToken);
    useEffect(() => { accessTokenRef.current = accessToken; }, [accessToken]);

    const MAX_RETRIES = 2;
    const MAX_AUTH_RETRIES = 1;

    useEffect(() => {
        const audio = audioElement;
        const retryTimeouts: number[] = [];

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

        const streamUrl = getTrackStreamUrl(trackId, accessTokenRef.current || undefined);
        Logger.info('[HLS] Chargement du flux :', streamUrl);

        if (!streamUrl) {
            Logger.error('[HLS] URL de flux invalide');
            onErrorRef.current?.();
            return;
        }

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

                hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
                    const level = hls.levels[data.level];
                    if (level && level.bitrate) {
                        const format = level.bitrate > 128000 ? 'high' : 'low';
                        Logger.info(`[HLS] Changement de qualité : ${level.bitrate} bps -> Format : ${format}`);
                        onFormatChangeRef.current?.(format);
                    }
                });

                hls.on(Hls.Events.ERROR, (_event, data) => {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && (data.response?.code === 401 || data.response?.code === 403)) {
                        if (authRetryCountRef.current < MAX_AUTH_RETRIES) {
                            Logger.info(`[HLS] Token 401 détecté, rafraîchissement... (Tentative ${authRetryCountRef.current + 1}/${MAX_AUTH_RETRIES})`);
                            authRetryCountRef.current++;

                            tokenManager.refreshAccessToken().catch((e: unknown) => {
                                Logger.error('[HLS] Échec rafraîchissement token :', e);
                                onErrorRef.current?.();
                            });
                        } else {
                            Logger.error('[HLS] Nombre max de tentatives auth atteint.');
                            onErrorRef.current?.();
                        }
                        return;
                    }

                    if (data.fatal) {
                        Logger.error(`[Erreur HLS] Type : ${data.type}, Détails :`, data.details, `(Nouvel essai ${retryCountRef.current}/${MAX_RETRIES})`);

                        if (retryCountRef.current >= MAX_RETRIES) {
                            Logger.error('[HLS] Tentatives épuisées, passage à la suite');
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
                                    Logger.info(`[HLS] Essai #${retryCountRef.current} : Erreur réseau, rechargement...`);
                                    hls.loadSource(streamUrl);
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    Logger.info(`[HLS] Essai #${retryCountRef.current} : Erreur média, récupération...`);
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

                const handleNativeError = () => {
                    const err = audio.error;
                    if (err) {
                        Logger.error('[HLS Native] Erreur de lecture', err);
                        if (err.code === err.MEDIA_ERR_NETWORK && authRetryCountRef.current < MAX_AUTH_RETRIES) {
                            Logger.info(`[HLS Native] Tentative de rafraîchissement token... (${authRetryCountRef.current + 1}/${MAX_AUTH_RETRIES})`);
                            authRetryCountRef.current++;

                            tokenManager.refreshAccessToken().then((newToken) => {
                                audio.src = getTrackStreamUrl(trackId, newToken)!;
                                audio.load();
                                audio.play().catch((err) => Logger.error('[HLS Native] Échec lecture :', err));
                            }).catch((e) => {
                                Logger.error('[HLS Native] Échec rafraîchissement token :', e);
                                onErrorRef.current?.();
                            });
                        } else {
                            onErrorRef.current?.();
                        }
                    }
                };

                audio.addEventListener('error', handleNativeError);
                (audio as any)._nativeErrorHandler = handleNativeError;
            } else {
                Logger.error('HLS n\'est pas supporté par ce navigateur');
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
            if (audio && (audio as any)._nativeErrorHandler) {
                audio.removeEventListener('error', (audio as any)._nativeErrorHandler);
                delete (audio as any)._nativeErrorHandler;
            }
        };
    }, [trackId, audioElement]);
}
