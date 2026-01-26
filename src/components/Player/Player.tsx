import { PlayerDesktop } from './PlayerDesktop';
import { PlayerMobile } from './PlayerMobile';

/**
 * Player Component Router.
 * Renders both players (Desktop/Mobile) handling visibility via CSS.
 */
export function Player() {
    // No useMediaQuery to prevent unmount/remount
    return (
        <>
            <PlayerDesktop />
            <PlayerMobile />
        </>
    );
}

