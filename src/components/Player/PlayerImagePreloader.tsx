import { usePlayerState } from '@context/PlayerContext';
import { AuthenticatedImage } from './AuthenticatedImage';

/**
 * Invisible component that preloads the next and previous tracks' covers.
 * This is placed at the root of the Player to avoid re-rendering and layout issues 
 * when the mobile/desktop views mount and unmount.
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
