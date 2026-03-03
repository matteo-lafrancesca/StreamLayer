/**
 * Reusable Cache Strategies
 * Common patterns for fetching and caching data
 */

import type { CacheManager } from './CacheManager';

export interface FetchOptions<T> {
    cacheManager: CacheManager<T>;
    key: string;
    fetcher: () => Promise<T>;
}

/**
 * Cache-First Strategy
 * Memory → Disk → Network
 * Returns cached data if available, otherwise fetches from network
 */
export async function cacheFirst<T>({
    cacheManager,
    key,
    fetcher,
}: FetchOptions<T>): Promise<T> {
    const cached = await cacheManager.get(key);
    if (cached !== null) {
        return cached;
    }

    return cacheManager.fetchWithDeduplication(key, fetcher);
}

/**
 * Network-First Strategy
 * Network → Cache fallback
 * Always tries network first, falls back to cache on error
 */
export async function networkFirst<T>({
    cacheManager,
    key,
    fetcher,
}: FetchOptions<T>): Promise<T> {
    try {
        const result = await fetcher();
        await cacheManager.set(key, result);
        return result;
    } catch (error) {
        const cached = await cacheManager.get(key);
        if (cached !== null) {
            console.warn(`[networkFirst] Using stale cache for ${key} due to network error`);
            return cached;
        }
        throw error;
    }
}

/**
 * Stale-While-Revalidate Strategy
 * Returns cached data immediately, then fetches fresh data in background
 * Useful for showing instant results while keeping data fresh
 */
export async function staleWhileRevalidate<T>({
    cacheManager,
    key,
    fetcher,
    onRevalidate,
}: FetchOptions<T> & {
    onRevalidate?: (freshData: T) => void;
}): Promise<T> {
    const cached = await cacheManager.get(key);

    if (onRevalidate) {
        cacheManager.fetchWithDeduplication(key, fetcher)
            .then((freshData) => {
                if (cached === null || JSON.stringify(cached) !== JSON.stringify(freshData)) {
                    onRevalidate(freshData);
                }
            })
            .catch((err) => {
                console.warn(`[staleWhileRevalidate] Background fetch failed for ${key}:`, err);
            });
    } else {
        cacheManager.fetchWithDeduplication(key, fetcher).catch((err) => {
            console.warn(`[staleWhileRevalidate] Background fetch failed for ${key}:`, err);
        });
    }

    if (cached !== null) {
        return cached;
    }

    return cacheManager.fetchWithDeduplication(key, fetcher);
}

/**
 * Cache-Only Strategy
 * Only returns cached data, never fetches from network
 * Useful for offline-first scenarios
 */
export async function cacheOnly<T>({
    cacheManager,
    key,
}: Omit<FetchOptions<T>, 'fetcher'>): Promise<T | null> {
    return cacheManager.get(key);
}
