import { useCallback } from 'react';
import { usePlayerUI } from '@context/PlayerUIContext';

// Gère le passage en mode compact (mini lecteur)
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
