import { useEffect } from 'react';
import type { Track } from '@definitions/track';
import { getTrackCoverUrl, getTrackArtistsNames } from '@utils/track';

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

/**
 * Hook to integrate with the OS Media Session API
 * Allows playback control from lock screen, headphones, etc.
 */
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
    // 1. Update metadata when track changes
    useEffect(() => {
        if (!playingTrack || !('mediaSession' in navigator)) return;

        const artists = getTrackArtistsNames(playingTrack) || 'Unknown Artist';
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

    // 2. Update playback state (playing / paused)
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // 3. Register action handlers for lock-screen controls
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
            console.warn('[MediaSession] setActionHandler not completely supported', error);
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

    // 4. Update track timeline position state
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
