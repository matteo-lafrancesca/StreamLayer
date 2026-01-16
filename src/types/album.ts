import type { Artist } from './artist';
import type { Genre } from './genre';
import type { Label } from './label';
import type { Rights } from './rights';

export interface Album {
    id: number;
    title: string;
    subtitle: string | null;
    icpn: string;
    duration: number;
    release_date: string;
    type: string;
    parental_warning_type: string | null;
    c_line: string;
    p_line: string;
    nb_tracks: number;
    genre: Genre;
    label: Label;
    artists: Artist[];
    rights: Rights;
}

