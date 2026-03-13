import { useEffect } from 'react';
import { usePlayerState, usePlayerActions } from '@context/PlayerContext';
import { useVolumeControl } from '@hooks/Audio/useVolumeControl';
import { useSeekableProgress } from '@hooks/Player/useSeekableProgress';

/**
 * Hook pour gérer les raccourcis clavier globaux du lecteur.
 */
export function useKeyboardShortcuts() {
    const { isPlaying, volume } = usePlayerState();
    const { setIsPlaying, setVolume, playbackControlsActions } = usePlayerActions();
    const { toggleMute } = useVolumeControl(volume, setVolume);
    const { handleSeekChange, progress } = useSeekableProgress();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ne pas activer si l'utilisateur écrit dans un champ
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.isContentEditable
            ) {
                return;
            }

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    setIsPlaying(!isPlaying);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'ArrowLeft':
                    // Reculer de 5%
                    e.preventDefault();
                    handleSeekChange(Math.max(0, progress - 5));
                    break;
                case 'ArrowRight':
                    // Avancer de 5%
                    e.preventDefault();
                    handleSeekChange(Math.min(100, progress + 5));
                    break;
                case 'KeyL':
                    e.preventDefault();
                    playbackControlsActions.onNext();
                    break;
                case 'KeyK':
                    e.preventDefault();
                    playbackControlsActions.onPrevious();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, volume, setIsPlaying, toggleMute, handleSeekChange, progress, playbackControlsActions]);
}
