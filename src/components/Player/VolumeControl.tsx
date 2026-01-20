import { Volume2, VolumeX } from 'lucide-react';
import { Slider, IconButton } from '@components/UI';
import { useVolumeControl } from '@hooks/useVolumeControl';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/VolumeControl.module.css';
import type { VolumeControlProps } from '@definitions/player';

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
    const { isMuted, toggleMute, setVolume: handleVolumeChange } = useVolumeControl(volume, onVolumeChange);

    const displayMuted = isMuted || volume === 0;

    return (
        <div className={styles.volumeSection}>
            <IconButton
                icon={displayMuted
                    ? <VolumeX size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />
                    : <Volume2 size={PLAYER_SIZES.DESKTOP.ICON_MEDIUM} />
                }
                onClick={toggleMute}
                className={styles.volumeIcon}
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
