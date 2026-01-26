import { useState, useEffect } from 'react';
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
    const [imageLoaded, setImageLoaded] = useState(false);

    const blobUrl = type === 'album' ? albumBlobUrl : playlistBlobUrl;

    // Preload image before rendering in DOM
    useEffect(() => {
        if (!blobUrl) {
            setImageLoaded(false);
            return;
        }

        const img = new Image();
        img.onload = () => setImageLoaded(true);
        img.src = blobUrl;
    }, [blobUrl]);

    if (!blobUrl || !imageLoaded) {
        // Placeholder during loading
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

