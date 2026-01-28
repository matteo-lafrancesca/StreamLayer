/**
 * Cache centralisé pour les blob URLs des images
 * Implémente une stratégie LRU (Least Recently Used)
 */
const imageBlobCache = new Map<string, string>();
const CACHE_LIMIT = 300;

/**
 * Récupérer une image du cache
 * Met à jour la "fraîcheur" de l'élément (LRU)
 */
export function getCachedImage(key: string): string | null {
    const url = imageBlobCache.get(key);
    if (url) {
        // Refresh LRU: remove and re-add to put it at the end (most recent)
        imageBlobCache.delete(key);
        imageBlobCache.set(key, url);
        return url;
    }
    return null;
}

/**
 * Mettre une image en cache
 * Gère l'éviction automatique si la limite est atteinte
 */
export function setCachedImage(key: string, url: string): void {
    if (imageBlobCache.has(key)) {
        // Update existing: refresh position
        imageBlobCache.delete(key);
    } else if (imageBlobCache.size >= CACHE_LIMIT) {
        // Evict oldest (first item in Map)
        const oldestKey = imageBlobCache.keys().next().value;
        if (oldestKey) {
            const oldUrl = imageBlobCache.get(oldestKey);
            if (oldUrl) {
                URL.revokeObjectURL(oldUrl); // Free memory immediately
            }
            imageBlobCache.delete(oldestKey);
        }
    }
    imageBlobCache.set(key, url);
}

/**
 * Vérifier si une image est en cache
 */
export function hasCachedImage(key: string): boolean {
    return imageBlobCache.has(key);
}

/**
 * Vider le cache des images
 */
export function clearImageCache(): void {
    imageBlobCache.forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
    });
    imageBlobCache.clear();
}


