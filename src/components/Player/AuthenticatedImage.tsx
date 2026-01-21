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
    const [imageLoaded, setImageLoaded] = useState(false);

    const blobUrl = type === 'album' ? albumBlobUrl : playlistBlobUrl;

    // Précharger l'image avant de la rendre dans le DOM
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

