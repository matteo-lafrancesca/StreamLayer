import type { Track } from './track';
import type { PaginatedResponse } from './api';

/**
 * Représente un utilisateur (propriétaire de playlist).
 */
export interface User {
    id: string;
    login: string;
}

/**
 * Type d'élément dans une playlist.
 */
export interface ItemType {
    id: number;
    name: string;
}

/**
 * Type de playlist.
 */
export interface PlaylistType {
    id: number;
    name: string;
    item_type: ItemType;
}

/**
 * Métadonnées descriptives d'une playlist.
 */
export interface PlaylistMetadata {
    title: string;
    description: string;
}

/**
 * Représente une playlist.
 */
export interface Playlist {
    id: number;
    start_date: string;
    end_date: string;
    public: boolean;
    type: PlaylistType;
    nb_items: number;
    lastupdate_datetime: string;
    user: User;
    first_item: Track;
    metadata: PlaylistMetadata;
}

/** Réponses paginées spécifiques */
export type PlaylistsResponse = PaginatedResponse<Playlist>;
export type PlaylistTracksResponse = PaginatedResponse<Track>;
