import { useRef, useEffect } from 'react';

interface UseSwipeToDismissProps {
    isOpen: boolean;
    onClose: () => void;
    threshold?: number; // Distance threshold to trigger dismiss (in px)
    disabled?: boolean;
}

interface SwipeState {
    isDragging: boolean;
    startY: number;
    currentY: number;
    startX: number;
    lockDirection: 'horizontal' | 'vertical' | null;
}

/**
 * Hook for swipe-to-dismiss gesture on bottom sheet.
 * triggers dismiss when scrolled to top.
 */
export function useSwipeToDismiss({
    isOpen,
    onClose,
    threshold = 150,
    disabled = false
}: UseSwipeToDismissProps) {
    const dragRef = useRef<HTMLDivElement>(null);
    const swipeState = useRef<SwipeState>({
        isDragging: false,
        startY: 0,
        currentY: 0,
        startX: 0,
        lockDirection: null
    });

    useEffect(() => {
        const dragElement = dragRef.current;
        if (!dragElement) return;

        const sheet = dragElement.closest('[data-bottom-sheet]') as HTMLElement;

        if (sheet) {
            if (isOpen) {
                sheet.style.transform = '';
                sheet.style.transition = '';
            }
        }

        if (!isOpen || disabled) return;

        const handleTouchStart = (e: TouchEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-no-swipe="true"]')) {
                return;
            }

            swipeState.current = {
                isDragging: true,
                startY: e.touches[0].clientY,
                currentY: e.touches[0].clientY,
                startX: e.touches[0].clientX,
                lockDirection: null
            };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!swipeState.current.isDragging) return;

            const currentY = e.touches[0].clientY;
            const currentX = e.touches[0].clientX;
            const deltaY = currentY - swipeState.current.startY;
            const deltaX = currentX - swipeState.current.startX;

            if (!swipeState.current.lockDirection) {
                if (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10) {
                    swipeState.current.lockDirection = Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
                } else {
                    return;
                }
            }

            if (swipeState.current.lockDirection === 'horizontal') {
                return;
            }

            const scrollableContent = dragElement.querySelector('[data-scrollable]') as HTMLElement;
            const isAtTop = !scrollableContent || scrollableContent.scrollTop <= 0;

            if (deltaY > 0 && isAtTop) {
                swipeState.current.currentY = currentY;

                e.preventDefault();

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
                if (sheet) {
                    sheet.style.transition = 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    sheet.style.transform = 'translateY(100%)';
                }

                onClose();
            } else {
                if (sheet) {
                    sheet.style.transition = 'transform 300ms cubic-bezier(0.4, 0.0, 0.2, 1)';
                    sheet.style.transform = '';
                }
            }

            swipeState.current.isDragging = false;
        };

        dragElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        dragElement.addEventListener('touchmove', handleTouchMove, { passive: false });
        dragElement.addEventListener('touchend', handleTouchEnd);

        return () => {
            dragElement.removeEventListener('touchstart', handleTouchStart);
            dragElement.removeEventListener('touchmove', handleTouchMove);
            dragElement.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isOpen, onClose, threshold, disabled]);

    return dragRef;
}
