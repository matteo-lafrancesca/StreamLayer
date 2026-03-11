import { persistentCache, type StoreName } from './PersistentCache';
import { ConfigManager } from '../config/ConfigManager';

export interface CacheOptions {
    ttl?: number;
    maxItems?: number;
    persist?: boolean;
}

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

/**
 * Gestionnaire de cache à deux niveaux : Mémoire (Map) et Disque (IndexedDB).
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
            ttl: options.ttl ?? 7 * 24 * 60 * 60 * 1000,
            maxItems: options.maxItems ?? 100,
            persist: options.persist ?? true,
        };
        this.keyPrefix = ConfigManager.isInitialized() ? `${ConfigManager.getConfig().apiBaseUrl}:` : '';
    }

    private getInternalKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    async get(key: string): Promise<T | null> {
        const internalKey = this.getInternalKey(key);

        const memEntry = this.memoryCache.get(internalKey);
        if (memEntry) {
            if (Date.now() - memEntry.timestamp < this.options.ttl) {
                // LRU: move to end
                this.memoryCache.delete(internalKey);
                this.memoryCache.set(internalKey, memEntry);
                return memEntry.value;
            } else {
                this.memoryCache.delete(internalKey);
            }
        }

        if (this.options.persist) {
            try {
                const diskValue = await persistentCache.get<T>(this.storeName, internalKey);
                if (diskValue) {
                    this.set(key, diskValue, { skipPersist: true });
                    return diskValue;
                }
            } catch (err) {
                console.warn(`[CacheManager] Disk cache error for ${internalKey}:`, err);
            }
        }

        return null;
    }

    async set(key: string, value: T, options?: { skipPersist?: boolean }): Promise<void> {
        const internalKey = this.getInternalKey(key);
        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now(),
        };

        if (this.memoryCache.size >= this.options.maxItems && !this.memoryCache.has(internalKey)) {
            const oldestKey = this.memoryCache.keys().next().value;
            if (oldestKey) this.memoryCache.delete(oldestKey);
        }

        this.memoryCache.set(internalKey, entry);

        if (this.options.persist && !options?.skipPersist) {
            persistentCache.set(this.storeName, internalKey, value).catch((err) => {
                console.warn(`[CacheManager] Failed to persist ${internalKey}:`, err);
            });
        }
    }

    async delete(key: string): Promise<void> {
        const internalKey = this.getInternalKey(key);
        this.memoryCache.delete(internalKey);
        if (this.options.persist) {
            await persistentCache.delete(this.storeName, internalKey);
        }
    }

    async clear(): Promise<void> {
        this.memoryCache.clear();
        if (this.options.persist) {
            await persistentCache.clearStore(this.storeName);
        }
    }

    has(key: string): boolean {
        return this.memoryCache.has(this.getInternalKey(key));
    }

    /**
     * Vérifie si une entrée est plus ancienne que staleTime (ms).
     */
    isStale(key: string, staleTime: number): boolean {
        const entry = this.memoryCache.get(this.getInternalKey(key));
        if (!entry) return true;
        return Date.now() - entry.timestamp > staleTime;
    }

    /**
     * Accès synchrone au cache mémoire uniquement.
     */
    getMemoryValue(key: string): T | null {
        const entry = this.memoryCache.get(this.getInternalKey(key));
        if (entry && Date.now() - entry.timestamp < this.options.ttl) {
            return entry.value;
        }
        return null;
    }

    /**
     * Évite les requêtes réseau en double pour une même clé.
     */
    async fetchWithDeduplication(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        const inFlight = this.inFlightRequests.get(key);
        if (inFlight) return inFlight;

        const promise = fetcher()
            .then((result) => {
                this.set(key, result);
                return result;
            })
            .finally(() => {
                this.inFlightRequests.delete(key);
            });

        this.inFlightRequests.set(key, promise);
        return promise;
    }
}

export function createCacheManager<T>(
    storeName: StoreName,
    options?: CacheOptions
): CacheManager<T> {
    return new CacheManager<T>(storeName, options);
}
