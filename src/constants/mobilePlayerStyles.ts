/**
 * Mobile player styles
 * Static styles for the mobile player (no dynamic computation needed)
 */
export const MOBILE_PLAYER_STYLES = {
    container: {
        position: 'fixed' as const,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none' as const,
    },
    player: {
        width: '90%',
        height: '72px',
        borderRadius: '12px',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        userSelect: 'none' as const,
        pointerEvents: 'auto' as const,
        border: '1px solid var(--border-subtle)',
    }
} as const;
