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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            handleSliderChange(Math.min(100, localValue + 5));
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            handleSliderChange(Math.max(0, localValue - 5));
        } else if (e.key === 'Home') {
            e.preventDefault();
            handleSliderChange(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            handleSliderChange(100);
        } else if (e.key === 'PageUp') {
            e.preventDefault();
            handleSliderChange(Math.min(100, localValue + 10));
        } else if (e.key === 'PageDown') {
            e.preventDefault();
            handleSliderChange(Math.max(0, localValue - 10));
        }
    };

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
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(localValue)}
        >
            <div className={trackClasses}>
                <div className={fillClasses} style={{ width: `${localValue}%` }}>
                    {showThumb && <div className={thumbClasses} />}
                </div>
            </div>
        </div>
    );
}

