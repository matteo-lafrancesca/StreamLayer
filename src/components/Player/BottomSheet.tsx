import type { ReactNode } from 'react';
import { useSwipeToDismiss } from '@hooks/useSwipeToDismiss';
import { ChevronDown } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/BottomSheet.module.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    showChevron?: boolean; // Show chevron (for track view) or drag bar (for other views)
}

/**
 * BottomSheet Component
 * A full-screen overlay that slides up from the bottom of the screen
 * Supports swipe-to-dismiss from anywhere and click-to-close
 */
export function BottomSheet({ isOpen, onClose, children, showChevron = true }: BottomSheetProps) {
    const dragRef = useSwipeToDismiss({ isOpen, onClose, threshold: PLAYER_SIZES.SWIPE_THRESHOLD });

    return (
        <>
            {/* Backdrop */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`${styles.bottomSheet} ${isOpen ? styles.bottomSheetOpen : ''}`}
                data-bottom-sheet
            >
                {/* Header - Chevron for track view, drag bar for others */}
                <div
                    className={styles.dragHandle}
                    onClick={showChevron ? onClose : undefined}
                    style={{ cursor: showChevron ? 'pointer' : 'default' }}
                >
                    {showChevron ? (
                        <ChevronDown size={PLAYER_SIZES.MOBILE.CHEVRON} className={styles.chevronIcon} />
                    ) : (
                        <div className={styles.dragIndicator} />
                    )}
                </div>

                {/* Swipeable Content Area */}
                <div ref={dragRef} className={styles.swipeableContent}>
                    {children}
                </div>
            </div>
        </>
    );
}
