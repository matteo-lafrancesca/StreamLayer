import { Volume2, VolumeX } from 'lucide-react';
import { Slider, IconButton } from '../UI';
import { useVolumeControl } from '../../hooks/useVolumeControl';
import styles from '../../styles/Player.module.css';
import type { VolumeControlProps } from '../../types/player';

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
    const { isMuted, toggleMute, setVolume: handleVolumeChange } = useVolumeControl(volume, onVolumeChange);

    const displayMuted = isMuted || volume === 0;

    return (
        <div className={styles.volumeSection}>
            <IconButton
                icon={displayMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                onClick={toggleMute}
                className={styles.volumeIconNew}
                title={displayMuted ? "Réactiver le son" : "Couper le son"}
            />
            <Slider
                value={volume}
                onChange={handleVolumeChange}
                variant="default"
                showThumb={false}
                className={styles.volumeBarContainer}
            />
        </div>
    );
}
