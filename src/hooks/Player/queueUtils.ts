import type { Track } from '@definitions/track';

// Mélange de type Fisher-Yates avec préservation de la piste actuelle
// Place la piste actuelle à l'index 0, puis mélange le reste de la liste
export function shuffleArray(array: Track[], currentTrack: Track | null): Track[] {
    const shuffled = [...array];
    if (currentTrack) {
        const currentIndex = shuffled.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            [shuffled[0], shuffled[currentIndex]] = [shuffled[currentIndex], shuffled[0]];
        }
    }
    for (let i = shuffled.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i)) + 1;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
