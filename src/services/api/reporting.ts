import { apiFetch } from './client';
import { Logger } from '@utils/system';
import type { StatItem } from '@definitions/reporting';

export async function sendStats(items: StatItem[]): Promise<void> {
    if (items.length === 0) return;

    try {
        await apiFetch('/stats', {
            method: 'POST',
            body: JSON.stringify({ items }),
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        Logger.error('[Reporting] Failed to send stats:', error);
        throw error;
    }
}
