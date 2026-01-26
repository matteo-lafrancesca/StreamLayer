import { IconButton } from '@components/UI';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import type { Playlist } from '@definitions/playlist';
import styles from '@styles/ExpandedPlayerHeader.module.css';

export interface ExpandedPlayerHeaderProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
    selectedPlaylist: Playlist | null;
    onExpandToggle: () => void;
}

/**
 * Header for expanded player view (Desktop).
 * Dynamic title and navigation based on current view.
 */
export function ExpandedPlayerHeader({
    currentView,
    setCurrentView,
    selectedPlaylist,
    onExpandToggle
}: ExpandedPlayerHeaderProps) {
    const renderHeaderContent = () => {
        switch (currentView) {
            case 'playlist':
                return (
                    <div className={styles.headerTitleRow}>
                        <button
                            onClick={() => setCurrentView('project')}
                            className={styles.backButton}
                            title="Retour aux projets"
                        >
                            <ArrowLeft size={PLAYER_SIZES.DESKTOP.ICON_LARGE} />
                        </button>
                        <h2 className={styles.headerTitle}>
                            {selectedPlaylist?.metadata.title || 'Playlist'}
                        </h2>
                    </div>
                );

            case 'queue':
                return (
                    <div className={styles.headerTitleRow}>
                        <h2 className={styles.headerTitle} style={{ marginLeft: 0 }}>
                            File d'attente
                        </h2>
                    </div>
                );

            case 'track':
                return null; // No header for track view

            case 'project':
            default:
                return (
                    <div className={styles.headerTitleRow}>
                        <h2 className={styles.headerTitle} style={{ marginLeft: 0 }}>
                            Playlists du projet
                        </h2>
                    </div>
                );
        }
    };

    return (
        <div className={styles.expandedPlayerHeader}>
            {renderHeaderContent()}

            {/* Close Button */}
            <div className={styles.closeButtonWrapper}>
                <IconButton
                    icon={<ChevronDown size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                    onClick={onExpandToggle}
                    title="Fermer le lecteur"
                    enlargeHitbox
                />
            </div>
        </div>
    );
}
