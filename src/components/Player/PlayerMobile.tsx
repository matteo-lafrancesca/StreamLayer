import { MediaBarMobile } from './MediaBarMobile';
import { TrackViewMobile } from './TrackViewMobile';
import { ViewRenderer } from './ViewRenderer';
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
    const { currentView, setCurrentView, selectedPlaylist } = usePlayerUI();
    const { isExpanded, onExpandToggle } = usePlayerExpansion();

    const showMiniPlayerOverSheet = isExpanded && currentView !== 'track';

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

                    {/* Mobile progress slider */}
                    <ProgressSlider interactive={false} />
                </div>
            </div>

            {/* Bottom Sheet for ALL Expanded Views */}
            <BottomSheet
                isOpen={isExpanded}
                onClose={onExpandToggle}
                showChevron={currentView === 'track'}
            >
                {currentView === 'track' ? (
                    <TrackViewMobile />
                ) : (
                    <>
                        {/* Header for non-track views (Mobile-specific) */}
                        <ExpandedPlayerHeaderMobile
                            currentView={currentView}
                            setCurrentView={setCurrentView}
                            selectedPlaylist={selectedPlaylist}
                            onExpandToggle={onExpandToggle}
                        />

                        {/* Content Area - using ViewRenderer */}
                        <div
                            className={`${sharedStyles.expandableContentScroll} ${styles.expandableContentScrollMobile}`}
                            data-scrollable
                        >
                            <ViewRenderer
                                currentView={currentView}
                                setCurrentView={setCurrentView}
                            />
                        </div>
                    </>
                )}
            </BottomSheet>
        </div>
    );
}
