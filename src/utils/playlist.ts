import type { Playlist } from '@definitions/playlist';
import { getPlaylistCoverUrl, type CoverSize } from '@services/api/covers';

/**
 * Gets playlist display info.
 * @param playlist - Playlist object.
 * @param coverSize - Cover size.
 * @returns Formatted info object.
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
 * Gets playlist title.
 * @param playlist - Playlist object.
 * @returns Playlist title.
 */
export function getPlaylistTitle(playlist: Playlist): string {
    return playlist.metadata.title || 'Playlist sans titre';
}

/**
 * Gets playlist cover URL.
 * @param playlist - Playlist object.
 * @param size - Cover size.
 * @returns Cover URL.
 */
export function getPlaylistCover(playlist: Playlist, size: CoverSize = 'm'): string {
    return getPlaylistCoverUrl(playlist.id, size);
}

