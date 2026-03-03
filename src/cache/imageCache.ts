/**
 * Image blob LRU cache.
 */
const imageBlobCache = new Map<string, string>();
const CACHE_LIMIT = 300;

/**
 * Retrieves an image.
 */
export function getCachedImage(key: string): string | null {
    const url = imageBlobCache.get(key);
    if (url) {
        imageBlobCache.delete(key);
        imageBlobCache.set(key, url);
        return url;
    }
    return null;
}

/**
 * Caches an image.
 */
export function setCachedImage(key: string, url: string): void {
    if (imageBlobCache.has(key)) {
        imageBlobCache.delete(key);
    } else if (imageBlobCache.size >= CACHE_LIMIT) {
        const oldestKey = imageBlobCache.keys().next().value;
        if (oldestKey) {
            const oldUrl = imageBlobCache.get(oldestKey);
            if (oldUrl) {
                URL.revokeObjectURL(oldUrl);
            }
            imageBlobCache.delete(oldestKey);
        }
    }
    imageBlobCache.set(key, url);
}

/**
 * Checks if an image is cached.
 */
export function hasCachedImage(key: string): boolean {
    return imageBlobCache.has(key);
}

/**
 * Clears the image cache.
 */
export function clearImageCache(): void {
    imageBlobCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
    });
    imageBlobCache.clear();
}


