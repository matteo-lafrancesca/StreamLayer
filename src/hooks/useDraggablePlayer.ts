import { useState, useEffect, useRef } from 'react';
import {
    useSensor,
    useSensors,
    PointerSensor,
    type DragEndEvent
} from '@dnd-kit/core';
import { PLAYER_SIZES } from '@constants/playerSizes';

interface PlayerPosition {
    x: number;
    y: number;
    dockSide: 'top' | 'bottom';
}

interface UseDraggablePlayerProps {
    isCompact: boolean;
    onExpandComplete?: () => void;
}

export function useDraggablePlayer({ isCompact, onExpandComplete }: UseDraggablePlayerProps) {
    const [customPosition, setCustomPosition] = useState<PlayerPosition | null>(null);

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
        factor: 0.15,
        precision: 0.5,
        inertiaMultiplier: 12
    };

    const cancelAnimation = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
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

            const dx = (targetX - x);
            const dy = (targetY - y);

            const newX = x + dx * LERP_CONFIG.factor;
            const newY = y + dy * LERP_CONFIG.factor;

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

    // Handle expansion animation
    useEffect(() => {
        if (!isCompact && customPosition) {
            const expandedWidth = 900;
            const targetX = (window.innerWidth - expandedWidth) / 2;
            const targetY = window.innerHeight - PLAYER_SIZES.DESKTOP.EXPANDED_HEIGHT - 20;

            startAnimation(
                customPosition.x,
                customPosition.y,
                targetX,
                targetY,
                'bottom',
                () => {
                    setCustomPosition(null);
                    if (onExpandComplete) onExpandComplete();
                }
            );
        } else if (!isCompact) {
            setCustomPosition(null);
            cancelAnimation();
        }
    }, [isCompact]);

    useEffect(() => {
        return () => cancelAnimation();
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = () => {
        velocityRef.current = {
            vx: 0,
            lastX: 0,
            lastTime: performance.now()
        };
        cancelAnimation();
    };

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

    const handleDragEnd = (event: DragEndEvent) => {
        const { delta, active } = event;
        // @ts-ignore
        const initialRect = active.rect.current.initial;

        if (!initialRect) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const playerWidth = initialRect.width || PLAYER_SIZES.DESKTOP.COMPACT_WIDTH;
        const playerHeight = initialRect.height || PLAYER_SIZES.DESKTOP.COLLAPSED_HEIGHT;

        const rawDropY = initialRect.top + delta.y;
        const rawDropX = initialRect.left + delta.x;

        const inertiaX = rawDropX + (velocityRef.current.vx * LERP_CONFIG.inertiaMultiplier * 10);
        const targetX = Math.max(20, Math.min(inertiaX, windowWidth - playerWidth - 20));

        const currentCenterY = rawDropY + playerHeight / 2;
        const dockSide = currentCenterY < windowHeight / 2 ? 'top' : 'bottom';

        let targetY = 20;
        if (dockSide === 'bottom') {
            targetY = windowHeight - playerHeight - 20;
        }

        setCustomPosition({
            x: rawDropX,
            y: rawDropY,
            dockSide: dockSide
        });

        startAnimation(rawDropX, rawDropY, targetX, targetY, dockSide);
    };

    return {
        customPosition,
        sensors,
        handleDragStart,
        handleDragMove,
        handleDragEnd
    };
}
