import { type ReactNode } from 'react';
import { PlayerProvider } from '@context/PlayerContext';
import { AuthProvider } from '@context/AuthContext';
import { PlayerUIProvider } from '@context/PlayerUIContext';
import { Player } from '@components/Player/Player';
import { DragDropWrapper } from '@components/DragDropWrapper';

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
        <div className="sl-root">
            <AuthProvider projectId={projectId}>
                <PlayerUIProvider>
                    <PlayerProvider>
                        <DragDropWrapper>
                            {children}
                            <Player />
                        </DragDropWrapper>
                    </PlayerProvider>
                </PlayerUIProvider>
            </AuthProvider>
        </div>
    );
}
