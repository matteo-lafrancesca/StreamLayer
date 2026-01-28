import { useState, useEffect, useCallback } from 'react';
import { useSlider } from '@hooks/useSlider';
import styles from '@styles/Slider.module.css';

export interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    variant?: 'default' | 'spotify' | 'thin';
    showThumb?: boolean;
    className?: string;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

/**
 * Draggable and clickable Slider component.
 * Implements optimistic UI to avoid lag during drag.
 */
export function Slider({ value, onChange, variant = 'default', showThumb = true, className = '', onDragStart, onDragEnd }: SliderProps) {
    // Local state for immediate display
    const [localValue, setLocalValue] = useState(value);

    // Wrapper to update local state immediately AND notify parent
    const handleSliderChange = useCallback((newValue: number) => {
        setLocalValue(newValue);
        onChange(newValue);
    }, [onChange]);

    const { ref, handleMouseDown, isDragging } = useSlider(handleSliderChange);

    // Notify parent of drag start/end
    useEffect(() => {
        if (isDragging) {
            onDragStart?.();
        } else {
            onDragEnd?.();
        }
    }, [isDragging, onDragStart, onDragEnd]);

    // Sync local state with props, UNLESS user is dragging
    // Prevents global timer from jumping cursor during interaction
    // Sync local state with props, UNLESS user is dragging
    // Prevents global timer from jumping cursor during interaction
    // "Update State During Render" pattern to avoid double-render
    if (!isDragging && localValue !== value) {
        setLocalValue(value);
    }

    const fillClasses = [styles.sliderFill, variant === 'spotify' ? styles.spotify : '', variant === 'thin' ? styles.thin : '']
        .filter(Boolean)
        .join(' ');

    const thumbClasses = [styles.sliderThumb, variant === 'spotify' ? styles.spotify : '']
        .filter(Boolean)
        .join(' ');

    const containerClasses = [styles.sliderContainer, variant === 'thin' ? styles.thinContainer : '', className]
        .filter(Boolean)
        .join(' ');

    const trackClasses = [styles.sliderTrack, variant === 'thin' ? styles.thinTrack : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={ref} className={containerClasses} onMouseDown={handleMouseDown}>
            <div className={trackClasses}>
                <div className={fillClasses} style={{ width: `${localValue}%` }}>
                    {showThumb && <div className={thumbClasses} />}
                </div>
            </div>
        </div>
    );
}

