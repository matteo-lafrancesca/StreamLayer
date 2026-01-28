import { type ReactNode } from 'react';
import { PlayerProvider } from '@context/PlayerContext';
import { AuthProvider } from '@context/AuthContext';
import { PlayerUIProvider } from '@context/PlayerUIContext';
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
        <AuthProvider projectId={projectId}>
            <PlayerUIProvider>
                <PlayerProvider>
                    {children}
                    <Player />
                </PlayerProvider>
            </PlayerUIProvider>
        </AuthProvider>
    );
}
