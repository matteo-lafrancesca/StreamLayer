import { MediaBarDesktop } from './MediaBarDesktop';
import { CompactMediaBar } from './CompactMediaBar';
import { ViewRenderer } from './ViewRenderer';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { ProgressSlider } from './ProgressSlider';
import { usePlayerUI } from '@context/PlayerUIContext';
import { usePlayerExpansion } from '@hooks/usePlayerExpansion';
import { useDraggablePlayer } from '@hooks/useDraggablePlayer';
import { PLAYER_SIZES } from '@constants/playerSizes';
import sharedStyles from '@styles/PlayerShared.module.css';
import styles from '@styles/PlayerDesktop.module.css';
import {
    DndContext,
    useDraggable,
} from '@dnd-kit/core';
import { IconButton } from '@components/UI';
import { X } from 'lucide-react';

/**
 * Desktop Player Component.
 * Full-featured player with expandable content area.
 */
export function PlayerDesktop() {
    const { isCompact } = usePlayerUI();
    const {
        customPosition,
        sensors,
        handleDragStart,
        handleDragMove,
        handleDragEnd
    } = useDraggablePlayer({ isCompact });

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
        >
            <PlayerDesktopContent
                customPosition={customPosition}
            />
        </DndContext>
    );
}

function PlayerDesktopContent({
    customPosition
}: {
    customPosition: { x: number; y: number; dockSide: 'top' | 'bottom' } | null
}) {
    const { currentView, setCurrentView, selectedPlaylist, isCompact } = usePlayerUI();
    const { isExpanded, onExpandToggle } = usePlayerExpansion();

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: 'reduced-player-draggable',
        disabled: !isCompact,
    });

    // Helper to get conditional styles based on snap position
    const getPositionStyles = () => {
        if (!isCompact) return {}; // Normal mode uses default CSS

        // Base transform for drag preview
        const transformStyle = transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined;

        const baseStyle: React.CSSProperties = { transform: transformStyle };

        if (customPosition) {
            // Reset base positioning
            baseStyle.left = 'auto';
            baseStyle.right = 'auto';
            baseStyle.top = 'auto';
            baseStyle.bottom = 'auto';
            baseStyle.marginLeft = 0;
            baseStyle.marginRight = 0;
            baseStyle.marginTop = 0;
            baseStyle.marginBottom = 0;

            // Apply horizontal
            baseStyle.left = `${customPosition.x}px`;

            // Apply vertical
            // We use 'top' for the animation phase (when customPosition.y matches the animation tick)
            // But when settled (loop finished), we might want to switch to 'bottom' property for responsiveness.
            // HOWEVER, since we're updating 'top' every frame during animation, switching to 'bottom' abruptly might glitch if window resizes.
            // For now, let's stick to using 'top' pixels as calculated by the physics engine.
            // The 'targetY' for bottom was calculated as (Height - playerHeight - 20), which equals the top offset.

            baseStyle.top = `${customPosition.y}px`;
        }

        return baseStyle;
    };

    return (
        <div
            className={styles.playerContainer}
            style={getPositionStyles()}
        >
            <div
                ref={setNodeRef}
                className={`
                    ${styles.player} 
                    ${isCompact ? styles.playerCompact : ''}
                    ${currentView === 'queue' ? styles.playerTransparent : ''}
                    ${isDragging ? styles.isDragging : ''}
                `}
                style={{
                    height: isExpanded
                        ? `${PLAYER_SIZES.DESKTOP.EXPANDED_HEIGHT}px`
                        : `${PLAYER_SIZES.DESKTOP.COLLAPSED_HEIGHT}px`,
                    width: isCompact ? `${PLAYER_SIZES.DESKTOP.COMPACT_WIDTH}px` : undefined
                }}
            >
                {isCompact ? (
                    // Compact Mode
                    <>
                        <div className={sharedStyles.mediaBarSection}>
                            <CompactMediaBar
                                dragAttributes={attributes}
                                dragListeners={listeners}
                            />
                        </div>
                        <ProgressSlider />
                    </>
                ) : (
                    // Normal Mode
                    <>
                        {/* Expandable Content Area */}
                        <div
                            className={currentView === 'queue'
                                ? sharedStyles.queuePanel
                                : `
                                    ${sharedStyles.expandableContent} 
                                    ${isExpanded ? sharedStyles.expanded : sharedStyles.collapsed}
                                `
                            }
                        >
                            {/* Queue Panel Header */}
                            {currentView === 'queue' && (
                                <div className={sharedStyles.queueHeader}>
                                    <span className={sharedStyles.queueTitle}>File d'attente</span>
                                    <IconButton
                                        icon={<X size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />}
                                        onClick={onExpandToggle}
                                        title="Fermer la file d'attente"
                                        enlargeHitbox
                                    />
                                </div>
                            )}

                            {/* Header - Hidden in Queue Mode */}
                            {currentView !== 'queue' && (
                                <ExpandedPlayerHeader
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                    selectedPlaylist={selectedPlaylist}
                                    onExpandToggle={onExpandToggle}
                                />
                            )}

                            {/* Content Area - using ViewRenderer */}
                            <div className={sharedStyles.expandableContentScroll}>
                                <ViewRenderer
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                />
                            </div>
                        </div>

                        {/* MediaBar */}
                        <div className={`
                            ${sharedStyles.mediaBarSection} 
                            ${isExpanded ? styles.borderTop : ''}
                            ${currentView === 'queue' ? sharedStyles.mediaBarQueueMode : ''}
                        `}>
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
