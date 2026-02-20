import { useRef, useCallback, useState, useEffect } from 'react';

interface UseSliderReturn {
    ref: (node: HTMLDivElement | null) => void;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
    isDragging: boolean;
}

/**
 * Hook for custom slider interaction.
 * Supports both mouse and touch events for drag functionality.
 */
export function useSlider(
    onChange: (value: number) => void,
    onDragStart?: (value: number) => void,
    onDragEnd?: (value: number) => void
): UseSliderReturn {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const ref = useCallback((node: HTMLDivElement | null) => {
        internalRef.current = node;
    }, []);
    const [isDragging, setIsDragging] = useState(false);

    // Keep track of the latest callbacks to avoid stale closures in event listeners
    const latestOnChange = useRef(onChange);
    const latestOnDragStart = useRef(onDragStart);
    const latestOnDragEnd = useRef(onDragEnd);

    useEffect(() => {
        latestOnChange.current = onChange;
        latestOnDragStart.current = onDragStart;
        latestOnDragEnd.current = onDragEnd;
    }, [onChange, onDragStart, onDragEnd]);

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent | React.TouchEvent<HTMLDivElement> | TouchEvent, cachedRect?: DOMRect) => {
        if (!internalRef.current) return;

        // Use cached rect if available (during drag), otherwise get fresh (initial click)
        const rect = cachedRect || internalRef.current.getBoundingClientRect();

        let clientX: number;
        if ('touches' in e) {
            // TouchEvent
            if (e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else if ('changedTouches' in e && e.changedTouches.length > 0) {
                // For touchend, use changedTouches
                clientX = e.changedTouches[0].clientX;
            } else {
                return;
            }
        } else {
            // MouseEvent
            clientX = e.clientX;
        }

        const x = clientX - rect.left;
        const percentage = Math.round((x / rect.width) * 100);
        const clamped = Math.max(0, Math.min(100, percentage));

        // Always call the latest callback
        latestOnChange.current(clamped);
        return clamped;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);

        const rect = internalRef.current?.getBoundingClientRect();
        const initialValue = handleInteraction(e, rect);
        if (initialValue !== undefined) {
            latestOnDragStart.current?.(initialValue);
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            handleInteraction(moveEvent, rect);
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            setIsDragging(false);
            if (internalRef.current && rect) {
                const x = upEvent.clientX - rect.left;
                const percentage = Math.round((x / rect.width) * 100);
                const clamped = Math.max(0, Math.min(100, percentage));
                latestOnDragEnd.current?.(clamped);
            }

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [handleInteraction]);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
        const startX = e.touches[0].clientX;
        const startY = e.touches[0].clientY;
        const lockRef = { direction: null as 'horizontal' | 'vertical' | null };

        const rect = internalRef.current?.getBoundingClientRect();
        const initialValue = handleInteraction(e, rect);
        if (initialValue !== undefined) {
            latestOnDragStart.current?.(initialValue);
        }

        const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentX = moveEvent.touches[0].clientX;
            const currentY = moveEvent.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            if (!lockRef.direction) {
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    lockRef.direction = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
                }
            }

            if (lockRef.direction === 'horizontal') {
                // Prevent scrolling while dragging horizontally
                if (moveEvent.cancelable) moveEvent.preventDefault();
                handleInteraction(moveEvent, rect);
            }
            // If vertical, we don't preventDefault, allowing the bottom sheet to catch it
        };

        const handleTouchEnd = (upEvent: TouchEvent) => {
            setIsDragging(false);
            if (internalRef.current && rect) {
                const clientX = upEvent.changedTouches[0].clientX;
                const x = clientX - rect.left;
                const percentage = Math.round((x / rect.width) * 100);
                const clamped = Math.max(0, Math.min(100, percentage));
                latestOnDragEnd.current?.(clamped);
            }

            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        // passive: false is required to use preventDefault()
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }, [handleInteraction]);

    return {
        ref,
        handleMouseDown,
        handleTouchStart,
        isDragging,
    };
}

