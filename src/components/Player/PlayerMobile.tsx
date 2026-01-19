import { MediaBarMobile } from './MediaBarMobile';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { Slider } from '@components/UI';
import { useExpandablePlayer } from '@hooks/useExpandablePlayer';
import { usePlayer } from '@context/PlayerContext';
import styles from '@styles/PlayerMobile.module.css';

/**
 * Mobile Player Component
 * Optimized player for mobile with bottom progress slider
 */
export function PlayerMobile() {
    const {
        currentView,
        setCurrentView,
        playerRef,
        contentOpacity,
        onExpandToggle
    } = useExpandablePlayer();

    const { progress, selectedPlaylist } = usePlayer();

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

