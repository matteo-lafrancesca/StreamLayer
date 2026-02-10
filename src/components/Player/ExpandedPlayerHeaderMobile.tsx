// import { IconButton } from '@components/UI'; // Unused
import { ArrowLeft } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import type { Playlist } from '@definitions/playlist';
import styles from '@styles/ExpandedPlayerHeader.module.css';

export interface ExpandedPlayerHeaderMobileProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
    // selectedPlaylist: Playlist | null; // Unused
    // onExpandToggle: () => void; // Unused
}

/**
 * Mobile header for expanded view.
 * Dynamic title and navigation.
 * Handles mobile specific navigation.
 */
export function ExpandedPlayerHeaderMobile({
    currentView,
    setCurrentView,
}: ExpandedPlayerHeaderMobileProps) {
    // Track view doesn't have a header (handled by BottomSheet chevron)
    if (currentView === 'track') {
        return null;
    }

    // Render header content based on view
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
                    </div>
                );
        }
    };

    return (
        <div className={styles.expandedPlayerHeader}>
            {renderHeaderContent()}
        </div>
    );
}
