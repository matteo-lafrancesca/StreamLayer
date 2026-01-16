import { useState } from 'react';
import { MediaBarDesktop } from './MediaBarDesktop';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { ArrowLeft } from 'lucide-react';
import { useHeightAnimation } from '../../hooks/useHeightAnimation';
import { useOpacityAnimation } from '../../hooks/useOpacityAnimation';
import { usePlayer } from '../../context/PlayerContext';
import styles from '../../styles/PlayerDesktop.module.css';

/**
 * Desktop Player Component
 * Full-featured player with expandable content area
 */
export function PlayerDesktop() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project'>('project');
    const { selectedPlaylist } = usePlayer();

    // Height animation (300ms)
    const playerRef = useHeightAnimation({
        isExpanded,
        collapsedHeight: 72,
        expandedHeight: 600,
        duration: 300,
    });

    // Opacity animation for content
    const contentOpacity = useOpacityAnimation({
        isVisible: isExpanded,
        duration: 300,
        delay: 200,
    });

    // Handler for expand toggle
    const onExpandToggle = () => {
        setIsExpanded(!isExpanded);
    };

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
                        ) : (
                            <h2 className={styles.headerTitle}>
                                Playlists du projet
                            </h2>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className={styles.expandableContentScroll}>
                        {currentView === 'playlist' ? (
                            <PlaylistView />
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
