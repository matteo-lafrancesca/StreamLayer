import { MediaBarDesktop } from './MediaBarDesktop';
import { CompactMediaBar } from './CompactMediaBar';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { Slider } from '@components/UI';
import { useExpandablePlayer } from '@hooks/useExpandablePlayer';
import { usePlayer } from '@context/PlayerContext';
import { useTrackProgress } from '@hooks/useTrackProgress';
import sharedStyles from '@styles/PlayerShared.module.css';
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

    const { selectedPlaylist, isCompact } = usePlayer();
    const { progress, seek } = useTrackProgress();

    return (
        <div className={styles.playerContainer}>
            <div
                ref={playerRef}
                className={`${styles.player} ${isCompact ? styles.playerCompact : ''}`}
                style={{ height: '72px' }}
            >
                {isCompact ? (
                    // Compact Mode: Only show compact media bar and progress slider
                    <>
                        <div className={sharedStyles.mediaBarSection}>
                            <CompactMediaBar />
                        </div>
                        <div className={sharedStyles.progressSlider}>
                            <Slider
                                value={progress}
                                onChange={seek}
                                showThumb={false}
                                variant="thin"
                            />
                        </div>
                    </>
                ) : (
                    // Normal Mode: Show expandable content and full media bar
                    <>
                        {/* Expandable Content Area */}
                        <div
                            className={sharedStyles.expandableContent}
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
                            <div className={sharedStyles.expandableContentScroll}>
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
                        <div className={`${sharedStyles.mediaBarSection} ${isExpanded ? styles.borderTop : ''}`}>
                            <MediaBarDesktop
                                isExpanded={isExpanded}
                                onExpandToggle={onExpandToggle}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

