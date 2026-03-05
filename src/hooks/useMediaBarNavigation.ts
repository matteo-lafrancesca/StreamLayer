import { useCallback } from 'react';
import { usePlayerState } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';

/**
 * Custom hook for MediaBar navigation logic
 * Handles opening/closing playlist and queue views with proper state management
 * 
 * @param isExpanded - Whether the player is currently expanded
 * @param onExpandToggle - Callback to toggle player expansion
 * @returns Navigation handlers for playlist and queue
 */
export function useMediaBarNavigation(isExpanded: boolean, onExpandToggle: () => void) {
    const { currentView, setCurrentView, selectedPlaylist, setSelectedPlaylist } = usePlayerUI();
    const { playingFromPlaylist } = usePlayerState();

    /**
     * Handles opening the playlist/project view
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

        if (playingFromPlaylist) {
            setSelectedPlaylist(playingFromPlaylist);
        }

        setCurrentView(selectedPlaylist || playingFromPlaylist ? 'playlist' : 'project');
    }, [isExpanded, currentView, selectedPlaylist, playingFromPlaylist, onExpandToggle, setCurrentView, setSelectedPlaylist]);

    /**
     * Handles opening the queue view
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
