import { useAlbumCover } from '@hooks/useAlbumCover';
import { usePlaylistCover } from '@hooks/usePlaylistCover';
import type { ImageSize } from '@definitions/player';

interface AuthenticatedImageProps {
    alt: string;
    style?: React.CSSProperties;
    className?: string;
    type: 'album' | 'playlist';
    id: number;
    size?: ImageSize;
}

/**
 * Composant Image qui charge les images avec authentification Bearer token
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

    const blobUrl = type === 'album' ? albumBlobUrl : playlistBlobUrl;

    if (!blobUrl) {
        // Placeholder pendant le chargement
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

