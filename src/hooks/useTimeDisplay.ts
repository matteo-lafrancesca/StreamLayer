import { useMemo } from 'react';
import type { Track } from '@definitions/track';
import { formatTimeDisplay } from '@utils/time';

interface UseTimeDisplayProps {
    playingTrack: Track | null;
    progress: number;
}

interface UseTimeDisplayReturn {
    currentTime: string;
    duration: string;
}

/**
 * Hook pour calculer et formater l'affichage du temps du player
 * @param playingTrack - Track en cours de lecture
 * @param progress - Progression en pourcentage (0-100)
 * @returns Temps écoulé et temps restant formatés
 */
export function useTimeDisplay({ playingTrack, progress }: UseTimeDisplayProps): UseTimeDisplayReturn {
    return useMemo(() => {
        if (!playingTrack) {
            return { currentTime: '0:00', duration: '0:00' };
        }

        return formatTimeDisplay(progress, playingTrack.duration);
    }, [playingTrack, progress]);
}
