import { useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';

/**
 * Hook for managing player expansion state
 * Centralizes the expansion toggle logic used by both Desktop and Mobile players
 */
export function usePlayerExpansion() {
    const { isExpanded, setIsExpanded } = usePlayer();

    const onExpandToggle = useCallback(
        () => setIsExpanded(!isExpanded),
        [isExpanded, setIsExpanded]
    );

    return { isExpanded, onExpandToggle };
}
