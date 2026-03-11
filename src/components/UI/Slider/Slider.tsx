import { useState, useCallback } from 'react';
import { useSlider } from '@hooks/UI/useSlider';
import styles from './Slider.module.css';

export interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    variant?: 'default' | 'spotify' | 'thin';
    showThumb?: boolean;
    className?: string;
    onDragStart?: (value: number) => void;
    onDragEnd?: (value: number) => void;
}

/**
 * Composant Slider interactif (glissière).
 * Implémente une UI optimiste pour éviter les latences pendant le drag.
 */
export function Slider({ value, onChange, variant = 'default', showThumb = true, className = '', onDragStart, onDragEnd }: SliderProps) {
    const [localValue, setLocalValue] = useState(value);

    const handleSliderChange = useCallback((newValue: number) => {
        setLocalValue(newValue);
        onChange(newValue);
    }, [onChange]);

    const { ref, handleMouseDown, handleTouchStart, isDragging } = useSlider(handleSliderChange, onDragStart, onDragEnd);

    if (!isDragging && localValue !== value) {
        setLocalValue(value);
    }

    const fillClasses = `
        ${styles.sliderFill} 
        ${variant === 'spotify' ? styles.spotify : ''} 
        ${variant === 'thin' ? styles.thin : ''}
    `.trim().replace(/\s+/g, ' ');

    const thumbClasses = `
        ${styles.sliderThumb} 
        ${variant === 'spotify' ? styles.spotify : ''}
    `.trim().replace(/\s+/g, ' ');

    const containerClasses = `
        ${styles.sliderContainer} 
        ${variant === 'thin' ? styles.thinContainer : ''} 
        ${className}
    `.trim().replace(/\s+/g, ' ');

    const trackClasses = `
        ${styles.sliderTrack} 
        ${variant === 'thin' ? styles.thinTrack : ''}
    `.trim().replace(/\s+/g, ' ');

    return (
        <div
            ref={ref}
            className={containerClasses}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            <div className={trackClasses}>
                <div className={fillClasses} style={{ width: `${localValue}%` }}>
                    {showThumb && <div className={thumbClasses} />}
                </div>
            </div>
        </div>
    );
}

