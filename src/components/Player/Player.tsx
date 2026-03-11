import { useMediaQuery } from '@hooks/UI/useMediaQuery';
import { PlayerMobile } from './Mobile/PlayerMobile';
import { PlayerDesktop } from './Desktop/PlayerDesktop';

/**
 * Composant dispatcher principal du Player.
 * Alterne entre la version Mobile et Desktop en fonction de la largeur de l'écran.
 */
export function Player() {
    // Utilise une media query pour détecter le mode mobile (max-width: 768px)
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (isMobile) {
        return <PlayerMobile />;
    }

    return <PlayerDesktop />;
}
