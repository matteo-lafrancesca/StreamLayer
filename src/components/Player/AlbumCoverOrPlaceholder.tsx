import { AuthenticatedImage } from '@components/AuthenticatedImage/AuthenticatedImage';

interface AlbumCoverOrPlaceholderProps {
    track?: { id_album: number } | null;
    size: 's' | 'm' | 'l';
    className?: string;
}

/**
 * AlbumCoverOrPlaceholder Component
 * Displays album cover if track exists, otherwise shows placeholder
 * Eliminates duplication across TrackDisplay, CompactMediaBar, TrackViewMobile
 */
export function AlbumCoverOrPlaceholder({ track, size, className }: AlbumCoverOrPlaceholderProps) {
    if (!track) {
        return (
            <img
                src="/img/placeholder.png"
                alt="No track"
                className={className}
            />
        );
    }

    return (
        <AuthenticatedImage
            type="album"
            id={track.id_album}
            size={size}
            alt="Album cover"
            className={className}
        />
    );
}
