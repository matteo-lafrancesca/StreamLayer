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
}

/**
 * Hook to manage track playback reporting/analytics.
 */
export function useTrackReporting({
    playingTrack,
    playingFromPlaylist,
    audioRef
}: UseTrackReportingProps) {
    const { trackEvent } = useReporting();
    const lastTrackRef = useRef<Track | null>(null);
    const lastEventRef = useRef<{ id: string; status: ReportingStatus } | null>(null);
    const hasStartedRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        lastTrackRef.current = playingTrack;
    }, [playingTrack]);

    const handleReport = useCallback((track: Track, status: ReportingStatus, time: number) => {
        // Dedup logic
        if (status === 'stopped' && lastEventRef.current?.id === String(track.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        lastEventRef.current = { id: String(track.id), status };

        // Determine device type
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
            format: 'low',
            territory_code: 'FR'
        });
    }, [trackEvent, playingFromPlaylist, audioRef]);

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

        const time = status === 'started' ? 0 : currentTime;

        handleReport(playingTrack, status, time);
    }, [playingTrack, handleReport, audioRef]);

    const handlePause = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioRef.current?.currentTime || 0;
        handleReport(playingTrack, 'paused', currentTime);
    }, [playingTrack, handleReport, audioRef]);

    const handleStop = useCallback((time: number) => {
        // Determine which track stopped

        const trackToReport = (playingTrack?.id !== lastTrackRef.current?.id)
            ? lastTrackRef.current
            : playingTrack;

        if (trackToReport) {
            handleReport(trackToReport, 'stopped', time);
        }
    }, [playingTrack, handleReport]);

    return {
        handlePlay,
        handlePause,
        handleStop
    };
}
