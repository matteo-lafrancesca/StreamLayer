export type ReportingStatus = 'started' | 'paused' | 'resume' | 'stopped';

export interface StatItem {
    id: number;
    container_type: 'list' | 'album' | 'search' | 'library'; // Context
    id_container: number;
    full: boolean;
    creation_datetime: number; // UNIX timestamp in SECONDS
    device_type?: 'web' | 'mobile'; // Automatically resolved via Capacitor
    online?: boolean; // Dynamically uses navigator.onLine
    status: ReportingStatus;
    time: number; // Duration listened / Position
    format?: 'low' | 'high'; // Can be stripped, infer from backend
    current_position: number;
    play_mode?: 'online' | 'offline'; // Automatically resolved via navigator.onLine
    territory_code?: string; // Can be stripped, infer from GeoIP
}

export interface ReportPayload {
    items: StatItem[];
}
