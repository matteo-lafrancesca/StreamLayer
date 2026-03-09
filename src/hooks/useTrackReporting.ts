import { useCallback, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { useReporting } from '@hooks/useReporting';
import type { ReportingStatus } from '../types/Reporting';

interface UseTrackReportingProps {
    playingTrack: Track | null;
    playingFromPlaylist: Playlist | null;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    format?: 'low' | 'high';
}

/**
 * Hook to manage track playback reporting/analytics.
 */
export function useTrackReporting({
    playingTrack,
    playingFromPlaylist,
    audioRef,
    format = 'low'
}: UseTrackReportingProps) {
    const { trackEvent } = useReporting();
    const lastTrackRef = useRef<Track | null>(null);
    const lastEventRef = useRef<{ id: string; status: ReportingStatus } | null>(null);
    const hasStartedRef = useRef<Record<string, boolean>>({});

    // For authentic listening duration tracking
    const startPositionRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef<number>(0);

    useEffect(() => {
        if (playingTrack?.id !== lastTrackRef.current?.id) {
            // Track changed, reset accumulator
            accumulatedTimeRef.current = 0;
            startPositionRef.current = null;
        }
        lastTrackRef.current = playingTrack;
    }, [playingTrack]);

    const handleReport = useCallback((track: Track, status: ReportingStatus, time: number) => {
        if (status === 'stopped' && lastEventRef.current?.id === String(track.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        lastEventRef.current = { id: String(track.id), status };

        let deviceType: 'web' | 'mobile' = 'web';
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'ios' || platform === 'android') {
                deviceType = 'mobile';
            }
        } catch (e) {
        }

        const isOnline = navigator.onLine;

        trackEvent({
            id: track.id,
            container_type: 'list',
            id_container: playingFromPlaylist?.id || 0,
            full: true,
            creation_datetime: Math.floor(Date.now() / 1000),
            device_type: deviceType,
            online: isOnline,
            status,
            time: Math.floor(time),
            current_position: Math.floor(audioRef.current?.currentTime || 0),
            play_mode: isOnline ? 'online' : 'offline',
            format,
            territory_code: 'FR'
        });
    }, [trackEvent, playingFromPlaylist, audioRef, format]);

    const handlePlay = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioRef.current?.currentTime || 0;

        let status: ReportingStatus;
        if (!hasStartedRef.current[String(playingTrack.id)]) {
            status = 'started';
            hasStartedRef.current[String(playingTrack.id)] = true;
        } else {
            status = 'resume';
        }

        // Always update start position reference
        startPositionRef.current = currentTime;
        const timeToReport = status === 'started' ? 0 : accumulatedTimeRef.current;

        handleReport(playingTrack, status, timeToReport);
    }, [playingTrack, handleReport]);

    const handlePause = useCallback(() => {
        if (!playingTrack) return;

        // Don't report pause if we just reported a stop for the same track
        if (lastEventRef.current?.id === String(playingTrack.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        const currentTime = audioRef.current?.currentTime || 0;

        let sessionDuration = 0;
        if (startPositionRef.current !== null) {
            sessionDuration = currentTime - startPositionRef.current;
            startPositionRef.current = null;
        }
        // Mitigate negative duration if seeking backwards
        accumulatedTimeRef.current += Math.max(0, sessionDuration);

        handleReport(playingTrack, 'paused', accumulatedTimeRef.current);
    }, [playingTrack, handleReport]);

    const handleStop = useCallback(() => {

        const trackToReport = (playingTrack?.id !== lastTrackRef.current?.id)
            ? lastTrackRef.current
            : playingTrack;

        if (trackToReport) {
            let sessionDuration = 0;
            if (startPositionRef.current !== null) {
                const currentTime = audioRef.current?.currentTime || 0;
                sessionDuration = currentTime - startPositionRef.current;
                startPositionRef.current = null;
            }
            accumulatedTimeRef.current += Math.max(0, sessionDuration);

            handleReport(trackToReport, 'stopped', accumulatedTimeRef.current);
            accumulatedTimeRef.current = 0;
        }
    }, [playingTrack, handleReport]);

    const handleSeeking = useCallback(() => {
        if (!playingTrack) return;

        let sessionDuration = 0;
        if (startPositionRef.current !== null) {
            const currentTime = audioRef.current?.currentTime || 0;
            sessionDuration = currentTime - startPositionRef.current;
            startPositionRef.current = null;
        }
        accumulatedTimeRef.current += Math.max(0, sessionDuration);
    }, [playingTrack, audioRef]);

    const handleSeeked = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioRef.current?.currentTime || 0;
        startPositionRef.current = currentTime;
    }, [playingTrack, audioRef]);

    return {
        handlePlay,
        handlePause,
        handleStop,
        handleSeeking,
        handleSeeked
    };
}
