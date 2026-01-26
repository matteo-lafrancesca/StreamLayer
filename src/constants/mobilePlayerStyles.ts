/**
 * Mobile player styles
 * Static styles for the mobile player (no dynamic computation needed)
 */
export const MOBILE_PLAYER_STYLES = {
    container: {
        position: 'fixed' as const,
        bottom: '20px',
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
        background: '#FFFFFF',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        userSelect: 'none' as const,
        pointerEvents: 'auto' as const,
        border: '1px solid var(--border-subtle)',
    }
} as const;
