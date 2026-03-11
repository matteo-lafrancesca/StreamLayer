/**
 * Cache mémoire pour les URLs de Blobs (URL.createObjectURL).
 * Gère la révocation automatique pour éviter les fuites mémoire.
 */
const blobUrlMap = new Map<string, string>();
const CACHE_LIMIT = 300;

export function getCachedBlobUrl(key: string): string | null {
    const url = blobUrlMap.get(key);
    if (url) {
        blobUrlMap.delete(key);
        blobUrlMap.set(key, url);
        return url;
    }
    return null;
}

export function setCachedBlobUrl(key: string, url: string): void {
    if (blobUrlMap.has(key)) {
        blobUrlMap.delete(key);
    } else if (blobUrlMap.size >= CACHE_LIMIT) {
        const oldestKey = blobUrlMap.keys().next().value;
        if (oldestKey) {
            const oldUrl = blobUrlMap.get(oldestKey);
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            blobUrlMap.delete(oldestKey);
        }
    }
    blobUrlMap.set(key, url);
}

export function hasCachedBlobUrl(key: string): boolean {
    return blobUrlMap.has(key);
}

/**
 * Révoque toutes les URLs et vide le cache.
 */
export function clearBlobUrlCache(): void {
    blobUrlMap.forEach((blobUrl) => URL.revokeObjectURL(blobUrl));
    blobUrlMap.clear();
}
