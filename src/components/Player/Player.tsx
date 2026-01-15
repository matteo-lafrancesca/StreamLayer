import { useState } from 'react';
import { MediaBar } from './MediaBar';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { Button } from '../UI';
import { ListMusic } from 'lucide-react';
import { useHeightAnimation } from '../../hooks/useHeightAnimation';
import { useOpacityAnimation } from '../../hooks/useOpacityAnimation';
import styles from '../../styles/Player.module.css';

export function Player() {
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
    // Starts shortly before height animation ends for smoother transition
    const contentOpacity = useOpacityAnimation({
        isVisible: isExpanded,
        duration: 300, // Faster fade-in
        delay: 200,    // Start before full expansion
    });

    return (
        <div className={styles.playerContainer}>
            <div
                ref={playerRef}
                className={styles.player}
                style={{ height: '72px' }} // Initial height set inline
            >
                {/* Expandable Content Area */}
                <div
                    className={styles.expandableContent}
                    style={{
                        opacity: contentOpacity,
                        pointerEvents: contentOpacity > 0.5 ? 'auto' : 'none',
                        // No CSS transition here, fully handled by JS hook
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
                    <MediaBar
                        isExpanded={isExpanded}
                        onExpandToggle={() => setIsExpanded(!isExpanded)}
                    />
                </div>
            </div>
        </div>
    );
}
