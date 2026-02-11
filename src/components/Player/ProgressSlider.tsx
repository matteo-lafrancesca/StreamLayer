import { Slider } from '@components/UI';
import { useSeekableProgress } from '@hooks/useSeekableProgress';
import sharedStyles from '@styles/PlayerShared.module.css';

interface ProgressSliderProps {
    interactive?: boolean;
}

/**
 * Reusable progress slider for Desktop/Mobile.
 * @param interactive - Whether slider responds to input (default: true).
 */
export function ProgressSlider({ interactive = true }: ProgressSliderProps) {
    const {
        progress,
        isDragging,
        dragProgress,
        handleSeekStart,
        handleSeekChange,
        handleSeekEnd
    } = useSeekableProgress(interactive);

    return (
        <div className={sharedStyles.progressSlider}>
            <Slider
                value={isDragging ? dragProgress : progress}
                onChange={handleSeekChange}
                showThumb={false}
                variant="thin"
                onDragStart={handleSeekStart}
                onDragEnd={handleSeekEnd}
            />
        </div>
    );
}
