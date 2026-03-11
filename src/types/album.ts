import { type Artist, type Genre, type Label, type Rights } from './metadata';

/**
 * Représente un album musical.
 */
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
