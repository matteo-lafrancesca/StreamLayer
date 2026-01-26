import { type ReactNode } from 'react';
import { PlayerProvider } from '@context/PlayerContext';
import { Player } from '@components/Player/Player';

export interface StreamLayerProps {
    /** StreamLayer project ID */
    projectId: string;
    /** App content with access to audio context */
    children?: ReactNode;
}

/**
 * StreamLayer root component.
 * Encapsulates audio logic and player UI.
 * Wrap your app or content with this component.
 */
export function StreamLayer({ projectId, children }: StreamLayerProps) {
    return (
        <PlayerProvider projectId={projectId}>
            {children}
            <Player />
        </PlayerProvider>
    );
}
