import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { useApi } from './useApi';

interface UseDataFetcherOptions<T> {
    fetcher: (token: string) => Promise<T>;
    cacheKey?: string | number;
    enabled?: boolean;
    cacheMap?: Map<any, T>;
    inFlightMap?: Map<any, Promise<T>>;
    accessToken?: string | null;
}

interface UseDataFetcherResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Generic hook to fetch data from API.
 * Handles loading, errors, caching, and authentication.
 */
export function useDataFetcher<T>({
    fetcher,
    cacheKey,
    enabled = true,
    cacheMap,
    inFlightMap,
    accessToken: providedAccessToken,
}: UseDataFetcherOptions<T>): UseDataFetcherResult<T> {
    // Only call usePlayer if accessToken is not provided (avoid circular dependency)
    const playerContext = providedAccessToken === undefined ? usePlayer() : null;
    const accessToken = providedAccessToken ?? playerContext?.accessToken ?? null;
    const { authenticatedCall } = useApi(providedAccessToken);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);

    // Ref for fetcher to avoid infinite loops in useEffect
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    useEffect(() => {
        // If disabled or no token, wait
        if (!enabled || !accessToken) {
            if (enabled && !accessToken) setLoading(true);
            return;
        }

        // 1. Immediate cache check
        if (cacheKey && cacheMap) {
            const cached = cacheMap.get(cacheKey);
            if (cached) {
                setData(cached);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        setError(null);

        // 2. In-flight request check (Deduplication)
        if (cacheKey && inFlightMap && inFlightMap.has(cacheKey)) {
            inFlightMap.get(cacheKey)!
                .then((result) => {
                    setData(result);
                    // Update cache if necessary (in case primary fetcher didn't)
                    if (cacheMap && !cacheMap.has(cacheKey)) {
                        cacheMap.set(cacheKey, result);
                    }
                })
                .catch((err) => {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                })
                .finally(() => {
                    setLoading(false);
                });
            return;
        }

        // 3. Launch new request
        const fetchPromise = authenticatedCall(async (token) => {
            return await fetcherRef.current(token);
        });

        // Register in in-flight map
        if (cacheKey && inFlightMap) {
            inFlightMap.set(cacheKey, fetchPromise);
        }

        fetchPromise
            .then((result) => {
                setData(result);
                // Cache result
                if (cacheKey && cacheMap) {
                    cacheMap.set(cacheKey, result);
                }
            })
            .catch((err) => {
                console.error('[DataFetcher] Error:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            })
            .finally(() => {
                // Cleanup in-flight map
                if (cacheKey && inFlightMap) {
                    inFlightMap.delete(cacheKey);
                }
                setLoading(false);
            });
    }, [accessToken, authenticatedCall, cacheKey, enabled, cacheMap, inFlightMap]);

    return { data, loading, error };
}
