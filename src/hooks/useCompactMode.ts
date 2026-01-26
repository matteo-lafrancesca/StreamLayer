import { useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';

/**
 * Hook for managing compact mode.
 * Handles logic for enabling compact mode and collapsing the player if expanded.
 */
export function useCompactMode() {
    const { setIsCompact, setIsExpanded, isExpanded } = usePlayer();

    const enableCompactMode = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
        }
        setIsCompact(true);
    }, [isExpanded, setIsExpanded, setIsCompact]);

    return { enableCompactMode };
}
