import { type CoverSize } from '@services/api/covers';

export type { ThemeConfig } from './theme';

/**
 * Définitions de types pour les composants du Player.
 */

/** Propriétés de la barre média Bureau */
export interface MediaBarDesktopProps {
    isExpanded: boolean;
    onExpandToggle: () => void;
}

/** Propriétés de la barre média Mobile */
export interface MediaBarMobileProps {
    onExpandToggle: () => void;
}

/** Propriétés des contrôles de lecture */
export interface PlaybackControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
    variant?: 'desktop' | 'mobile';
}

/** Propriétés de la barre de progression */
export interface ProgressBarProps {
    progress: number;
    currentTime: string;
    duration: string;
    onProgressChange: (progress: number) => void;
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

/** Propriétés du contrôle de volume */
export interface VolumeControlProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
}

/** Propriétés du texte défilant */
export interface ScrollingTextProps {
    text: string;
    className?: string;
    speed?: number;
}

/** Alias pour la taille des couvertures */
export type ImageSize = CoverSize;
