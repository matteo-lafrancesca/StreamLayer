import { usePlayerState } from '@context/PlayerContext';
import { AuthenticatedImage } from '../AuthenticatedImage';

/**
 * Composant invisible pour précharger les couvertures des pistes suivante et précédente.
 * Placé à la racine du Player pour éviter les re-rendus inutiles lors des transitions Desktop/Mobile.
 */
export function PlayerImagePreloader() {
    const { nextTrack, prevTrack } = usePlayerState();

    return (
        <div style={{ width: 0, height: 0, opacity: 0, overflow: 'hidden', position: 'absolute' }}>
            {nextTrack && (
                <AuthenticatedImage
                    type="album"
                    id={nextTrack.id_album}
                    size="l"
                    alt="preload-next"
                />
            )}
            {prevTrack && (
                <AuthenticatedImage
                    type="album"
                    id={prevTrack.id_album}
                    size="l"
                    alt="preload-prev"
                />
            )}
        </div>
    );
}
