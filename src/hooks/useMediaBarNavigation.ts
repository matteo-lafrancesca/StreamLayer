import { useCallback } from 'react';
import { usePlayer } from '@context/PlayerContext';

/**
 * Custom hook for MediaBar navigation logic
 * Handles opening/closing playlist and queue views with proper state management
 * 
 * @param isExpanded - Whether the player is currently expanded
 * @param onExpandToggle - Callback to toggle player expansion
 * @returns Navigation handlers for playlist and queue
 */
export function useMediaBarNavigation(isExpanded: boolean, onExpandToggle: () => void) {
    const { currentView, setCurrentView, selectedPlaylist } = usePlayer();

    /**
     * Handles opening the playlist/project view
     * - If already viewing playlist/project while expanded: close
     * - Otherwise: expand if needed, then navigate to playlist or project
     */
    const handleOpenPlaylist = useCallback(() => {
        const isViewingPlaylistArea = currentView === 'playlist' || currentView === 'project';

        if (isExpanded && isViewingPlaylistArea) {
            onExpandToggle();
            return;
        }

        if (!isExpanded) {
            onExpandToggle();
        }

        setCurrentView(selectedPlaylist ? 'playlist' : 'project');
    }, [isExpanded, currentView, selectedPlaylist, onExpandToggle, setCurrentView]);

    /**
     * Handles opening the queue view
     * - If already viewing queue while expanded: close
     * - Otherwise: expand if needed, then navigate to queue
     */
    const handleOpenQueue = useCallback(() => {
        if (isExpanded && currentView === 'queue') {
            onExpandToggle();
            return;
        }

        if (!isExpanded) {
            onExpandToggle();
        }

        setCurrentView('queue');
    }, [isExpanded, currentView, onExpandToggle, setCurrentView]);

    return {
        handleOpenPlaylist,
        handleOpenQueue
    };
}
