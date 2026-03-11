/**
 * Définitions liées aux statistiques et au reporting d'écoute.
 */

/** Statut d'un événement de lecture */
export type ReportingStatus = 'started' | 'resume' | 'paused' | 'stopped';

/** Élément de statistique envoyé à l'API */
export interface StatItem {
    id: number;
    container_type: 'list' | 'album' | 'track';
    id_container: number;
    full: boolean;
    creation_datetime: number;
    device_type: 'web' | 'mobile';
    online: boolean;
    status: ReportingStatus;
    /** Durée cumulée d'écoute réelle en secondes */
    time: number;
    /** Position actuelle de la tête de lecture en secondes */
    current_position: number;
    play_mode: 'online' | 'offline';
    format: 'low' | 'high';
    territory_code: string;
}
