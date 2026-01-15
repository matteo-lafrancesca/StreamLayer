/**
 * Type definitions for Player components
 */

export interface MediaBarProps {
    isExpanded: boolean;
    onExpandToggle: () => void;
}

export interface PlaybackControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onShuffle?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onRepeat?: () => void;
}

export interface ProgressBarProps {
    progress: number;
    currentTime: string;
    duration: string;
    onProgressChange: (progress: number) => void;
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
