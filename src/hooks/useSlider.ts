import { useRef, useCallback } from 'react';

interface UseSliderReturn {
    ref: React.RefObject<HTMLDivElement | null>;
    handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function useSlider(onChange: (value: number) => void): UseSliderReturn {
    const ref = useRef<HTMLDivElement | null>(null);

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.round((x / rect.width) * 100);
        onChange(Math.max(0, Math.min(100, percentage)));
    }, [onChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        handleInteraction(e);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            handleInteraction(moveEvent);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [handleInteraction]);

    return {
        ref,
        handleMouseDown,
    };
}

