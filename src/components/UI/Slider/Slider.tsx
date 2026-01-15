import { useSlider } from '../../../hooks/useSlider';
import styles from './Slider.module.css';

export interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    variant?: 'default' | 'spotify';
    showThumb?: boolean;
    className?: string;
}

/**
 * Composant Slider draggable et cliquable
 * @param value - Valeur actuelle (0-100)
 * @param onChange - Callback appelé lors du changement de valeur
 * @param variant - Variante de couleur ('default' ou 'spotify')
 * @param showThumb - Affiche ou masque le point (thumb)
 * @param className - Classes CSS supplémentaires pour le container
 */
export function Slider({ value, onChange, variant = 'default', showThumb = true, className = '' }: SliderProps) {
    const { ref, handleMouseDown } = useSlider(onChange);

    const fillClasses = [styles.sliderFill, variant === 'spotify' ? styles.spotify : '']
        .filter(Boolean)
        .join(' ');

    const thumbClasses = [styles.sliderThumb, variant === 'spotify' ? styles.spotify : '']
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={ref} className={`${styles.sliderContainer} ${className}`} onMouseDown={handleMouseDown}>
            <div className={styles.sliderTrack}>
                <div className={fillClasses} style={{ width: `${value}%` }}>
                    {showThumb && <div className={thumbClasses} />}
                </div>
            </div>
        </div>
    );
}
