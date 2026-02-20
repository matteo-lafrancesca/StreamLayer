import type { Track } from '@definitions/track';

/**
 * Fisher-Yates shuffle with current track preservation
 * Places current track at index 0, then shuffles the rest
 */
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
