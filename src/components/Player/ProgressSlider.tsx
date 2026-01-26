import { Slider } from '@components/UI';
import { useTrackProgress } from '@hooks/useTrackProgress';
import sharedStyles from '@styles/PlayerShared.module.css';

interface ProgressSliderProps {
    interactive?: boolean;
}

/**
 * Reusable progress slider for Desktop/Mobile.
 * @param interactive - Whether slider responds to input (default: true).
 */
export function ProgressSlider({ interactive = true }: ProgressSliderProps) {
    const { progress, seek } = useTrackProgress();

    return (
        <div className={sharedStyles.progressSlider}>
            <Slider
                value={progress}
                onChange={interactive ? seek : () => { }}
                showThumb={false}
                variant="thin"
            />
        </div>
    );
}
