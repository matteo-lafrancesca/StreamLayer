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
 * Composant Slider draggable et cliquable
 * Imémente une UI optimiste pour éviter les lags lors du drag
 */
export function Slider({ value, onChange, variant = 'default', showThumb = true, className = '', onDragStart, onDragEnd }: SliderProps) {
    // État local pour l'affichage immédiat
    const [localValue, setLocalValue] = useState(value);

    // Wrapper pour mettre à jour l'état local immédiatement ET notifier le parent
    const handleSliderChange = useCallback((newValue: number) => {
        setLocalValue(newValue);
        onChange(newValue);
    }, [onChange]);

    const { ref, handleMouseDown, isDragging } = useSlider(handleSliderChange);

    // Notifier le parent du début/fin du drag
    useEffect(() => {
        if (isDragging) {
            onDragStart?.();
        } else {
            onDragEnd?.();
        }
    }, [isDragging, onDragStart, onDragEnd]);

    // Synchroniser l'état local avec les props, SAUF si l'utilisateur est en train de drag
    // Cela empêche le timer global de faire sauter le curseur pendant qu'on le bouge
    useEffect(() => {
        if (!isDragging) {
            setLocalValue(value);
        }
    }, [value, isDragging]);

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

