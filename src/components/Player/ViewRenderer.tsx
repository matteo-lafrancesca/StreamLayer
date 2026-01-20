import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';

export interface ViewRendererProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
}

/**
 * ViewRenderer Component
 * Renders the appropriate view based on currentView state
 * Shared between Desktop and Mobile to eliminate duplication
 */
export function ViewRenderer({ currentView, setCurrentView }: ViewRendererProps) {
    if (currentView === 'playlist') {
        return <PlaylistView />;
    }

    if (currentView === 'queue') {
        return <QueueView />;
    }

    // Default to project view
    return <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />;
}
