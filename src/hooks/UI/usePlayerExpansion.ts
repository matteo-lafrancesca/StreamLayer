import { useCallback } from 'react';
import { usePlayerUI } from '@context/PlayerUIContext';

// Gère l'état d'agrandissement (expansion) ou de réduction du lecteur
export function usePlayerExpansion() {
    const { isExpanded, setIsExpanded } = usePlayerUI();

    const onExpandToggle = useCallback(
        () => setIsExpanded(!isExpanded),
        [isExpanded, setIsExpanded]
    );

    return { isExpanded, onExpandToggle };
}
