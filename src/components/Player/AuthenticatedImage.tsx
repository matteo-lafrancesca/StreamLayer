import { useAlbumCover } from '@hooks/useAlbumCover';
import { usePlaylistCover } from '@hooks/usePlaylistCover';
import { type CoverSize } from '@services/api/covers';

interface AuthenticatedImageProps {
    alt: string;
    style?: React.CSSProperties;
    className?: string;
    type: 'album' | 'playlist';
    id: number;
    size?: CoverSize;
}

/**
 * Image component loading images with Bearer token authentication.
 */
export function AuthenticatedImage({
    alt,
    style,
    className,
    type,
    id,
    size = 'm',
}: AuthenticatedImageProps) {
    const albumBlobUrl = useAlbumCover(type === 'album' ? id : null, size);
    const playlistBlobUrl = usePlaylistCover(type === 'playlist' ? id : null, size);

    // Use whichever blob is active
    const blobUrl = type === 'album' ? albumBlobUrl : playlistBlobUrl;

    if (!blobUrl) {
        // Placeholder waiting for cache/fetch
        return (
            <img
                src="/img/placeholder.png"
                alt={alt}
                style={style}
                className={className}
            />
        );
    }

    return <img src={blobUrl} alt={alt} style={style} className={className} />;
}

