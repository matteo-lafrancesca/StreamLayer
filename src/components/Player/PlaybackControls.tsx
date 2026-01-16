import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1 } from 'lucide-react';
import { IconButton } from '../UI';
import styles from '../../styles/PlaybackControls.module.css';
import type { PlaybackControlsProps } from '../../types/player';
import { usePlayer } from '../../context/PlayerContext';

export function PlaybackControls({
    isPlaying,
    onPlayPause,
    onShuffle,
    onPrevious,
    onNext,
    onRepeat,
}: PlaybackControlsProps) {
    const { playbackControls } = usePlayer();

    return (
        <div className={styles.playbackControls}>
            <IconButton
                icon={<Shuffle size={18} />}
                className={`${styles.controlIconButton} ${playbackControls.isShuffled ? styles.active : styles.inactive}`}
                title={playbackControls.isShuffled ? "Désactiver l'aléatoire" : "Activer l'aléatoire"}
                onClick={onShuffle}
                enlargeHitbox
            />
            <IconButton
                icon={<SkipBack size={20} />}
                className={styles.controlIconButton}
                title="Précédent"
                onClick={onPrevious}
                enlargeHitbox
            />
            <IconButton
                icon={isPlaying ? <Pause size={18} strokeWidth={2.5} /> : <Play size={18} strokeWidth={2.5} />}
                className={styles.playPauseButton}
                onClick={onPlayPause}
                title={isPlaying ? "Pause" : "Lecture"}
                enlargeHitbox
            />
            <IconButton
                icon={<SkipForward size={20} />}
                className={styles.controlIconButton}
                title="Suivant"
                onClick={onNext}
                enlargeHitbox
            />
            <IconButton
                icon={playbackControls.repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                className={`${styles.controlIconButton} ${playbackControls.repeatMode !== 'off' ? styles.active : styles.inactive}`}
                title={
                    playbackControls.repeatMode === 'off' ? 'Activer la répétition' :
                        playbackControls.repeatMode === 'all' ? 'Répéter la piste actuelle' :
                            'Désactiver la répétition'
                }
                onClick={onRepeat}
                style={{ position: 'relative' }}
                enlargeHitbox
            />
        </div>
    );
}
