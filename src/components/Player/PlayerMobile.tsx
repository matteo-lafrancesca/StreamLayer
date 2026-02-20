import { MediaBarMobile } from './MediaBarMobile';
import { TrackViewMobile } from './TrackViewMobile';
import { PlaylistView } from './PlaylistView';
import { ProjectView } from './ProjectView';
import { QueueView } from './QueueView';
import { NavStack } from './NavStack';
import { ExpandedPlayerHeaderMobile } from './ExpandedPlayerHeaderMobile';
import { BottomSheet } from './BottomSheet';
import { ProgressSlider } from './ProgressSlider';
import { usePlayerUI } from '@context/PlayerUIContext';
import { usePlayerExpansion } from '@hooks/usePlayerExpansion';
import { MOBILE_PLAYER_STYLES } from '@constants/mobilePlayerStyles';
import sharedStyles from '@styles/PlayerShared.module.css';
import styles from '@styles/PlayerMobile.module.css';

/**
 * Mobile Player Component.
 * Player stays fixed at bottom, all expanded views appear in a bottom sheet overlay.
 */
export function PlayerMobile() {
    const { currentView, setCurrentView, isDragging } = usePlayerUI();
    const { isExpanded, onExpandToggle } = usePlayerExpansion();

    const showMiniPlayerOverSheet = isExpanded && currentView !== 'track';

    let layer1State: 'hidden' | 'active' | 'obscured' = 'hidden';
    if (currentView === 'project' || currentView === 'queue') {
        layer1State = 'active';
    } else if (currentView === 'playlist') {
        layer1State = 'obscured';
    }

    let layer2State: 'hidden' | 'active' | 'obscured' = 'hidden';
    if (currentView === 'playlist') {
        layer2State = 'active';
    }

    return (
        <div className={styles.mobileWrapper}>
            {/* Fixed Player at Bottom */}
            <div
                className={styles.playerContainer}
                style={{
                    ...MOBILE_PLAYER_STYLES.container,
                    pointerEvents: (isExpanded && !showMiniPlayerOverSheet) ? 'none' : MOBILE_PLAYER_STYLES.container.pointerEvents,
                    zIndex: showMiniPlayerOverSheet ? 10000 : MOBILE_PLAYER_STYLES.container.zIndex,
                }}
            >
                <div className={styles.player} style={MOBILE_PLAYER_STYLES.player}>
                    {/* MediaBar */}
                    <div className={sharedStyles.mediaBarSection}>
                        <MediaBarMobile onExpandToggle={onExpandToggle} />
                    </div>

                    {/* Mobile progress slider at the bottom */}
                    <ProgressSlider interactive={false} />
                </div>
            </div>

            {/* Bottom Sheet for ALL Expanded Views */}
            <BottomSheet
                isOpen={isExpanded}
                onClose={onExpandToggle}
                showChevron={false}
                disabled={isDragging}
            >
                {/* Layer 0: Track View (Always rendered as base) */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'auto', zIndex: 1 }}>
                    <TrackViewMobile />
                </div>

                {/* Layer 1: Project or Queue View */}
                <NavStack
                    state={layer1State}
                    onBack={() => setCurrentView('track')}
                    zIndex={2}
                >
                    <ExpandedPlayerHeaderMobile
                        currentView={currentView === 'queue' ? 'queue' : 'project'}
                        setCurrentView={setCurrentView}
                    />
                    <div className={`${sharedStyles.expandableContentScroll} ${styles.expandableContentScrollMobile}`} data-scrollable style={{ flex: 1, paddingBottom: showMiniPlayerOverSheet ? '80px' : 0 }}>
                        {currentView === 'queue' ? <QueueView /> : <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />}
                    </div>
                </NavStack>

                {/* Layer 2: Playlist View */}
                <NavStack
                    state={layer2State}
                    onBack={() => setCurrentView('project')}
                    zIndex={3}
                >
                    <ExpandedPlayerHeaderMobile
                        currentView='playlist'
                        setCurrentView={setCurrentView}
                    />
                    <div className={`${sharedStyles.expandableContentScroll} ${styles.expandableContentScrollMobile}`} data-scrollable style={{ flex: 1, paddingBottom: showMiniPlayerOverSheet ? '80px' : 0 }}>
                        <PlaylistView />
                    </div>
                </NavStack>

                {/* Background Fade Overlay for better separation from list content */}
                {currentView !== 'track' && <div className={styles.bottomFade} style={{ zIndex: 1000 }} />}
            </BottomSheet>
        </div>
    );
}
