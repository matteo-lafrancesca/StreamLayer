import { useState } from 'react';
import { MediaBarDesktop } from './MediaBarDesktop';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { Button } from '../UI';
import { ListMusic } from 'lucide-react';
import { useHeightAnimation } from '../../hooks/useHeightAnimation';
import { useOpacityAnimation } from '../../hooks/useOpacityAnimation';
import styles from '../../styles/Player.module.css';

/**
 * Desktop Player Component
 * Full-featured player with expandable content area
 */
export function PlayerDesktop() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentView, setCurrentView] = useState<'playlist' | 'project'>('project');

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
                        <Button
                            variant={currentView === 'playlist' ? 'primary' : 'secondary'}
                            onClick={() => setCurrentView(currentView === 'playlist' ? 'project' : 'playlist')}
                        >
                            <ListMusic size={18} />
                            {currentView === 'playlist' ? 'Voir les playlists' : 'Voir la playlist'}
                        </Button>
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
