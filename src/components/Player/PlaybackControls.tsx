import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1 } from 'lucide-react';
import { IconButton } from '@components/UI';
import { PLAYER_SIZES } from '@constants/playerSizes';
import styles from '@styles/PlaybackControls.module.css';
import type { PlaybackControlsProps } from '@definitions/player';
import { usePlayerState } from '@context/PlayerContext';

export function PlaybackControls({
    isPlaying,
    onPlayPause,
    onShuffle,
    onPrevious,
    onNext,
    onRepeat,
    variant = 'desktop'
}: PlaybackControlsProps) {
    const { playbackControlsState } = usePlayerState();

    const sizes = variant === 'mobile'
        ? {
            shuffle: PLAYER_SIZES.MOBILE.ICON_SMALL,
            skip: PLAYER_SIZES.MOBILE.ICON_SKIP,
            play: PLAYER_SIZES.MOBILE.PLAY_BUTTON,
            repeat: PLAYER_SIZES.MOBILE.ICON_SMALL
        }
        : {
            shuffle: 18,
            skip: 20,
            play: 24,
            repeat: 18
        };

    return (
        <div className={`${styles.playbackControls} ${variant === 'mobile' ? styles.mobile : ''}`}>
            <IconButton
                icon={<Shuffle size={sizes.shuffle} />}
                className={`${styles.controlIconButton} ${playbackControlsState.isShuffled ? styles.active : styles.inactive}`}
                title={playbackControlsState.isShuffled ? "Désactiver l'aléatoire" : "Activer l'aléatoire"}
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
                icon={playbackControlsState.repeatMode === 'one' ? <Repeat1 size={sizes.repeat} /> : <Repeat size={sizes.repeat} />}
                className={`${styles.controlIconButton} ${playbackControlsState.repeatMode !== 'off' ? styles.active : styles.inactive}`}
                title={
                    playbackControlsState.repeatMode === 'off' ? 'Activer la répétition' :
                        playbackControlsState.repeatMode === 'all' ? 'Répéter le titre' :
                            'Désactiver la répétition'
                }
                onClick={onRepeat}
                style={{ position: 'relative' }}
                enlargeHitbox
            />
        </div>
    );
}
