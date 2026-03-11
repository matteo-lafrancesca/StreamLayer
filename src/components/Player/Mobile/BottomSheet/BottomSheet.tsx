import type { ReactNode } from 'react';
import { useSwipeToDismiss } from '@hooks/UI/useSwipeToDismiss';
import { ChevronDown } from 'lucide-react';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    showChevron?: boolean;
    disabled?: boolean;
}

/**
 * Full-screen overlay sliding from bottom.
 * Supports swipe-to-dismiss and click-to-close.
 */
export function BottomSheet({ isOpen, onClose, children, showChevron = true, disabled = false }: BottomSheetProps) {
    const dragRef = useSwipeToDismiss({ isOpen, onClose, threshold: PLAYER_SIZES.SWIPE_THRESHOLD, disabled });

    return (
        <>
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`}
                onClick={onClose}
            />

            <div
                className={`${styles.bottomSheet} ${isOpen ? styles.bottomSheetOpen : ''}`}
                data-bottom-sheet
            >
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

                <div ref={dragRef} className={styles.swipeableContent}>
                    {children}
                </div>
            </div>
        </>
    );
}
