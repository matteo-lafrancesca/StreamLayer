import { useRef, useCallback, useState, useEffect } from 'react';

interface UseSliderReturn {
    ref: (node: HTMLDivElement | null) => void;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
    isDragging: boolean;
}

// Gère l'interaction avec un curseur (slider) personnalisé
// Supporte les évènements souris et tactiles pour le glissement (drag)
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

        const rect = cachedRect || internalRef.current.getBoundingClientRect();

        let clientX: number;
        if ('touches' in e) {
            if (e.touches.length > 0) {
                clientX = e.touches[0].clientX;
            } else if ('changedTouches' in e && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
            } else {
                return;
            }
        } else {
            clientX = e.clientX;
        }

        const x = clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const clamped = Math.max(0, Math.min(100, percentage));

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
                const percentage = (x / rect.width) * 100;
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
                if (moveEvent.cancelable) moveEvent.preventDefault();
                handleInteraction(moveEvent, rect);
            }
        };

        const handleTouchEnd = (upEvent: TouchEvent) => {
            setIsDragging(false);
            if (internalRef.current && rect) {
                const clientX = upEvent.changedTouches[0].clientX;
                const x = clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                const clamped = Math.max(0, Math.min(100, percentage));
                latestOnDragEnd.current?.(clamped);
            }

            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

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

