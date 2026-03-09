import { useState, useMemo, type ReactNode } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';
import { PlayerUIContext } from './PlayerUIContext';

interface PlayerUIProviderProps {
    children: ReactNode;
}

export function PlayerUIProvider({ children }: PlayerUIProviderProps) {
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project' | 'queue' | 'track'>('project');
    const [isSeeking, setIsSeeking] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const contextValue = useMemo(() => ({
        selectedPlaylist,
        setSelectedPlaylist,
        selectedTrack,
        setSelectedTrack,
        isExpanded,
        setIsExpanded,
        currentView,
        setCurrentView,
        isCompact,
        setIsCompact,
        isSeeking,
        setIsSeeking,
        isDragging,
        setIsDragging
    }), [
        selectedPlaylist,
        selectedTrack,
        isExpanded,
        currentView,
        isCompact,
        isSeeking,
        isDragging
    ]);

    return (
        <PlayerUIContext.Provider value={contextValue}>
            {children}
        </PlayerUIContext.Provider>
    );
}
