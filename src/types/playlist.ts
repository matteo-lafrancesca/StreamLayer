import type { Track } from './track';

export interface User {
    id: string;
    login: string;
}

export interface ItemType {
    id: number;
    name: string;
}

export interface PlaylistType {
    id: number;
    name: string;
    item_type: ItemType;
}

export interface PlaylistMetadata {
    title: string;
    description: string;
}

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

export interface PaginatedResponse<T> {
    limit: number;
    offset: number;
    count_item: number;
    next_link: string | null;
    prev_link: string | null;
    direct_link: string;
    items: T[];
}

export type PlaylistsResponse = PaginatedResponse<Playlist>;
export type PlaylistTracksResponse = PaginatedResponse<Track>;
