import { PlaylistView } from '../PlaylistView/index';
import { ProjectView } from '../ProjectView/index';
import { QueueView } from '../QueueView/index';

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

    return <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />;
}
