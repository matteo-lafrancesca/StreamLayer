/**
 * Cache centralisé pour les blob URLs des images
 */
const imageBlobCache = new Map<string, string>();

/**
 * Récupérer une image du cache
 */
export function getCachedImage(key: string): string | null {
    return imageBlobCache.get(key) || null;
}

/**
 * Mettre une image en cache
 */
export function setCachedImage(key: string, url: string): void {
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
