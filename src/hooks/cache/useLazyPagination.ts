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

    const loadingRef = useRef(false);
    const currentOffsetRef = useRef(0);

    // Store fetcher in ref to avoid infinite loop
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    useEffect(() => {
        if (!enabled || key === null) {
            setItems([]);
            setTotalCount(null);
            setLoading(false);
            setLoadingMore(false);
            currentOffsetRef.current = 0;
            return;
        }

        // Reset for new key
        loadingRef.current = false;
        const isMounted = { current: true };

        if (loadingRef.current) return;
        loadingRef.current = true;

        const loadBatch = async (offset: number, isFirst: boolean) => {
            try {
                if (isFirst && isMounted.current) {
                    setLoading(true);
                    setError(null);
                    setItems([]);
                    setTotalCount(null);
                    currentOffsetRef.current = 0;
                }

                const response = await fetcherRef.current(offset, batchSize);

                if (!isMounted.current) return;

                const actualTotal = expectedTotal ?? response.total;

                if (isFirst) {
                    setItems(response.items);
                    setTotalCount(actualTotal);
                    setLoading(false);
                    currentOffsetRef.current = response.items.length;
                } else {
                    setItems((prevItems) => {
                        const newItems = [...prevItems, ...response.items];
                        currentOffsetRef.current = newItems.length;
                        return newItems;
                    });
                }

                // Load next batch if needed
                if (offset + response.items.length < actualTotal) {
                    if (isFirst) {
                        setLoadingMore(true);
                    }
                    setTimeout(() => {
                        if (isMounted.current) {
                            loadBatch(offset + batchSize, false);
                        }
                    }, 100);
                } else {
                    setLoadingMore(false);
                    loadingRef.current = false;
                }
            } catch (err) {
                if (!isMounted.current) return;
                console.error('[useLazyPagination] Load error:', err);
                setError(err instanceof Error ? err : new Error('Error loading data'));
                setLoading(false);
                setLoadingMore(false);
                loadingRef.current = false;
            }
        };

        loadBatch(0, true);

        return () => {
            isMounted.current = false;
        };
    }, [key, batchSize, expectedTotal, enabled]); // Removed 'fetcher' from dependencies

    const hasMore = totalCount !== null && items.length < totalCount;

    return {
        items,
        loading,
        loadingMore,
        error,
        totalCount,
        hasMore,
    };
}
