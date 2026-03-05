import { useState } from 'react';
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

    const [isLayer1Swiping, setIsLayer1Swiping] = useState(false);
    const [isLayer2Swiping, setIsLayer2Swiping] = useState(false);

    const isSwipingBack = isLayer1Swiping || isLayer2Swiping;

    const showMiniPlayerOverSheet = isExpanded && currentView !== 'track' && !isSwipingBack;

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
            <div
                className={styles.playerContainer}
                style={{
                    ...MOBILE_PLAYER_STYLES.container,
                    pointerEvents: (isExpanded && !showMiniPlayerOverSheet) ? 'none' : MOBILE_PLAYER_STYLES.container.pointerEvents,
                    zIndex: showMiniPlayerOverSheet ? 10000 : MOBILE_PLAYER_STYLES.container.zIndex,
                }}
            >
                <div className={styles.player} style={MOBILE_PLAYER_STYLES.player}>
                    <div className={sharedStyles.mediaBarSection}>
                        <MediaBarMobile onExpandToggle={onExpandToggle} />
                    </div>

                    <ProgressSlider interactive={false} />
                </div>
            </div>

            <BottomSheet
                isOpen={isExpanded}
                onClose={onExpandToggle}
                showChevron={false}
                disabled={isDragging}
            >
                <div style={{ position: 'absolute', inset: 0, overflow: 'auto', zIndex: 1 }}>
                    <TrackViewMobile />
                </div>

                <NavStack
                    state={layer1State}
                    onBack={() => setCurrentView('track')}
                    zIndex={2}
                    onSwipeProgress={setIsLayer1Swiping}
                >
                    <ExpandedPlayerHeaderMobile
                        currentView={currentView === 'queue' ? 'queue' : 'project'}
                        setCurrentView={setCurrentView}
                    />
                    <div className={`${sharedStyles.expandableContentScroll} ${styles.expandableContentScrollMobile}`} data-scrollable style={{ flex: 1, paddingBottom: showMiniPlayerOverSheet ? 'calc(env(safe-area-inset-bottom, 0px) + 112px)' : 0 }}>
                        {currentView === 'queue' ? <QueueView /> : <ProjectView onPlaylistSelect={() => setCurrentView('playlist')} />}
                    </div>
                </NavStack>

                <NavStack
                    state={layer2State}
                    onBack={() => setCurrentView('project')}
                    zIndex={3}
                    onSwipeProgress={setIsLayer2Swiping}
                >
                    <ExpandedPlayerHeaderMobile
                        currentView='playlist'
                        setCurrentView={setCurrentView}
                    />
                    <div className={`${sharedStyles.expandableContentScroll} ${styles.expandableContentScrollMobile}`} data-scrollable style={{ flex: 1, paddingBottom: showMiniPlayerOverSheet ? 'calc(env(safe-area-inset-bottom, 0px) + 112px)' : 0 }}>
                        <PlaylistView />
                    </div>
                </NavStack>

                {currentView !== 'track' && <div className={styles.bottomFade} style={{ zIndex: 1000 }} />}
            </BottomSheet>
        </div>
    );
}
