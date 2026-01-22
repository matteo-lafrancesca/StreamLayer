import { type ReactNode } from 'react';
import { PlayerProvider } from '@context/PlayerContext';
import { Player } from '@components/Player/Player';

export interface StreamLayerProps {
    /** L'identifiant du projet StreamLayer */
    projectId: string;
    /** Le contenu de votre application qui aura accès au contexte audio */
    children?: ReactNode;
}

/**
 * Composant racine StreamLayer
 * Encapsule toute la logique audio et l'interface du lecteur.
 * Placez ce composant à la racine de votre application ou autour du contenu qui doit interagir avec l'audio.
 */
export function StreamLayer({ projectId, children }: StreamLayerProps) {
    return (
        <PlayerProvider projectId={projectId}>
            {children}
            <Player />
        </PlayerProvider>
    );
}
