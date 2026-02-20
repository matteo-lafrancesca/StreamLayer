/**
 * Unified Cache Manager
 * Provides a single interface for managing both memory and persistent (IndexedDB) caches.
 */

import { persistentCache, type StoreName } from './PersistentCache';

export interface CacheOptions {
    /** Time-to-live in milliseconds (default: 7 days) */
    ttl?: number;
    /** Maximum items in memory cache (default: 100) */
    maxItems?: number;
    /** Whether to persist to IndexedDB (default: true) */
    persist?: boolean;
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

/**
 * Generic Cache Manager with Memory (Map) + Disk (IndexedDB) layers
 */
export class CacheManager<T> {
    private memoryCache: Map<string, CacheEntry<T>> = new Map();
    private inFlightRequests: Map<string, Promise<T>> = new Map();
    private readonly options: Required<CacheOptions>;
    private readonly storeName: StoreName;
    private readonly keyPrefix: string;

    constructor(storeName: StoreName, options: CacheOptions = {}) {
        this.storeName = storeName;
        this.options = {
            ttl: options.ttl ?? 7 * 24 * 60 * 60 * 1000, // 7 days
            maxItems: options.maxItems ?? 100,
            persist: options.persist ?? true,
        };
        // Add API URL as a prefix to isolate caches between different environments/projects
        this.keyPrefix = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}:` : '';
    }

    private getInternalKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    /**
     * Get value from cache (Memory → Disk)
     */
    async get(key: string): Promise<T | null> {
        const internalKey = this.getInternalKey(key);

        // 1. Check Memory Cache
        const memEntry = this.memoryCache.get(internalKey);
        if (memEntry) {
            // Check TTL
            if (Date.now() - memEntry.timestamp < this.options.ttl) {
                // Refresh LRU position
                this.memoryCache.delete(internalKey);
                this.memoryCache.set(internalKey, memEntry);
                return memEntry.value;
            } else {
                // Expired
                this.memoryCache.delete(internalKey);
            }
        }

        // 2. Check Disk Cache (IndexedDB)
        if (this.options.persist) {
            try {
                const diskValue = await persistentCache.get<T>(this.storeName, internalKey);
                if (diskValue) {
                    // Hydrate memory cache
                    this.set(key, diskValue, { skipPersist: true });
                    return diskValue;
                }
            } catch (err) {
                console.warn(`[CacheManager] Disk cache error for ${internalKey}:`, err);
            }
        }

        return null;
    }

    /**
     * Set value in cache (Memory + Disk)
     */
    async set(key: string, value: T, options?: { skipPersist?: boolean }): Promise<void> {
        const internalKey = this.getInternalKey(key);
        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
        };

        // 1. Set in Memory
        // Evict oldest if at capacity
        if (this.memoryCache.size >= this.options.maxItems && !this.memoryCache.has(internalKey)) {
            const oldestKey = this.memoryCache.keys().next().value;
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
            }
        }

        this.memoryCache.set(internalKey, entry);

        // 2. Persist to Disk (async, non-blocking)
        if (this.options.persist && !options?.skipPersist) {
            persistentCache.set(this.storeName, internalKey, value).catch((err) => {
                console.warn(`[CacheManager] Failed to persist ${internalKey}:`, err);
            });
        }
    }

    /**
     * Delete from cache
     */
    async delete(key: string): Promise<void> {
        const internalKey = this.getInternalKey(key);
        this.memoryCache.delete(internalKey);
        if (this.options.persist) {
            await persistentCache.delete(this.storeName, internalKey);
        }
    }

    /**
     * Clear all cache
     */
    async clear(): Promise<void> {
        this.memoryCache.clear();
        if (this.options.persist) {
            await persistentCache.clearStore(this.storeName);
        }
    }

    /**
     * Check if key exists in memory cache
     */
    has(key: string): boolean {
        return this.memoryCache.has(this.getInternalKey(key));
    }

    /**
     * Check if a cache entry is stale (older than staleTime)
     * @param key - Cache key
     * @param staleTime - Time in ms before entry is considered stale
     */
    isStale(key: string, staleTime: number): boolean {
        const entry = this.memoryCache.get(this.getInternalKey(key));
        if (!entry) return true;
        return Date.now() - entry.timestamp > staleTime;
    }

    /**
     * Deduplicate in-flight requests
     * If a request is already in progress, return the same promise
     */
    async fetchWithDeduplication(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        // Check if request is already in flight
        const inFlight = this.inFlightRequests.get(key);
        if (inFlight) {
            return inFlight;
        }

        // Start new request
        const promise = fetcher()
            .then((result) => {
                // Cache the result
                this.set(key, result);
                return result;
            })
            .finally(() => {
                // Remove from in-flight
                this.inFlightRequests.delete(key);
            });

        this.inFlightRequests.set(key, promise);
        return promise;
    }
}

/**
 * Create a cache manager instance
 */
export function createCacheManager<T>(
    storeName: StoreName,
    options?: CacheOptions
): CacheManager<T> {
    return new CacheManager<T>(storeName, options);
}
