import { useRef, useEffect, useCallback } from 'react';
import type { StatItem } from '@definitions/../types/Reporting';
import { sendStats } from '@services/api/reporting';
import { Logger } from '@utils/logger';
import { persistentCache } from '@cache/PersistentCache';
import { ConfigManager } from '../config/ConfigManager';

const FLUSH_INTERVAL = 30000;
const MAX_BATCH_SIZE = 50;
const OFFLINE_QUEUE_KEY = () => `reporting-queue-${ConfigManager.getConfig().apiBaseUrl}`;

export function useReporting() {
    const queueRef = useRef<StatItem[]>([]);

    useEffect(() => {
        async function loadOffline() {
            if (!ConfigManager.isInitialized()) return;
            try {
                const saved = await persistentCache.get<StatItem[]>('data', OFFLINE_QUEUE_KEY());
                if (saved && saved.length > 0) {
                    queueRef.current = [...queueRef.current, ...saved];
                }
            } catch (err) {
                Logger.error('[Reporting] Failed to load offline queue', err);
            }
        }
        loadOffline();
    }, []);

    const flush = useCallback(async () => {
        const items = [...queueRef.current];
        if (items.length === 0) return;

        queueRef.current = [];

        try {
            Logger.info(`[Reporting] Flushing ${items.length} items`, items);
            await sendStats(items);
            if (ConfigManager.isInitialized()) {
                await persistentCache.delete('data', OFFLINE_QUEUE_KEY());
            }
        } catch (error) {
            Logger.error('[Reporting] Flush failed, re-queuing items', error);
            const combined = [...items, ...queueRef.current];
            queueRef.current = combined;
            if (ConfigManager.isInitialized()) {
                persistentCache.set('data', OFFLINE_QUEUE_KEY(), queueRef.current);
            }
        }
    }, []);

    const trackEvent = useCallback((item: StatItem) => {
        Logger.info('[Reporting] Track event:', item);
        queueRef.current.push(item);

        if (queueRef.current.length >= MAX_BATCH_SIZE) {
            flush();
        }
    }, [flush]);

    useEffect(() => {
        const interval = setInterval(flush, FLUSH_INTERVAL);
        return () => {
            clearInterval(interval);
            flush();
        };
    }, [flush]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                flush();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [flush]);

    return { trackEvent };
}
