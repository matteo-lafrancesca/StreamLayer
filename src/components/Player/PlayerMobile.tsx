import { MediaBarMobile } from './MediaBarMobile';
import { TrackViewMobile } from './TrackViewMobile';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { Slider } from '@components/UI';
import { useExpandablePlayer } from '@hooks/useExpandablePlayer';
import { useMobilePlayerAnimation } from '@hooks/useMobilePlayerAnimation';
import { usePlayer } from '@context/PlayerContext';
import { useTrackProgress } from '@hooks/useTrackProgress';
import sharedStyles from '@styles/PlayerShared.module.css';
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

    const { selectedPlaylist, isExpanded } = usePlayer();

    // Use local progress hook for compact mobile slider
    const { progress } = useTrackProgress();

    // Get animation styles - applies to all expanded views
    const animationStyles = useMobilePlayerAnimation({
        isExpanded,
        isTrackView: true, // Always animate when expanded
        duration: 300
    });

    return (
        <div className={styles.playerContainer} style={animationStyles.container}>
            <div
                ref={playerRef}
                className={styles.player}
                style={animationStyles.player}
            >
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
                        {currentView === 'track' ? (
                            <TrackViewMobile />
                        ) : currentView === 'playlist' ? (
                            <PlaylistView />
                        ) : currentView === 'queue' ? (
                            <QueueView />
                        ) : (
                            <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />
                        )}
                    </div>
                </div>

                {/* MediaBar - Hidden only when expanded in track view */}
                <div className={`${sharedStyles.mediaBarSection} ${isExpanded && currentView === 'track' ? styles.mediaBarHidden : ''}`}>
                    <MediaBarMobile
                        onExpandToggle={onExpandToggle}
                    />
                </div>

                {/* Mobile progress slider - Hidden only when expanded in track view */}
                <div className={`${sharedStyles.progressSlider} ${isExpanded && currentView === 'track' ? styles.progressSliderHidden : ''}`}>
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

