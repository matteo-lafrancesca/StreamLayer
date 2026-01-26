import type { Album } from '@definitions/album';
import { getAlbumCoverUrl, type CoverSize } from '../services/api/covers';

/**
 * Gets album title.
 * @param album - Album object.
 * @returns Album title.
 */
export function getAlbumTitle(album: Album): string {
    return album.title || 'Album inconnu';
}

/**
 * Gets album artists names.
 * @param album - Album object.
 * @returns Comma-separated artist names.
 */
export function getAlbumArtistsNames(album: Album): string {
    return album.artists.map(artist => artist.name).join(', ');
}

/**
 * Gets album cover URL.
 * @param album - Album object.
 * @param size - Cover size.
 * @returns Cover URL.
 */
export function getAlbumCover(album: Album, size: CoverSize = 'm'): string {
    return getAlbumCoverUrl(album.id, size);
}

/**
 * Gets album display info.
 * @param album - Album object.
 * @param coverSize - Cover size.
 * @returns Formatted info object.
 */
export function getAlbumDisplayInfo(album: Album, coverSize: CoverSize = 'm') {
    return {
        id: album.id,
        title: album.title,
        artists: getAlbumArtistsNames(album),
        coverUrl: getAlbumCover(album, coverSize),
        nbTracks: album.nb_tracks,
        releaseDate: album.release_date,
        genre: album.genre.title,
    };
}

