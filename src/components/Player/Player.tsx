import { PlayerDesktop } from './PlayerDesktop';
import { PlayerMobile } from './PlayerMobile';
import { PlayerImagePreloader } from './PlayerImagePreloader';
import { useMediaQuery } from '@hooks/useMediaQuery';

/**
 * Player Component Router.
 * Renders both players (Desktop/Mobile) handling visibility via CSS.
 */
export function Player() {
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <>
            <PlayerImagePreloader />
            {isMobile ? <PlayerMobile /> : <PlayerDesktop />}
        </>
    );
}

