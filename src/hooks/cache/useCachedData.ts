/**
 * Generic hook for caching data (JSON)
 * Replaces useDataFetcher with a cleaner, more maintainable implementation
 */

import { useState, useEffect, useRef } from 'react';
import { createCacheManager, type CacheManager, type CacheOptions } from '@cache/CacheManager';
import { cacheFirst } from '@cache/cacheStrategies';
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
    ...cacheOptions
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
    const { authenticatedCall } = useApi(providedAccessToken);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(enabled && key !== null);
    const [error, setError] = useState<Error | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    // Get or create cache manager
    const cacheManager = providedCacheManager ?? getCacheManager<T>('default', cacheOptions);

    // Stable fetcher ref
    const fetcherRef = useRef(fetcher);
    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    // Stable authenticatedCall ref to avoid infinite loops
    const authenticatedCallRef = useRef(authenticatedCall);
    useEffect(() => {
        authenticatedCallRef.current = authenticatedCall;
    }, [authenticatedCall]);

    useEffect(() => {
        if (!enabled || key === null) {
            if (enabled && key === null) setLoading(true);
            return;
        }

        const cacheKey = String(key);
        let cancelled = false;

        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await cacheFirst({
                    cacheManager,
                    key: cacheKey,
                    fetcher: () => authenticatedCallRef.current((token) => fetcherRef.current(token)),
                });

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
