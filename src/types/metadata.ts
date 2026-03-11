/**
 * Définitions des métadonnées liées aux artistes, genres, labels et droits.
 */

/**
 * Représente un artiste.
 */
export interface Artist {
    id: number;
    name: string;
}

/**
 * Représente un genre musical.
 */
export interface Genre {
    id: number;
    title: string;
}

/**
 * Représente un groupe de sociétés (pour les labels).
 */
export interface CompanyGroup {
    id: number;
    name: string;
    group: {
        id: number;
        name: string;
    };
}

/**
 * Représente un label discographique.
 */
export interface Label {
    id: number;
    name: string;
    company_group: CompanyGroup;
}

/**
 * Représente les droits d'utilisation d'une piste.
 */
export interface Rights {
    download: boolean;
    stream: boolean;
    offline: boolean;
}

/** Configuration du thème pour surcharger les couleurs */
export interface ThemeConfig {
    primary?: string;
    secondary?: string;
}
