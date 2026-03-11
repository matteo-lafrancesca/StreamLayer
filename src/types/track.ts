import { type Artist, type Genre, type Label, type Rights } from './metadata';

/**
 * Représente une piste audio (morceau).
 */
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
