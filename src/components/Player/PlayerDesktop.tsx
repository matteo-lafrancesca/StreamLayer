import { MediaBarDesktop } from './MediaBarDesktop';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { useExpandablePlayer } from '@hooks/useExpandablePlayer';
import { usePlayer } from '@context/PlayerContext';
import styles from '@styles/PlayerDesktop.module.css';

/**
 * Desktop Player Component
 * Full-featured player with expandable content area
 */
export function PlayerDesktop() {
    const {
        isExpanded,
        currentView,
        setCurrentView,
        playerRef,
        contentOpacity,
        onExpandToggle
    } = useExpandablePlayer();

    const { selectedPlaylist } = usePlayer();

    return (
        <div className={styles.playerContainer}>
            <div
                ref={playerRef}
                className={styles.player}
                style={{ height: '72px' }}
            >
                {/* Expandable Content Area */}
                <div
                    className={styles.expandableContent}
                    style={{
                        opacity: contentOpacity,
                        pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
                    }}
                >
                    {/* Header */}
                    <ExpandedPlayerHeader
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        selectedPlaylist={selectedPlaylist}
                        onExpandToggle={onExpandToggle}
                    />

                    {/* Content Area */}
                    <div className={styles.expandableContentScroll}>
                        {currentView === 'playlist' ? (
                            <PlaylistView />
                        ) : currentView === 'queue' ? (
                            <QueueView />
                        ) : (
                            <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />
                        )}
                    </div>
                </div>

                {/* MediaBar - Absolutely positioned at bottom */}
                <div className={`${styles.mediaBarSection} ${isExpanded ? styles.borderTop : ''}`}>
                    <MediaBarDesktop
                        isExpanded={isExpanded}
                        onExpandToggle={onExpandToggle}
                    />
                </div>
            </div>
        </div>
    );
}

