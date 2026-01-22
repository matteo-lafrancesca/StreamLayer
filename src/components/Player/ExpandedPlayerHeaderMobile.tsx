import { IconButton } from '@components/UI';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import type { Playlist } from '@definitions/playlist';
import styles from '@styles/ExpandedPlayerHeader.module.css';

export interface ExpandedPlayerHeaderMobileProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
    selectedPlaylist: Playlist | null;
    onExpandToggle: () => void;
}

/**
 * Mobile-specific header component for expanded player view
 * Displays dynamic title and navigation based on current view
 * Mobile has different navigation flow
 */
export function ExpandedPlayerHeaderMobile({
    currentView,
    setCurrentView,
    selectedPlaylist,
    onExpandToggle
}: ExpandedPlayerHeaderMobileProps) {
    // Track view doesn't have a header (handled by BottomSheet chevron)
    if (currentView === 'track') {
        return null;
    }

    // Helper function to render header content based on view
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
                            <ArrowLeft size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        </button>
                        <h2 className={styles.headerTitle}>
                            {selectedPlaylist?.metadata.title || 'Playlist'}
                        </h2>
                    </div>
                );

            case 'queue':
                return (
                    <div className={styles.headerTitleRow}>
                        <button
                            onClick={() => setCurrentView('track')}
                            className={styles.backButton}
                            title="Retour à la lecture"
                        >
                            <ArrowLeft size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        </button>
                        <h2 className={styles.headerTitle}>
                            File d'attente
                        </h2>
                    </div>
                );

            case 'project':
            default:
                return (
                    <div className={styles.headerTitleRow}>
                        <button
                            onClick={() => setCurrentView('track')}
                            className={styles.backButton}
                            title="Retour à la lecture"
                        >
                            <ArrowLeft size={PLAYER_SIZES.MOBILE.ICON_SMALL} />
                        </button>
                        <h2 className={styles.headerTitle}>
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
