import { ArrowLeft } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';

import styles from '../../Views/ExpandedPlayerHeader/ExpandedPlayerHeader.module.css';

export interface ExpandedPlayerHeaderMobileProps {
    currentView: 'playlist' | 'project' | 'queue' | 'track';
    setCurrentView: (view: 'playlist' | 'project' | 'queue' | 'track') => void;
}

/**
 * Header mobile pour la vue étendue.
 * Navigation dynamique spécifique au mobile.
 */
export function ExpandedPlayerHeaderMobile({
    currentView,
    setCurrentView,
}: ExpandedPlayerHeaderMobileProps) {
    if (currentView === 'track') {
        return null;
    }

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
        <header className={styles.expandedPlayerHeader}>
            {renderHeaderContent()}
        </header>
    );
}
