import type { Track } from '@definitions/track';
import type { Album } from '@definitions/album';
import type { Playlist } from '@definitions/playlist';
import { getAlbumCoverUrl, getPlaylistCoverUrl, type CoverSize } from '@services/api/covers';

/**
 * Utilitaires liés à l'affichage du lecteur, des pistes, des albums et des playlists.
 */

// --- FORMATAGE DU TEMPS ---

/**
 * Formate une durée en secondes au format mm:ss (ex: 3:45).
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formate une durée au format hh:mm:ss si nécessaire (ex: 1:23:45).
 */
export function formatDurationLong(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Prépare l'affichage du temps écoulé et restant pour le lecteur.
 */
export function formatTimeDisplay(progress: number, trackDuration: number): { currentTime: string; duration: string } {
    if (trackDuration <= 0) {
        return { currentTime: '0:00', duration: '0:00' };
    }

    const currentSeconds = Math.floor((progress / 100) * trackDuration);
    const remainingSeconds = trackDuration - currentSeconds;

    return {
        currentTime: formatDuration(currentSeconds),
        duration: `-${formatDuration(remainingSeconds)}`,
    };
}

/**
 * Calcule et formate la durée totale d'une playlist.
 */
export function formatPlaylistDuration(tracks: Track[]): string {
    if (!tracks || tracks.length === 0) return '0 min';

    const totalSeconds = tracks.reduce((sum, track) => sum + track.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

// --- LOGIQUE DE DOMAINE (PISTES) ---

/** Nom du premier artiste ou repli */
export const getTrackMainArtist = (track: Track) => track.artists[0]?.name || 'Artiste inconnu';

/** Liste de tous les artistes séparés par des virgules */
export const getTrackArtistsNames = (track: Track) => track.artists.map(a => a.name).join(', ');

/** URL de la couverture d'une piste (basée sur son album) */
export const getTrackCoverUrl = (track: Track, size: CoverSize = 'm') => getAlbumCoverUrl(track.id_album, size);

/** Informations formatées pour l'affichage d'une piste */
export function getTrackDisplayInfo(track: Track, coverSize: CoverSize = 'm') {
    return {
        id: track.id,
        title: track.title,
        artist: getTrackMainArtist(track),
        allArtists: getTrackArtistsNames(track),
        duration: formatDuration(track.duration),
        durationSeconds: track.duration,
        coverUrl: getAlbumCoverUrl(track.id_album, coverSize),
        albumId: track.id_album,
    };
}

// --- LOGIQUE DE DOMAINE (ALBUMS) ---

/** Informations formatées pour l'affichage d'un album */
export function getAlbumDisplayInfo(album: Album, coverSize: CoverSize = 'm') {
    return {
        id: album.id,
        title: album.title || 'Album inconnu',
        artists: album.artists.map(a => a.name).join(', '),
        coverUrl: getAlbumCoverUrl(album.id, coverSize),
        nbTracks: album.nb_tracks,
        releaseDate: album.release_date,
        genre: album.genre.title,
    };
}

// --- LOGIQUE DE DOMAINE (PLAYLISTS) ---

/** Informations formatées pour l'affichage d'une playlist */
export function getPlaylistDisplayInfo(playlist: Playlist, coverSize: CoverSize = 'm') {
    return {
        id: playlist.id,
        title: playlist.metadata.title || 'Playlist sans titre',
        description: playlist.metadata.description,
        coverUrl: getPlaylistCoverUrl(playlist.id, coverSize),
        nbTracks: playlist.nb_items,
        firstTrack: playlist.first_item,
    };
}
