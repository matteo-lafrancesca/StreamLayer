import { MediaBarDesktop } from './MediaBarDesktop';
import { CompactMediaBar } from './CompactMediaBar';
import { ViewRenderer } from './ViewRenderer';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { ProgressSlider } from './ProgressSlider';
import { usePlayer } from '@context/PlayerContext';
import { usePlayerExpansion } from '@hooks/usePlayerExpansion';
import { PLAYER_SIZES } from '@constants/playerSizes';
import sharedStyles from '@styles/PlayerShared.module.css';
import styles from '@styles/PlayerDesktop.module.css';

/**
 * Desktop Player Component.
 * Full-featured player with expandable content area.
 */
export function PlayerDesktop() {
    const { currentView, setCurrentView, selectedPlaylist, isCompact } = usePlayer();
    const { isExpanded, onExpandToggle } = usePlayerExpansion();

    return (
        <div className={styles.playerContainer}>
            <div
                className={`${styles.player} ${isCompact ? styles.playerCompact : ''}`}
                style={{
                    height: isExpanded
                        ? `${PLAYER_SIZES.DESKTOP.EXPANDED_HEIGHT}px`
                        : `${PLAYER_SIZES.DESKTOP.COLLAPSED_HEIGHT}px`,
                    width: isCompact ? `${PLAYER_SIZES.DESKTOP.COMPACT_WIDTH}px` : undefined // Undefined lets CSS handle default
                }}
            >
                {isCompact ? (
                    // Compact Mode: Only show compact media bar and progress slider
                    <>
                        <div className={sharedStyles.mediaBarSection}>
                            <CompactMediaBar />
                        </div>
                        <ProgressSlider />
                    </>
                ) : (
                    // Normal Mode: Show expandable content area and full media bar
                    <>
                        {/* Expandable Content Area */}
                        <div
                            className={`
                                ${sharedStyles.expandableContent} 
                                ${isExpanded ? sharedStyles.expanded : sharedStyles.collapsed}
                            `}
                        >
                            {/* Header */}
                            <ExpandedPlayerHeader
                                currentView={currentView}
                                setCurrentView={setCurrentView}
                                selectedPlaylist={selectedPlaylist}
                                onExpandToggle={onExpandToggle}
                            />

                            {/* Content Area - using ViewRenderer */}
                            <div className={sharedStyles.expandableContentScroll}>
                                <ViewRenderer
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                />
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
