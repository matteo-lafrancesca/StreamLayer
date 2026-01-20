import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1 } from 'lucide-react';
import { IconButton } from '@components/UI';
import styles from '@styles/PlaybackControls.module.css';
import type { PlaybackControlsProps } from '@definitions/player';
import { usePlayer } from '@context/PlayerContext';

export function PlaybackControls({
    isPlaying,
    onPlayPause,
    onShuffle,
    onPrevious,
    onNext,
    onRepeat,
    variant = 'desktop'
}: PlaybackControlsProps) {
    const { playbackControls } = usePlayer();

    // Icon sizes based on variant
    // Icon sizes based on variant
    const sizes = variant === 'mobile'
        ? { shuffle: 24, skip: 28, play: 30, repeat: 24 }
        : { shuffle: 18, skip: 24, play: 56, repeat: 18 };

    return (
        <div className={`${styles.playbackControls} ${variant === 'mobile' ? styles.mobile : ''}`}>
            <IconButton
                icon={<Shuffle size={sizes.shuffle} />}
                className={`${styles.controlIconButton} ${playbackControls.isShuffled ? styles.active : styles.inactive}`}
                title={playbackControls.isShuffled ? "Désactiver l'aléatoire" : "Activer l'aléatoire"}
                onClick={onShuffle}
                enlargeHitbox
            />
            <IconButton
                icon={<SkipBack size={sizes.skip} />}
                className={styles.controlIconButton}
                title="Précédent"
                onClick={onPrevious}
                enlargeHitbox
            />
            <IconButton
                icon={isPlaying ? <Pause size={sizes.play} strokeWidth={2.5} /> : <Play size={sizes.play} strokeWidth={2.5} />}
                className={styles.playPauseButton}
                onClick={onPlayPause}
                title={isPlaying ? "Pause" : "Lecture"}
                enlargeHitbox
            />
            <IconButton
                icon={<SkipForward size={sizes.skip} />}
                className={styles.controlIconButton}
                title="Suivant"
                onClick={onNext}
                enlargeHitbox
            />
            <IconButton
                icon={playbackControls.repeatMode === 'one' ? <Repeat1 size={sizes.repeat} /> : <Repeat size={sizes.repeat} />}
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

