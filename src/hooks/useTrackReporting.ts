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
 * Extracted from PlayerContext to separate concerns.
 */
export function useTrackReporting({
    playingTrack,
    playingFromPlaylist,
    audioRef
}: UseTrackReportingProps) {
    const { trackEvent } = useReporting();
    const lastTrackRef = useRef<Track | null>(null);
    const lastEventRef = useRef<{ id: string; status: ReportingStatus } | null>(null);

    // Keep lastTrackRef updated
    useEffect(() => {
        lastTrackRef.current = playingTrack;
    }, [playingTrack]);

    const handleReport = useCallback((track: Track, status: ReportingStatus, time: number) => {
        // Dedup logic for stopped (avoid double send on end + skip)
        if (status === 'stopped' && lastEventRef.current?.id === String(track.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        lastEventRef.current = { id: String(track.id), status };

        // Determine device type via Capacitor
        let deviceType: 'web' | 'mobile' = 'web';
        try {
            const platform = Capacitor.getPlatform();
            if (platform === 'ios' || platform === 'android') {
                deviceType = 'mobile';
            }
        } catch (e) {
            // Capacitor might not be available in standard web environments, default to web.
        }

        const isOnline = navigator.onLine;

        trackEvent({
            id: track.id,
            container_type: 'list', // Default to list for now
            id_container: playingFromPlaylist?.id || 0, // 0 if no container
            full: true,
            creation_datetime: Math.floor(Date.now() / 1000), // Seconds
            device_type: deviceType,
            online: isOnline,
            status,
            time: Math.floor(time),
            current_position: Math.floor(audioRef.current?.currentTime || 0),
            play_mode: isOnline ? 'online' : 'offline',
            // territory_code and format are deliberately omitted to reduce payload size 
            // and let the backend session state infer them securely.
        });
    }, [trackEvent, playingFromPlaylist, audioRef]);

    const handlePlay = useCallback(() => {
        if (!playingTrack) return;
        const currentTime = audioRef.current?.currentTime || 0;
        // Logic: if near 0, started, else resume.
        // Tolerance 1s to account for minor seek or latency
        const status: ReportingStatus = currentTime < 1 ? 'started' : 'resume';
        // Spec says: if started, time = 0.
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
        // If we in rotation (render), playingTrack is NEW, lastTrackRef is OLD.
        // If we in onEnded (event), playingTrack is CURRENT (same as lastTrackRef).

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
