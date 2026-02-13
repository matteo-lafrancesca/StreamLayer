import { useRef, useCallback, useState, useEffect } from 'react';

interface UseSliderReturn {
    ref: (node: HTMLDivElement | null) => void;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    isDragging: boolean;
}

/**
 * Hook for custom slider interaction.
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

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent, cachedRect?: DOMRect) => {
        if (!internalRef.current) return;

        // Use cached rect if available (during drag), otherwise get fresh (initial click)
        const rect = cachedRect || internalRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const percentage = Math.round((x / rect.width) * 100);
        const clamped = Math.max(0, Math.min(100, percentage));

        // Always call the latest callback
        latestOnChange.current(clamped);
        return clamped;
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);

        // Cache dimensions ONLY at the start of the interaction
        // This prevents layout thrashing (re-calculating size on every pixel move)
        // The bar doesn't move during the drag, so this is safe and much faster.
        const rect = internalRef.current?.getBoundingClientRect();

        const initialValue = handleInteraction(e, rect);
        if (initialValue !== undefined) {
            latestOnDragStart.current?.(initialValue);
        }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            // Pass the cached rect to avoid re-measuring DOM
            handleInteraction(moveEvent, rect);
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            setIsDragging(false);
            // Get final value on mouse up, reusing cached rect
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

    return {
        ref,
        handleMouseDown,
        isDragging,
    };
}

