import React, { Suspense } from 'react';
import { MediaBarDesktop } from './MediaBarDesktop';
import { CompactMediaBar } from './CompactMediaBar';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { ProgressSlider } from './ProgressSlider';

const ViewRenderer = React.lazy(() => import('./ViewRenderer').then(m => ({ default: m.ViewRenderer })));
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

    const getPositionStyles = () => {
        if (!isCompact) return {};

        const transformStyle = transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined;

        const baseStyle: React.CSSProperties = { transform: transformStyle };

        if (customPosition) {
            baseStyle.left = 'auto';
            baseStyle.right = 'auto';
            baseStyle.top = 'auto';
            baseStyle.bottom = 'auto';
            baseStyle.marginLeft = 0;
            baseStyle.marginRight = 0;
            baseStyle.marginTop = 0;
            baseStyle.marginBottom = 0;

            baseStyle.left = `${customPosition.x}px`;

            if (customPosition.dockSide === 'bottom') {
                baseStyle.bottom = `calc(100vh - ${customPosition.y + PLAYER_SIZES.DESKTOP.COLLAPSED_HEIGHT}px)`;
            } else {
                baseStyle.top = `${customPosition.y}px`;
            }
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
                    <>
                        <div
                            className={currentView === 'queue'
                                ? sharedStyles.queuePanel
                                : `
                                    ${sharedStyles.expandableContent} 
                                    ${isExpanded ? sharedStyles.expanded : sharedStyles.collapsed}
                                `
                            }
                        >
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

                            {currentView !== 'queue' && (
                                <ExpandedPlayerHeader
                                    currentView={currentView}
                                    setCurrentView={setCurrentView}
                                    selectedPlaylist={selectedPlaylist}
                                    onExpandToggle={onExpandToggle}
                                />
                            )}

                            <div className={sharedStyles.expandableContentScroll}>
                                <Suspense fallback={<div className={sharedStyles.loadingPlaceholder} />}>
                                    <ViewRenderer
                                        currentView={currentView}
                                        setCurrentView={setCurrentView}
                                    />
                                </Suspense>
                            </div>
                        </div>

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
