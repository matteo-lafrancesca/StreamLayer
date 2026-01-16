import { useSlider } from '../../../hooks/useSlider';
import styles from './Slider.module.css';

export interface SliderProps {
    value: number;
    onChange: (value: number) => void;
    variant?: 'default' | 'spotify' | 'thin';
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
                <div className={fillClasses} style={{ width: `${value}%` }}>
                    {showThumb && <div className={thumbClasses} />}
                </div>
            </div>
        </div>
    );
}
