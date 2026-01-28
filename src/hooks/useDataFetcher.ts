import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '@context/AuthContext';
import { useApi } from './useApi';
import { persistentCache } from '../cache/PersistentCache';

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
    // Always call context to respect Rules of Hooks
    // usage of useContext(AuthContext) is safe here.
    const authContext = useContext(AuthContext);
    const accessToken = providedAccessToken ?? authContext?.accessToken ?? null;
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

        // 1. Immediate cache check (Memory)
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

        // 3. Persistent Cache + Network Strategy
        const loadData = async () => {
            // A. Check Persistent Cache (Disk)
            if (cacheKey) {
                try {
                    const storedData = await persistentCache.get<T>('data', String(cacheKey));
                    if (storedData) {
                        // Found in disk!
                        setData(storedData);
                        setLoading(false); // Stop loading immediately

                        // Hydrate Memory Cache
                        if (cacheMap) cacheMap.set(cacheKey, storedData);

                        // Optional: Background revalidation could go here
                        return;
                    }
                } catch (err) {
                    console.warn(`[DataFetcher] Persistent cache error:`, err);
                }
            }

            // B. Launch Network Request
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
                    // Cache result (Memory)
                    if (cacheKey && cacheMap) {
                        cacheMap.set(cacheKey, result);
                    }
                    // Cache result (Disk)
                    if (cacheKey) {
                        persistentCache.set('data', String(cacheKey), result).catch(err => {
                            console.warn(`[DataFetcher] Failed to persist ${cacheKey}:`, err);
                        });
                    }
                })
                .catch((err) => {
                    console.error('[DataFetcher] Error:', err);
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                })
                .finally(() => {
                    if (cacheKey && inFlightMap) {
                        inFlightMap.delete(cacheKey);
                    }
                    setLoading(false);
                });
        };

        loadData();

    }, [accessToken, authenticatedCall, cacheKey, enabled, cacheMap, inFlightMap]);

    return { data, loading, error };
}
