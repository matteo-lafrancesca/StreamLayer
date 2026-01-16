import { useMediaQuery } from '../../hooks/useMediaQuery';
import { PlayerDesktop } from './PlayerDesktop';
import { PlayerMobile } from './PlayerMobile';

/**
 * Player Component Router
 * Renders the appropriate player based on screen size
 */
export function Player() {
    const isMobile = useMediaQuery('(max-width: 750px)');

    return isMobile ? <PlayerMobile /> : <PlayerDesktop />;
}
