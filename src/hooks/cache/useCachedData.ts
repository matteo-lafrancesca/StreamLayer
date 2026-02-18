/**
 * Generic hook for caching data (JSON)
 * Replaces useDataFetcher with a cleaner, more maintainable implementation
 */

import { useState, useEffect, useRef } from 'react';
import { createCacheManager, type CacheManager, type CacheOptions } from '@cache/CacheManager';
import { cacheFirst, staleWhileRevalidate } from '@cache/cacheStrategies';
import { useApi } from '../useApi';

export interface UseCachedDataOptions<T> extends CacheOptions {
    /** Unique cache key */
    key: string | number | null;
    /** Function to fetch data (receives access token) */
    fetcher: (token: string) => Promise<T>;
    /** Whether to enable fetching (default: true) */
    enabled?: boolean;
    /** Access token (optional, will use AuthContext if not provided) */
    accessToken?: string | null;
    /** Shared cache manager instance (optional, creates new if not provided) */
    cacheManager?: CacheManager<T>;
    /** Cache strategy: 'cache-first' (default) or 'stale-while-revalidate' */
    strategy?: 'cache-first' | 'stale-while-revalidate';
}

export interface UseCachedDataResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    /** Manually refetch data */
    refetch: () => void;
}

// Global cache managers (one per data type)
const cacheManagers = new Map<string, CacheManager<any>>();

function getCacheManager<T>(namespace: string, options?: CacheOptions): CacheManager<T> {
    if (!cacheManagers.has(namespace)) {
        cacheManagers.set(namespace, createCacheManager<T>('data', options));
    }
    return cacheManagers.get(namespace)!;
}

/**
 * Generic hook for caching any JSON data
 * 
 * @example
 * const { data, loading, error } = useCachedData({
 *   key: playlistId,
 *   fetcher: (token) => getPlaylistTracks({ playlistId, token }),
 * });
 */
export function useCachedData<T>({
    key,
    fetcher,
    enabled = true,
    accessToken: providedAccessToken,
    cacheManager: providedCacheManager,
    strategy = 'cache-first',
    ...cacheOptions
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
    const { authenticatedCall } = useApi(providedAccessToken);

    // 1. Get Cache Manager (Static)
    const cacheManager = providedCacheManager ?? getCacheManager<T>('default', cacheOptions);

    // 2. Synchronous check to avoid flicker on first render
    const [data, setData] = useState<T | null>(() => {
        if (!enabled || key === null) return null;
        // This only works for memory cache, but it's enough to avoid most flickers
        // @ts-ignore - reaching into memoryCache for sync check if possible
        const memEntry = cacheManager.memoryCache?.get(String(key));
        return memEntry ? memEntry.value : null;
    });

    const [loading, setLoading] = useState(() => {
        if (!enabled || key === null) return false;
        // If we have memory data, we are NOT loading initially (we might revalidate later)
        // @ts-ignore
        return !cacheManager.memoryCache?.has(String(key));
    });

    const [error, setError] = useState<Error | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const fetcherRef = useRef(fetcher);
    useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

    const authenticatedCallRef = useRef(authenticatedCall);
    useEffect(() => { authenticatedCallRef.current = authenticatedCall; }, [authenticatedCall]);

    useEffect(() => {
        if (!enabled || key === null) {
            setLoading(false);
            return;
        }

        const cacheKey = String(key);
        let cancelled = false;

        const loadData = async () => {
            // Only set loading if we don't already have data from a previous render
            // or if it's an explicit re-fetch
            const hasData = !!data;
            if (!hasData) setLoading(true);
            setError(null);

            try {
                let result: T;

                if (strategy === 'stale-while-revalidate') {
                    result = await staleWhileRevalidate({
                        cacheManager,
                        key: cacheKey,
                        fetcher: () => authenticatedCallRef.current((token) => fetcherRef.current(token)),
                        onRevalidate: (freshData) => {
                            if (!cancelled) setData(freshData);
                        },
                    });
                } else {
                    result = await cacheFirst({
                        cacheManager,
                        key: cacheKey,
                        fetcher: () => authenticatedCallRef.current((token) => fetcherRef.current(token)),
                    });
                }

                if (!cancelled) {
                    setData(result);
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('[useCachedData] Error:', err);
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            cancelled = true;
        };
    }, [key, enabled, cacheManager, refetchTrigger]);

    const refetch = () => {
        setRefetchTrigger((prev) => prev + 1);
    };

    return { data, loading, error, refetch };
}
