import { AuthenticatedImage } from '@components/Player/AuthenticatedImage';

import { type CoverSize } from '@services/api/covers';

interface AlbumCoverOrPlaceholderProps {
    track?: { id_album: number } | null;
    size: CoverSize;
    className?: string;
}

/**
 * Displays album cover if track exists, otherwise shows placeholder.
 */
export function AlbumCoverOrPlaceholder({ track, size, className }: AlbumCoverOrPlaceholderProps) {
    if (!track) {
        return (
            <img
                src="/img/placeholder.png"
                alt="Album cover"
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
