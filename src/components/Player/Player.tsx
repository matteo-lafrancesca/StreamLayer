import { PlayerDesktop } from './PlayerDesktop';
import { PlayerMobile } from './PlayerMobile';

/**
 * Player Component Router
 * Renders the appropriate player based on screen size
 */
export function Player() {
    // Removed useMediaQuery logic to prevent unmounting/remounting
    return (
        <>
            <PlayerDesktop />
            <PlayerMobile />
        </>
    );
}

