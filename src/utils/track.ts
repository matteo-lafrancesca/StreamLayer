import type { Track } from '../types/track';
import { getAlbumCoverUrl, type CoverSize } from '../services/api/covers';
import { formatDuration } from './time';

/**
 * Récupère le nom complet des artistes d'une track
 * @param track - La track
 * @returns Noms des artistes séparés par des virgules
 */
export function getTrackArtistsNames(track: Track): string {
    return track.artists.map(artist => artist.name).join(', ');
}

/**
 * Récupère le premier artiste d'une track
 * @param track - La track
 * @returns Nom du premier artiste
 */
export function getTrackMainArtist(track: Track): string {
    return track.artists[0]?.name || 'Artiste inconnu';
}

/**
 * Récupère l'URL de la cover d'une track (via son album)
 * @param track - La track
 * @param size - Taille de la cover
 * @returns URL de la cover
 */
export function getTrackCoverUrl(track: Track, size: CoverSize = 'm'): string {
    return getAlbumCoverUrl(track.id_album, size);
}

/**
 * Récupère les informations d'affichage d'une track
 * @param track - La track
 * @param coverSize - Taille de la cover
 * @returns Objet avec les infos formatées
 */
export function getTrackDisplayInfo(track: Track, coverSize: CoverSize = 'm') {
    return {
        id: track.id,
        title: track.title,
        artist: getTrackMainArtist(track),
        allArtists: getTrackArtistsNames(track),
        duration: formatDuration(track.duration),
        durationSeconds: track.duration,
        coverUrl: getTrackCoverUrl(track, coverSize),
        albumId: track.id_album,
        // albumName: track.album?.name || 'Album inconnu', // À ajouter quand disponible
    };
}
