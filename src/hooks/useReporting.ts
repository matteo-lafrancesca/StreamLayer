import { useRef, useEffect, useCallback } from 'react';
import type { StatItem } from '@definitions/../types/Reporting';
import { sendStats } from '@services/api/reporting';

const FLUSH_INTERVAL = 30000; // 30 seconds
const MAX_BATCH_SIZE = 50;

export function useReporting() {
    // Use a ref for the queue to access it in intervals/effects without dependency issues
    const queueRef = useRef<StatItem[]>([]);

    // We might want to persist failed items, but for now we keep it simple in-memory

    const flush = useCallback(async () => {
        const items = [...queueRef.current];
        if (items.length === 0) return;

        // Clear queue immediately (optimistic)
        // If send fails, we could re-queue them, but keeping it simple for now as per plan
        queueRef.current = [];

        try {
            console.log(`[Reporting] Flushing ${items.length} items`, items);
            await sendStats(items);
        } catch (error) {
            console.error('[Reporting] Flush failed, items lost', error);
            // Re-queue items? For now we accept loss on error until offline mode is properly specified
            // queueRef.current = [...items, ...queueRef.current]; 
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
