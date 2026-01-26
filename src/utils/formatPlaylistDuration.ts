import type { Track } from '@definitions/track';

/**
 * Calculates and formats total playlist duration.
 * @param tracks - Array of tracks.
 * @returns Formatted duration (e.g. "2 h 34 min" or "45 min").
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
