import type { Track } from '@definitions/track';

/**
 * Calcule et formate la durée totale d'une playlist
 * @param tracks - Tableau de tracks
 * @returns Durée formatée (ex: "2 h 34 min" ou "45 min")
 */
export function formatPlaylistDuration(tracks: Track[]): string {
    if (!tracks || tracks.length === 0) {
        return '0 min';
    }

    const totalSeconds = tracks.reduce((sum, track) => sum + track.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }

    return `${minutes} min`;
}
