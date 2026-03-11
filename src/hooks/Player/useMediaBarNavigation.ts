import { useCallback } from 'react';
import { usePlayerState } from '@context/PlayerContext';
import { usePlayerUI } from '@context/PlayerUIContext';

// Logique de navigation pour la barre de média (MediaBar)
// Gère l'ouverture/fermeture des vues de playlist et de file d'attente
export function useMediaBarNavigation(isExpanded: boolean, onExpandToggle: () => void) {
    const { currentView, setCurrentView, selectedPlaylist, setSelectedPlaylist } = usePlayerUI();
    const { playingFromPlaylist } = usePlayerState();

    /**
     * Gère l'ouverture de la vue playlist / projet
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
     * Gère l'ouverture de la file d'attente (queue)
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
