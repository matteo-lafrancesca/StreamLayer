import type { Album } from '@definitions/album';
import { getAlbumCoverUrl, type CoverSize } from '../services/api/covers';

/**
 * Récupère le titre d'un album
 * @param album - L'album
 * @returns Titre de l'album
 */
export function getAlbumTitle(album: Album): string {
    return album.title || 'Album inconnu';
}

/**
 * Récupère le nom des artistes d'un album
 * @param album - L'album
 * @returns Noms des artistes séparés par des virgules
 */
export function getAlbumArtistsNames(album: Album): string {
    return album.artists.map(artist => artist.name).join(', ');
}

/**
 * Récupère l'URL de la cover d'un album
 * @param album - L'album
 * @param size - Taille de la cover
 * @returns URL de la cover
 */
export function getAlbumCover(album: Album, size: CoverSize = 'm'): string {
    return getAlbumCoverUrl(album.id, size);
}

/**
 * Récupère les informations d'affichage d'un album
 * @param album - L'album
 * @param coverSize - Taille de la cover
 * @returns Objet avec les infos formatées
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

