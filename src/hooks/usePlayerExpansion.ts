import { useCallback } from 'react';
import { usePlayerUI } from '@context/PlayerUIContext';

/**
 * Hook for managing player expansion state.
 */
export function usePlayerExpansion() {
    const { isExpanded, setIsExpanded } = usePlayerUI();

    const onExpandToggle = useCallback(
        () => setIsExpanded(!isExpanded),
        [isExpanded, setIsExpanded]
    );

    return { isExpanded, onExpandToggle };
}
