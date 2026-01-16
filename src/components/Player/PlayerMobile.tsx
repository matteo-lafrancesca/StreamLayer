import { useState } from 'react';
import { MediaBarMobile } from './MediaBarMobile';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { Slider } from '../UI';
import { ArrowLeft } from 'lucide-react';
import { useHeightAnimation } from '../../hooks/useHeightAnimation';
import { useOpacityAnimation } from '../../hooks/useOpacityAnimation';
import { usePlayer } from '../../context/PlayerContext';
import styles from '../../styles/PlayerMobile.module.css';

/**
 * Mobile Player Component
 * Optimized player for mobile with bottom progress slider
 */
export function PlayerMobile() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project'>('project');
    const { progress, selectedPlaylist } = usePlayer();

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
                <div className={styles.mediaBarSection}>
                    <MediaBarMobile
                        onExpandToggle={onExpandToggle}
                    />
                </div>

                {/* Mobile progress slider - positioned at the very bottom */}
                <div className={styles.mobileProgressSlider}>
                    <Slider
                        value={progress}
                        onChange={() => { }} // Non-interactive on mobile
                        showThumb={false}
                        variant="thin"
                    />
                </div>
            </div>
        </div>
    );
}
