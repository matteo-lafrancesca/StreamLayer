const DB_NAME = 'StreamLayerCache';
const DB_VERSION = 1;

export type StoreName = 'images' | 'data';

interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    size?: number; // Size in bytes (approximate for JSON, exact for Blobs)
}

/**
 * PersistentCache - Wrapper around IndexedDB
 * providing persistent storage for images (Blobs) and data (JSON).
 */
class PersistentCache {
    private dbPromise: Promise<IDBDatabase> | null = null;
    private static instance: PersistentCache;

    // Configuration
    private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    private readonly MAX_ITEMS = {
        images: 500, // Max 500 cached images
        data: 100    // Max 100 cached API responses
    };

    private constructor() { }

    public static getInstance(): PersistentCache {
        if (!PersistentCache.instance) {
            PersistentCache.instance = new PersistentCache();
        }
        return PersistentCache.instance;
    }

    /**
     * Open (or create) the database
     */
    private async getDB(): Promise<IDBDatabase> {
        if (this.dbPromise) return this.dbPromise;

        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[PersistentCache] Failed to open DB', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Store for Images (Blobs)
                if (!db.objectStoreNames.contains('images')) {
                    const store = db.createObjectStore('images', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Store for Data (JSON)
                if (!db.objectStoreNames.contains('data')) {
                    const store = db.createObjectStore('data', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });

        return this.dbPromise;
    }

    /**
     * Save an item to the cache
     */
    public async set<T>(storeName: StoreName, key: string, value: T): Promise<void> {
        try {
            const db = await this.getDB();

            // Calculate size - simple heuristic
            let size = 0;
            if (value instanceof Blob) {
                size = value.size;
            } else {
                size = JSON.stringify(value).length;
            }

            const entry: CacheEntry<T> = {
                key,
                value,
                timestamp: Date.now(),
                size
            };

            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(entry);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);

                // Trigger non-blocking cleanup check
                transaction.oncomplete = () => {
                    this.enforceLimits(storeName);
                };
            });
        } catch (error) {
            console.error(`[PersistentCache] Error setting key ${key} in ${storeName}:`, error);
        }
    }

    /**
     * Retrieve an item from the cache
     */
    public async get<T>(storeName: StoreName, key: string): Promise<T | null> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);

                request.onsuccess = () => {
                    const entry = request.result as CacheEntry<T>;
                    if (entry) {
                        // Check Expiration (TTL)
                        if (Date.now() - entry.timestamp > this.MAX_AGE_MS) {
                            console.log(`[PersistentCache] Item ${key} expired, deleting.`);
                            this.delete(storeName, key); // Lazy delete
                            resolve(null);
                        } else {
                            resolve(entry.value);
                            // Optional: Update timestamp on access (LRU style update)?
                            // For now, we only trust creation time for simpler TTL.
                        }
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error(`[PersistentCache] Error getting key ${key} from ${storeName}:`, error);
            return null;
        }
    }

    /**
     * Delete an item specifically
     */
    public async delete(storeName: StoreName, key: string): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.delete(key);
    }

    /**
     * Clear an entire store
     */
    public async clearStore(storeName: StoreName): Promise<void> {
        const db = await this.getDB();
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        store.clear();
    }

    /**
     * Enforce Max Items limit (LRU Eviction)
     */
    private async enforceLimits(storeName: StoreName): Promise<void> {
        const db = await this.getDB();
        const limit = this.MAX_ITEMS[storeName];

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const index = store.index('timestamp'); // Ordered by timestamp (Oldest first)

            const countRequest = store.count();

            countRequest.onsuccess = () => {
                const count = countRequest.result;
                if (count > limit) {
                    // Need to delete (count - limit) items
                    const itemsToDelete = count - limit;
                    let deleted = 0;

                    // Open a cursor on the index (Oldest items first by default)
                    const cursorRequest = index.openCursor();

                    cursorRequest.onsuccess = (e) => {
                        const cursor = (e.target as IDBRequest).result as IDBCursor;
                        if (cursor && deleted < itemsToDelete) {
                            cursor.delete();
                            deleted++;
                            cursor.continue();
                        }
                    };
                }
                resolve();
            };

            countRequest.onerror = () => reject(countRequest.error);
        });
    }
}

export const persistentCache = PersistentCache.getInstance();
