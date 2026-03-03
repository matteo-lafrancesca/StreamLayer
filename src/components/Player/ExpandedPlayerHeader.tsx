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
    onExpandToggle
}: ExpandedPlayerHeaderProps) {

    return (
        <div className={styles.expandedPlayerHeader}>
            <div className={styles.leftSection}>
                {currentView === 'playlist' && (
                    <button
                        onClick={() => setCurrentView('project')}
                        className={styles.backButton}
                        title="Retour aux projets"
                    >
                        <ArrowLeft size={PLAYER_SIZES.DESKTOP.ICON_LARGE} />
                    </button>
                )}
            </div>

            <div className={styles.centerSection}>
            </div>

            {/* Right: Close Button */}
            <div className={styles.rightSection}>
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
