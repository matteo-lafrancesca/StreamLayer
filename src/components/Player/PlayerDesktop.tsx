import { useState, useEffect, useRef } from 'react';
import { IconButton } from '@components/UI';
import { X } from 'lucide-react';
import { MediaBarDesktop } from './MediaBarDesktop';
import { CompactMediaBar } from './CompactMediaBar';
import { ViewRenderer } from './ViewRenderer';
import { ExpandedPlayerHeader } from './ExpandedPlayerHeader';
import { ProgressSlider } from './ProgressSlider';
import { usePlayerUI } from '@context/PlayerUIContext';
import { usePlayerExpansion } from '@hooks/usePlayerExpansion';
import { PLAYER_SIZES } from '@constants/playerSizes';
import sharedStyles from '@styles/PlayerShared.module.css';
import styles from '@styles/PlayerDesktop.module.css';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    useDraggable,
    type DragEndEvent
} from '@dnd-kit/core';

// Position state: Snap to top/bottom, but free horizontal (clamped)
type PlayerPosition = {
    // Current visual position (pixels)
    x: number;
    y: number;
    // Where it should logically be docked
    dockSide: 'top' | 'bottom';
} | null;

/**
 * Desktop Player Component.
 * Full-featured player with expandable content area.
 */
export function PlayerDesktop() {
    const { isCompact } = usePlayerUI();
    const [customPosition, setCustomPosition] = useState<PlayerPosition>(null);

    // Animation refs
    const animationFrameRef = useRef<number | null>(null);
    const physicsRef = useRef({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        targetX: 0,
        targetY: 0
    });
    // Velocity tracking for inertia
    const velocityRef = useRef({
        vx: 0,
        lastX: 0,
        lastTime: 0
    });

    // Constants for physics
    const LERP_CONFIG = {
        factor: 0.15, // Speed of approach (0.1 = slow/smooth, 0.3 = fast/snappy)
        precision: 0.5,
        inertiaMultiplier: 12
    };

    // Handle expansion animation
    useEffect(() => {
        if (!isCompact && customPosition) {
            // WE ARE EXPANDING: Animate to center instead of snapping
            // 1. Calculate Target (Center Bottom)
            // Note: We use the CSS variables for width usually, but here we estimate or read them.
            // Assuming Desktop standard width.
            // Better: Use window center - half expanded width.
            const expandedWidth = 900; // Standard desktop width (var(--player-width-desktop))
            const targetX = (window.innerWidth - expandedWidth) / 2;
            const targetY = window.innerHeight - PLAYER_SIZES.DESKTOP.EXPANDED_HEIGHT - 20;

            // 2. Start Animation to that target
            startAnimation(
                customPosition.x,
                customPosition.y,
                targetX,
                targetY,
                'bottom',
                () => {
                    // 3. On Complete: Clear custom position to let CSS take over
                    setCustomPosition(null);
                }
            );
        } else if (!isCompact) {
            // Just ensure it's cleared if we didn't have a position
            setCustomPosition(null);
            cancelAnimation();
        }
    }, [isCompact, customPosition]); // Added customPosition to dependencies

    // Cleanup drag animation on unmount
    useEffect(() => {
        return () => cancelAnimation();
    }, []);

    const cancelAnimation = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = () => {
        // Reset velocity tracking
        velocityRef.current = {
            vx: 0,
            lastX: 0,
            lastTime: performance.now()
        };
        cancelAnimation();
    };

    // Track velocity for inertia
    const handleDragMove = (event: any) => {
        const { delta } = event;
        const now = performance.now();
        const dt = now - velocityRef.current.lastTime;

        if (dt > 0) {
            const dx = delta.x - velocityRef.current.lastX;
            const instantVx = dx / dt;
            velocityRef.current.vx = instantVx * 0.7 + velocityRef.current.vx * 0.3;
            velocityRef.current.lastX = delta.x;
            velocityRef.current.lastTime = now;
        }
    };

    const startAnimation = (
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        dockSide: 'top' | 'bottom',
        onComplete?: () => void
    ) => {
        cancelAnimation();

        physicsRef.current = {
            x: startX,
            y: startY,
            vx: 0,
            vy: 0,
            targetX,
            targetY
        };

        const loop = () => {
            const { x, y, targetX, targetY } = physicsRef.current;

            // Exponential Decay (Lerp) - GUARANTEED NO OVERSHOOT
            // Formula: current = current + (target - current) * factor
            const dx = (targetX - x);
            const dy = (targetY - y);

            const newX = x + dx * LERP_CONFIG.factor;
            const newY = y + dy * LERP_CONFIG.factor;

            // Check if settled (pixels close enough)
            const isSettled =
                Math.abs(dx) < LERP_CONFIG.precision &&
                Math.abs(dy) < LERP_CONFIG.precision;

            if (isSettled) {
                setCustomPosition({
                    x: targetX,
                    y: targetY,
                    dockSide: dockSide
                });
                cancelAnimation();
                if (onComplete) onComplete();
                return;
            }

            // Update refs and state
            physicsRef.current.x = newX;
            physicsRef.current.y = newY;

            setCustomPosition({
                x: newX,
                y: newY,
                dockSide: dockSide
            });

            animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { delta, active } = event;

        // @ts-ignore - dnd-kit typings compatibility
        const initialRect = active.rect.current.initial;

        if (!initialRect) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Use actual dimensions from the dragged element (with fallback)
        const playerWidth = initialRect.width || PLAYER_SIZES.DESKTOP.COMPACT_WIDTH;
        const playerHeight = initialRect.height || PLAYER_SIZES.DESKTOP.COLLAPSED_HEIGHT;

        // 1. Calculate RAW DROP position (Start of animation)
        const rawDropY = initialRect.top + delta.y;
        const rawDropX = initialRect.left + delta.x;

        // 2. Calculate VALID TARGET position (End of animation)

        // INERTIA CALCULATION:
        // Project the target X based on current velocity
        const inertiaX = rawDropX + (velocityRef.current.vx * LERP_CONFIG.inertiaMultiplier * 10);

        // Clamp projected Target X to window bounds
        const targetX = Math.max(20, Math.min(inertiaX, windowWidth - playerWidth - 20));

        // Determine closest side for Y
        const currentCenterY = rawDropY + playerHeight / 2;
        const dockSide = currentCenterY < windowHeight / 2 ? 'top' : 'bottom';

        // Target Y
        let targetY = 20; // Top
        if (dockSide === 'bottom') {
            targetY = windowHeight - playerHeight - 20;
        }

        // Initialize state to Drop Position immediately
        setCustomPosition({
            x: rawDropX,
            y: rawDropY,
            dockSide: dockSide
        });

        // Start Physics Loop to animate to Target
        startAnimation(rawDropX, rawDropY, targetX, targetY, dockSide);
    };

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
    customPosition: PlayerPosition
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
