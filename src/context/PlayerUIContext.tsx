import { createContext, useContext } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';

export interface PlayerUIContextType {
    selectedPlaylist: Playlist | null;
    setSelectedPlaylist: (playlist: Playlist | null) => void;

    selectedTrack: Track | null;
    setSelectedTrack: (track: Track | null) => void;

    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;

    isCompact: boolean;
    setIsCompact: (isCompact: boolean) => void;

    isSeeking: boolean;
    setIsSeeking: (isSeeking: boolean) => void;

    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
}

export const PlayerUIContext = createContext<PlayerUIContextType | undefined>(undefined);

export function usePlayerUI() {
    const context = useContext(PlayerUIContext);
    if (context === undefined) {
        throw new Error('usePlayerUI doit être utilisé à l\'intérieur d\'un PlayerUIProvider');
    }
    return context;
}
