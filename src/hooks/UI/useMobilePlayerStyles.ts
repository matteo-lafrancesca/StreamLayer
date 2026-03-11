import { useMemo } from 'react';

interface MobilePlayerStyles {
    container: React.CSSProperties;
    player: React.CSSProperties;
}

// Définit les styles de base pour le lecteur mobile (positionnement, ombres, coins arrondis)
export function useMobilePlayerStyles(): MobilePlayerStyles {
    const containerStyles: React.CSSProperties = useMemo(() => ({
        position: 'fixed',
        bottom: '20px',
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
    }), []);

    const playerStyles: React.CSSProperties = useMemo(() => ({
        width: '90%',
        height: '72px',
        borderRadius: '12px',
        background: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        pointerEvents: 'auto',
    }), []);

    return {
        container: containerStyles,
        player: playerStyles
    };
}
