import { useCallback, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { useReporting } from '@hooks/Reporting/useReporting';
import type { ReportingStatus } from '@definitions/reporting';

interface UseTrackReportingProps {
    playingTrack: Track | null;
    playingFromPlaylist: Playlist | null;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    format?: 'low' | 'high';
}

// Hook pour gérer le reporting (KPI/Stats) de lecture d'une piste
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

    // Pour le suivi précis de la durée d'écoute réelle
    const startPositionRef = useRef<number | null>(null);
    const accumulatedTimeRef = useRef<number>(0);

    useEffect(() => {
        if (playingTrack?.id !== lastTrackRef.current?.id) {
            // Changement de piste, on réinitialise l'accumulateur
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

        const isOnline = navigator.onLine;
        const deviceType = Capacitor.getPlatform() === 'web' ? 'web' : 'mobile';

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
        
        // On met toujours à jour la position de référence pour le début d'écoute
        startPositionRef.current = currentTime;
        const timeToReport = status === 'started' ? 0 : accumulatedTimeRef.current;

        handleReport(playingTrack, status, timeToReport);
    }, [playingTrack, handleReport]);

    const handlePause = useCallback(() => {
        if (!playingTrack) return;
 
        // On ne reporte pas la pause si on vient de reporter un arrêt pour la même piste
        if (lastEventRef.current?.id === String(playingTrack.id) && lastEventRef.current?.status === 'stopped') {
            return;
        }

        const currentTime = audioRef.current?.currentTime || 0;

        let sessionDuration = 0;
        if (startPositionRef.current !== null) {
            sessionDuration = currentTime - startPositionRef.current;
            startPositionRef.current = null;
        }
        // Évite une durée négative en cas de retour en arrière (seeking)
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
