import { apiFetch } from './client';
import type { ReportPayload, StatItem } from '@definitions/../types/Reporting';

/**
 * Sends a batch of reporting stats to the API.
 */
export async function sendStats(items: StatItem[]): Promise<void> {
    if (items.length === 0) return;

    const payload: ReportPayload = { items };

    try {
        await apiFetch('/stats', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('[Reporting] Failed to send stats:', error);
        throw error;
    }
}
