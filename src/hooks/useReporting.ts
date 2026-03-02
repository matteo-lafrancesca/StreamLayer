import { useRef, useEffect, useCallback } from 'react';
import type { StatItem } from '@definitions/../types/Reporting';
import { sendStats } from '@services/api/reporting';

const FLUSH_INTERVAL = 30000; // 30 seconds
const MAX_BATCH_SIZE = 50;
const MAX_FAILED_BATCH_SIZE = 200;

export function useReporting() {
    // Use a ref for the queue to access it in intervals/effects without dependency issues
    const queueRef = useRef<StatItem[]>([]);

    // We might want to persist failed items, but for now we keep it simple in-memory

    const flush = useCallback(async () => {
        const items = [...queueRef.current];
        if (items.length === 0) return;

        // Clear queue immediately (optimistic)
        queueRef.current = [];

        try {
            console.log(`[Reporting] Flushing ${items.length} items`, items);
            await sendStats(items);
        } catch (error) {
            console.error('[Reporting] Flush failed, re-queuing items', error);
            // Re-queue items with a cap to prevent infinite memory growth if offline forever
            const combined = [...items, ...queueRef.current];
            queueRef.current = combined.slice(0, MAX_FAILED_BATCH_SIZE);
        }
    }, []);

    const trackEvent = useCallback((item: StatItem) => {
        console.log('[Reporting] Track event:', item);
        queueRef.current.push(item);

        if (queueRef.current.length >= MAX_BATCH_SIZE) {
            flush();
        }
    }, [flush]);

    // Flush periodically
    useEffect(() => {
        const interval = setInterval(flush, FLUSH_INTERVAL);
        return () => {
            clearInterval(interval);
            // Flush on unmount
            flush();
        };
    }, [flush]);

    // Flush on visibility change (e.g. user leaves tab/app)
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
