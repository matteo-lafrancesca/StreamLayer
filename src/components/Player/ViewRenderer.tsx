import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';

export interface ViewRendererProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
}

/**
 * Renders appropriate view based on currentView state.
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
