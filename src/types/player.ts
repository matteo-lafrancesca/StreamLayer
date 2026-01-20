/**
 * Type definitions for Player components
 */

/**
 * MediaBar props for Desktop - includes isExpanded state
 */
export interface MediaBarDesktopProps {
    isExpanded: boolean;
    onExpandToggle: () => void;
}

/**
 * MediaBar props for Mobile - only needs onExpandToggle
 */
export interface MediaBarMobileProps {
    onExpandToggle: () => void;
}

/**
 * @deprecated Use MediaBarDesktopProps or MediaBarMobileProps instead
 * Generic MediaBar props - kept for backwards compatibility
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PlaylistViewProps {
    // Reserved for future props
}

export interface ProjectViewProps {
    onPlaylistSelect: () => void;
}

// Type alias for image sizes (maps to CoverSize in covers API)
export type ImageSize = 's' | 'm' | 'l';
