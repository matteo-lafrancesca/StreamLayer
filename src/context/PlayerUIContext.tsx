import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Track } from '@definitions/track';
import type { Playlist } from '@definitions/playlist';

interface PlayerUIContextType {
    // UI state
    selectedPlaylist: Playlist | null;
    setSelectedPlaylist: (playlist: Playlist | null) => void;

    selectedTrack: Track | null;
    setSelectedTrack: (track: Track | null) => void;

    // Player expansion state
    isExpanded: boolean;
    setIsExpanded: (isExpanded: boolean) => void;
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;

    // Player compact mode state
    isCompact: boolean;
    setIsCompact: (isCompact: boolean) => void;

    // Seek state
    isSeeking: boolean;
    setIsSeeking: (isSeeking: boolean) => void;
}

const PlayerUIContext = createContext<PlayerUIContextType | undefined>(undefined);

interface PlayerUIProviderProps {
    children: ReactNode;
}

export function PlayerUIProvider({ children }: PlayerUIProviderProps) {
    // UI state
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project' | 'queue' | 'track'>('project');
    const [isSeeking, setIsSeeking] = useState(false);
    const [isCompact, setIsCompact] = useState(false);

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
    }), [
        selectedPlaylist,
        selectedTrack,
        isExpanded,
        currentView,
        isCompact,
        isSeeking
    ]);

    return (
        <PlayerUIContext.Provider value={contextValue}>
            {children}
        </PlayerUIContext.Provider>
    );
}

export function usePlayerUI() {
    const context = useContext(PlayerUIContext);
    if (context === undefined) {
        throw new Error('usePlayerUI must be used within a PlayerUIProvider');
    }
    return context;
}
