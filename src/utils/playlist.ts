import type { Playlist } from '../types/playlist';
import { getPlaylistCoverUrl, type CoverSize } from '../services/api/covers';

/**
 * Récupère les informations d'affichage d'une playlist
 * @param playlist - La playlist
 * @param coverSize - Taille de la cover
 * @returns Objet avec les infos formatées
 */
export function getPlaylistDisplayInfo(playlist: Playlist, coverSize: CoverSize = 'm') {
    return {
        id: playlist.id,
        title: playlist.metadata.title,
        description: playlist.metadata.description,
        coverUrl: getPlaylistCoverUrl(playlist.id, coverSize),
        nbTracks: playlist.nb_items,
        firstTrack: playlist.first_item,
    };
}

/**
 * Récupère le titre d'une playlist
 * @param playlist - La playlist
 * @returns Titre de la playlist
 */
export function getPlaylistTitle(playlist: Playlist): string {
    return playlist.metadata.title || 'Playlist sans titre';
}

/**
 * Récupère l'URL de la cover d'une playlist
 * @param playlist - La playlist
 * @param size - Taille de la cover
 * @returns URL de la cover
 */
export function getPlaylistCover(playlist: Playlist, size: CoverSize = 'm'): string {
    return getPlaylistCoverUrl(playlist.id, size);
}
