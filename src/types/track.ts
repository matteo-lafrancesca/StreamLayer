import type { Artist } from './artist';
import type { Genre } from './genre';
import type { Label } from './label';
import type { Rights } from './rights';

export interface Track {
    id: number;
    isrc: string;
    title: string;
    subtitle: string;
    volume: number;
    pos: number;
    release_date: string;
    p_line: string;
    duration: number;
    id_album: number;
    artists: Artist[];
    genre: Genre;
    label: Label;
    rights: Rights;
    explicit: boolean;
}

