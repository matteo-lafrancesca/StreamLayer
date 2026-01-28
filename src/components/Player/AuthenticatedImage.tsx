import { useAlbumCover } from '@hooks/useAlbumCover';
import { usePlaylistCover } from '@hooks/usePlaylistCover';
import { type CoverSize } from '@services/api/covers';
import placeholderImg from '@assets/placeholder.png';

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

    // Common style to hide alt text
    const imgStyle: React.CSSProperties = {
        ...style,
        color: 'transparent' // Hides alt text in some browsers
    };

    if (!blobUrl) {
        // Placeholder waiting for cache/fetch
        return (
            <img
                src={placeholderImg}
                alt={alt}
                style={imgStyle}
                className={className}
            />
        );
    }

    return <img src={blobUrl} alt={alt} style={imgStyle} className={className} />;
}

