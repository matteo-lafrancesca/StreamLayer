import type { Track } from '@definitions/track';
import { getAlbumCoverUrl, type CoverSize } from '@services/api/covers';
import { formatDuration } from './time';

/**
 * Gets full artist names for a track.
 * @param track - Track object.
 * @returns Comma-separated artist names.
 */
export function getTrackArtistsNames(track: Track): string {
    return track.artists.map(artist => artist.name).join(', ');
}

/**
 * Gets first artist of a track.
 * @param track - Track object.
 * @returns First artist name.
 */
export function getTrackMainArtist(track: Track): string {
    return track.artists[0]?.name || 'Artiste inconnu';
}

/**
 * Gets track cover URL (via album).
 * @param track - Track object.
 * @param size - Cover size.
 * @returns Cover URL.
 */
export function getTrackCoverUrl(track: Track, size: CoverSize = 'm'): string {
    return getAlbumCoverUrl(track.id_album, size);
}

/**
 * Gets track display info.
 * @param track - Track object.
 * @param coverSize - Cover size.
 * @returns Formatted info object.
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
        // albumName: track.album?.name || 'Unknown Album', // To add when available
    };
}

