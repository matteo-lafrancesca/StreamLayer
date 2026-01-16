/**
 * Formate la durée d'une track en minutes:secondes
 * @param seconds - Durée en secondes
 * @returns Durée formatée (ex: "3:45")
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate la durée en heures:minutes:secondes si nécessaire
 * @param seconds - Durée en secondes
 * @returns Durée formatée (ex: "1:23:45" ou "23:45")
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
 * Formate l'affichage du temps pour le player (temps écoulé et temps restant)
 * @param progress - Progression en pourcentage (0-100)
 * @param trackDuration - Durée totale de la track en secondes
 * @returns Objet avec le temps écoulé et le temps restant formatés
 */
export function formatTimeDisplay(progress: number, trackDuration: number): { currentTime: string; duration: string } {
    if (trackDuration <= 0) {
        return { currentTime: '0:00', duration: '0:00' };
    }

    const currentSeconds = Math.floor((progress / 100) * trackDuration);
    const remainingSeconds = trackDuration - currentSeconds;

    return {
        currentTime: formatDuration(currentSeconds),
        duration: formatDuration(remainingSeconds),
    };
}
