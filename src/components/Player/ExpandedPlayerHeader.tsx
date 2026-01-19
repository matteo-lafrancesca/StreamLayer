import { IconButton } from '@components/UI';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import type { Playlist } from '@definitions/playlist';
import styles from '@styles/ExpandedPlayerHeader.module.css';

export interface ExpandedPlayerHeaderProps {
    currentView: 'playlist' | 'project' | 'queue';
    setCurrentView: (view: 'playlist' | 'project' | 'queue') => void;
    selectedPlaylist: Playlist | null;
    onExpandToggle: () => void;
}

/**
 * Header component for expanded player view
 * Displays dynamic title and navigation based on current view
 */
export function ExpandedPlayerHeader({
    currentView,
    setCurrentView,
    selectedPlaylist,
    onExpandToggle
}: ExpandedPlayerHeaderProps) {
    return (
        <div className={styles.expandedPlayerHeader}>
            {currentView === 'playlist' ? (
                <div className={styles.headerTitleRow}>
                    <button
                        onClick={() => setCurrentView('project')}
                        className={styles.backButton}
                        title="Retour aux projets"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className={styles.headerTitle}>
                        {selectedPlaylist?.metadata.title || 'Playlist'}
                    </h2>
                </div>
            ) : currentView === 'queue' ? (
                <h2 className={styles.headerTitle}>
                    File d'attente
                </h2>
            ) : (
                <h2 className={styles.headerTitle}>
                    Playlists du projet
                </h2>
            )}

            {/* Close Button */}
            <div className={styles.closeButtonWrapper}>
                <IconButton
                    icon={<ChevronDown size={20} />}
                    onClick={onExpandToggle}
                    title="Fermer le lecteur"
                    enlargeHitbox
                />
            </div>
        </div>
    );
}

