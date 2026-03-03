import { useCover, type CoverSize } from '@hooks/useCover';
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
    const blobUrl = useCover(type, id, size);

    const imgStyle: React.CSSProperties = {
        ...style,
        color: 'transparent'
    };

    if (!blobUrl) {
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

