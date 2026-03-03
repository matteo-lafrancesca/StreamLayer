/**
 * Type definitions for Player components
 */

/**
 * MediaBar props for Desktop (includes isExpanded).
 */
export interface MediaBarDesktopProps {
    isExpanded: boolean;
    onExpandToggle: () => void;
}

/**
 * MediaBar props for Mobile.
 */
export interface MediaBarMobileProps {
    onExpandToggle: () => void;
}

/**
 * @deprecated Use MediaBarDesktopProps or MediaBarMobileProps instead
 * Generic MediaBar props (backwards compatibility).
 */
export type MediaBarProps = MediaBarDesktopProps;

export interface PlaybackControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onShuffle: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onRepeat: () => void;
    variant?: 'desktop' | 'mobile';
}

export interface ProgressBarProps {
    progress: number;
    currentTime: string;
    duration: string;
    onProgressChange: (progress: number) => void;
    onSeekStart?: () => void;
    onSeekEnd?: () => void;
}

export interface VolumeControlProps {
    volume: number;
    onVolumeChange: (volume: number) => void;
}

export interface ScrollingTextProps {
    text: string;
    className?: string;
    speed?: number;
}

export interface PlaylistViewProps {
}

export interface ProjectViewProps {
    onPlaylistSelect: () => void;
}

import { type CoverSize } from '@services/api/covers';

export type ImageSize = CoverSize;
