/**
 * Formats track duration in mm:ss.
 * @param seconds - Duration in seconds.
 * @returns Formatted duration (e.g. "3:45").
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats duration in hh:mm:ss if needed.
 * @param seconds - Duration in seconds.
 * @returns Formatted duration (e.g. "1:23:45" or "23:45").
 */
export function formatDurationLong(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats time display for player (elapsed and remaining).
 * @param progress - Progress percentage (0-100).
 * @param trackDuration - Total track duration in seconds.
 * @returns Object with formatted elapsed and remaining time.
 */
export function formatTimeDisplay(progress: number, trackDuration: number): { currentTime: string; duration: string } {
    if (trackDuration <= 0) {
        return { currentTime: '0:00', duration: '0:00' };
    }

    const currentSeconds = Math.floor((progress / 100) * trackDuration);
    const remainingSeconds = trackDuration - currentSeconds;

    return {
        currentTime: formatDuration(currentSeconds),
        duration: `-${formatDuration(remainingSeconds)}`,
    };
}
