import { useScrollingAnimation } from '@hooks/useScrollingAnimation';
import styles from '@styles/ScrollingText.module.css';
import type { ScrollingTextProps } from '@definitions/player';

/**
 * ScrollingText Component
 * Displays text with smooth horizontal scrolling animation when content overflows
 */
export function ScrollingText({ text, className = '', speed = 30 }: ScrollingTextProps) {
    const { shouldScroll, translateX, containerRef, contentRef } = useScrollingAnimation(text, speed);

    return (
        <div
            ref={containerRef}
            className={`${styles.scrollingTextContainer} ${className}`}
        >
            <div
                ref={contentRef}
                className={styles.scrollingTextContent}
                style={{
                    transform: shouldScroll ? `translateX(${translateX}px)` : undefined,
                    transition: 'transform 0.05s linear'
                }}
            >
                {text}
            </div>
        </div>
    );
}
