import { useRef, useEffect } from 'react';

interface UseSwipeToDismissProps {
    isOpen: boolean;
    onClose: () => void;
    threshold?: number; // Distance threshold to trigger dismiss (in px)
}

interface SwipeState {
    isDragging: boolean;
    startY: number;
    currentY: number;
    startX: number;
}

/**
 * Custom hook for swipe-to-dismiss gesture on bottom sheet
 * Allows swipe from anywhere, but only triggers dismiss when scrolled to top
 */
export function useSwipeToDismiss({
    isOpen,
    onClose,
    threshold = 150
}: UseSwipeToDismissProps) {
    const dragRef = useRef<HTMLDivElement>(null);
    const swipeState = useRef<SwipeState>({
        isDragging: false,
        startY: 0,
        currentY: 0,
        startX: 0
    });

    useEffect(() => {
        const dragElement = dragRef.current;
        if (!dragElement) return;

        const sheet = dragElement.closest('[data-bottom-sheet]') as HTMLElement;

        // Reset transform when opening/closing to prevent stuck state
        if (sheet) {
            if (isOpen) {
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
        }

        if (!isOpen) return;

        const handleTouchStart = (e: TouchEvent) => {
            swipeState.current = {
                isDragging: true,
                startY: e.touches[0].clientY,
                currentY: e.touches[0].clientY,
                startX: e.touches[0].clientX
            };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!swipeState.current.isDragging) return;

            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = currentY - swipeState.current.startY;
            const deltaX = currentX - swipeState.current.startX;

            // Check if the sheet content is scrolled to top
            const scrollableContent = dragElement.querySelector('[data-scrollable]') as HTMLElement;
            const isAtTop = !scrollableContent || scrollableContent.scrollTop <= 0;

            // Only allow downward swipes when at top and moving more vertically than horizontally
            if (deltaY > 5 && Math.abs(deltaY) > Math.abs(deltaX) && isAtTop) {
                swipeState.current.currentY = currentY;

                // Prevent default scroll behavior
                e.preventDefault();

                // Apply transform to bottom sheet
                if (sheet) {
                    sheet.style.transform = `translateY(${deltaY}px)`;
                    sheet.style.transition = 'none';
                }
            }
        };

        const handleTouchEnd = () => {
            if (!swipeState.current.isDragging) return;

            const deltaY = swipeState.current.currentY - swipeState.current.startY;

            if (deltaY > threshold) {
                // Dismiss the sheet
                if (sheet) {
                    sheet.style.transition = 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    sheet.style.transform = 'translateY(100%)';
                }
                // Small delay to let animation complete
                setTimeout(() => {
                    onClose();
                    // Reset styles after close
                    if (sheet) {
                        sheet.style.transform = '';
                        sheet.style.transition = '';
                    }
                }, 300);
            } else {
                // Snap back to open position
                if (sheet) {
                    sheet.style.transition = 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    sheet.style.transform = '';
                }
            }

            swipeState.current.isDragging = false;
        };

        dragElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        dragElement.addEventListener('touchmove', handleTouchMove, { passive: false }); // passive: false to allow preventDefault
        dragElement.addEventListener('touchend', handleTouchEnd);

        return () => {
            dragElement.removeEventListener('touchstart', handleTouchStart);
            dragElement.removeEventListener('touchmove', handleTouchMove);
            dragElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isOpen, onClose, threshold]);

    return dragRef;
}
