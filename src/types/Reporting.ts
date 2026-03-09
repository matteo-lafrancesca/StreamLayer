export type ReportingStatus = 'started' | 'paused' | 'resume' | 'stopped';

export interface StatItem {
    id: number;
    container_type: 'list' | 'album' | 'search' | 'library';
    id_container: number;
    full: boolean;
    creation_datetime: number;
    device_type?: 'web' | 'mobile';
    online?: boolean;
    status: ReportingStatus;
    time: number;
    format?: 'low' | 'high';
    current_position: number;
    play_mode?: 'online' | 'offline';
    territory_code?: string;
}

export interface ReportPayload {
    items: StatItem[];
}
