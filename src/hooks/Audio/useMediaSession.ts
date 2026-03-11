import { useEffect } from 'react';
import { Logger } from '@utils/system';
import type { Track } from '@definitions/track';
import { getTrackArtistsNames, getTrackCoverUrl } from '@utils/player';

interface UseMediaSessionProps {
    playingTrack: Track | null;
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onSeek: (time: number) => void;
    audioRef: React.RefObject<HTMLAudioElement | null>;
}

// Intègre l'API Media Session de l'OS
// Permet de contrôler la lecture depuis l'écran de verrouillage ou les écouteurs
export function useMediaSession({
    playingTrack,
    isPlaying,
    onPlay,
    onPause,
    onPrevious,
    onNext,
    onSeek,
    audioRef
}: UseMediaSessionProps) {
    // 1. Mise à jour des métadonnées lors du changement de piste
    useEffect(() => {
        if (!playingTrack || !('mediaSession' in navigator)) return;

        const artists = getTrackArtistsNames(playingTrack) || 'Artiste inconnu';
        const coverUrl = getTrackCoverUrl(playingTrack, 'l');

        navigator.mediaSession.metadata = new MediaMetadata({
            title: playingTrack.title,
            artist: artists,
            album: '',
            artwork: coverUrl ? [
                { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
                { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
                { src: coverUrl, sizes: '192x192', type: 'image/jpeg' },
                { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
                { src: coverUrl, sizes: '384x384', type: 'image/jpeg' },
                { src: coverUrl, sizes: '512x512', type: 'image/jpeg' },
            ] : []
        });
    }, [playingTrack]);

    // 2. Mise à jour de l'état de lecture (play / pause)
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // 3. Enregistrement des handlers pour les contrôles externes
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;

        try {
            navigator.mediaSession.setActionHandler('play', onPlay);
            navigator.mediaSession.setActionHandler('pause', onPause);
            navigator.mediaSession.setActionHandler('previoustrack', onPrevious);
            navigator.mediaSession.setActionHandler('nexttrack', onNext);

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined && details.seekTime !== null) {
                    onSeek(details.seekTime);
                }
            });
        } catch (error) {
            Logger.warn('[MediaSession] setActionHandler n\'est pas totalement supporté', error);
        }

        return () => {
            try {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('previoustrack', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
                navigator.mediaSession.setActionHandler('seekto', null);
            } catch (error) {
                // Ignore API cleanup error
            }
        };
    }, [onPlay, onPause, onPrevious, onNext, onSeek]);

    // 4. Mise à jour de la barre de progression dans l'OS
    useEffect(() => {
        if (!('mediaSession' in navigator) || !playingTrack || !audioRef.current) return;

        const audio = audioRef.current;

        let debounceTimer: ReturnType<typeof setTimeout>;

        const updatePositionState = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                try {
                    if (!audio || !audio.duration || !isFinite(audio.duration)) return;

                    if ('setPositionState' in navigator.mediaSession) {
                        navigator.mediaSession.setPositionState({
                            duration: audio.duration,
                            playbackRate: audio.playbackRate,
                            position: audio.currentTime
                        });
                    }
                } catch (e) {
                    // Ignore transient errors when audio state changes rapidly
                }
            }, 500);
        };

        audio.addEventListener('timeupdate', updatePositionState);
        audio.addEventListener('durationchange', updatePositionState);

        return () => {
            clearTimeout(debounceTimer);
            if (audio) {
                audio.removeEventListener('timeupdate', updatePositionState);
                audio.removeEventListener('durationchange', updatePositionState);
            }
        };
    }, [playingTrack, audioRef]);
}
