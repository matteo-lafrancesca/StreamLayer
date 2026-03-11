import { useState, useEffect, useRef } from 'react';
import { Logger } from '@utils/system';
import { createCacheManager, type CacheManager, type CacheOptions } from '@cache/CacheManager';
import { cacheFirst, staleWhileRevalidate } from '@cache/cacheStrategies';
import { useApi } from '../Auth/useApi';

export interface UseCachedDataOptions<T> extends CacheOptions {
    key: string | number | null;
    fetcher: (token: string) => Promise<T>;
    enabled?: boolean;
    accessToken?: string | null;
    cacheManager?: CacheManager<T>;
    strategy?: 'cache-first' | 'stale-while-revalidate';
}

export interface UseCachedDataResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

const cacheManagers = new Map<string, CacheManager<any>>();

function getCacheManager<T>(namespace: string, options?: CacheOptions): CacheManager<T> {
    if (!cacheManagers.has(namespace)) {
        cacheManagers.set(namespace, createCacheManager<T>('data', options));
    }
    return cacheManagers.get(namespace)!;
}

// Hook générique pour la mise en cache de données JSON
// Gère les stratégies Cache-First (cache d'abord) et Stale-While-Revalidate (revalidation en arrière-plan)
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
    const cacheManager = providedCacheManager ?? getCacheManager<T>('default', cacheOptions);

    const [data, setData] = useState<T | null>(() => {
        if (!enabled || key === null) return null;
        return cacheManager.getMemoryValue(String(key));
    });

    const [loading, setLoading] = useState(() => {
        if (!enabled || key === null) return false;
        return cacheManager.getMemoryValue(String(key)) === null;
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
            if (!data) setLoading(true);
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
                    Logger.error('[useCachedData] Erreur :', err);
                    setError(err instanceof Error ? err : new Error('Erreur inconnue'));
                    setLoading(false);
                }
            }
        };

        loadData();
        return () => { cancelled = true; };
    }, [key, enabled, cacheManager, refetchTrigger]);

    const refetch = () => setRefetchTrigger((prev) => prev + 1);

    return { data, loading, error, refetch };
}
