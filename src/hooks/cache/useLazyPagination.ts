/**
 * Generic hook for lazy pagination
 * Extracts pagination logic from usePlaylistTracksLazy
 */

import { useState, useEffect, useRef } from 'react';

export interface UseLazyPaginationOptions<T> {
    /** Unique key for this pagination instance */
    key: string | number | null;
    /** Function to fetch a page of data */
    fetcher: (offset: number, limit: number) => Promise<{ items: T[]; total: number }>;
    /** Batch size (default: 10) */
    batchSize?: number;
    /** Expected total count (optional, for optimization) */
    expectedTotal?: number;
    /** Whether to enable fetching (default: true) */
    enabled?: boolean;
}

export interface UseLazyPaginationResult<T> {
    items: T[];
    loading: boolean;
    loadingMore: boolean;
    error: Error | null;
    totalCount: number | null;
    hasMore: boolean;
    dataKey: string | number | null;
}

/**
 * Generic hook for lazy pagination
 * Loads data in batches for fast initial render
 * 
 * @example
 * const { items, loading, loadingMore } = useLazyPagination({
 *   key: playlistId,
 *   fetcher: (offset, limit) => getPlaylistTracks({ playlistId, offset, limit }),
 *   batchSize: 10,
 * });
 */
export function useLazyPagination<T>({
    key,
    fetcher,
    batchSize = 10,
    expectedTotal,
    enabled = true,
}: UseLazyPaginationOptions<T>): UseLazyPaginationResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [dataKey, setDataKey] = useState<string | number | null>(key);

    const currentOffsetRef = useRef(0);
    const fetcherRef = useRef(fetcher);
    useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

    useEffect(() => {
        // Reset on key change or disabled
        setItems([]);
        setTotalCount(null);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        setDataKey(key);
        currentOffsetRef.current = 0;

        if (!enabled || key === null) {
            return;
        }

        let cancelled = false;

        const loadBatch = async (offset: number) => {
            const isFirst = offset === 0;

            try {
                if (isFirst) {
                    setLoading(true);
                    setError(null);
                }

                const response = await fetcherRef.current(offset, batchSize);

                if (cancelled) return;

                const actualTotal = expectedTotal ?? response.total;

                if (isFirst) {
                    setItems(response.items);
                    setTotalCount(actualTotal);
                    setLoading(false);
                    currentOffsetRef.current = response.items.length;
                } else {
                    setItems((prev) => [...prev, ...response.items]);
                    currentOffsetRef.current += response.items.length;
                }

                // Load next batch if needed
                if (currentOffsetRef.current < actualTotal) {
                    setLoadingMore(true);
                    // Use a small delay to not block the main thread too much
                    setTimeout(() => {
                        if (!cancelled) loadBatch(currentOffsetRef.current);
                    }, 150);
                } else {
                    setLoadingMore(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[useLazyPagination] Load error:', err);
                    setError(err instanceof Error ? err : new Error('Error loading data'));
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        };

        loadBatch(0);

        return () => {
            cancelled = true;
        };
    }, [key, batchSize, expectedTotal, enabled]);

    const hasMore = totalCount !== null && items.length < totalCount;

    return {
        items,
        loading,
        loadingMore,
        error,
        totalCount,
        hasMore,
        dataKey,
    };
}
