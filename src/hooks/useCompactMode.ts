import { useCallback } from 'react';
import { usePlayerUI } from '@context/PlayerUIContext';

/**
 * Hook for managing compact mode.
 * Handles logic for enabling compact mode and collapsing the player if expanded.
 */
export function useCompactMode() {
    const { setIsCompact, setIsExpanded, isExpanded } = usePlayerUI();

    const enableCompactMode = useCallback(() => {
        if (isExpanded) {
            setIsExpanded(false);
        }
        setIsCompact(true);
    }, [isExpanded, setIsExpanded, setIsCompact]);

    return { enableCompactMode };
}
