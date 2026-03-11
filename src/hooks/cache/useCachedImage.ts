import { useState, useEffect, useRef } from 'react';
import { Logger } from '@utils/system';
import { getCachedBlobUrl, setCachedBlobUrl } from '@cache/blobUrlCache';
import { imageBlobCache } from '@cache/managers';

export interface UseCachedImageOptions {
    key: string | null;
    fetcher: () => Promise<string>;
    enabled?: boolean;
    debounce?: number;
}

// Hook pour la gestion du cache des images
// Stratégie : Mémoire (Blob URL) → Disque (IndexedDB) → Réseau
export function useCachedImage({
    key,
    fetcher,
    enabled = true,
    debounce = 200,
}: UseCachedImageOptions): string | null {
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!enabled || !key) return null;
        return getCachedBlobUrl(key);
    });

    const fetcherRef = useRef(fetcher);
    useEffect(() => { fetcherRef.current = fetcher; }, [fetcher]);

    useEffect(() => {
        let isSubscribed = true;

        if (!enabled || !key) {
            setBlobUrl(null);
            return;
        }

        const cached = getCachedBlobUrl(key);
        if (cached) {
            setBlobUrl(cached);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                // Récupération via CacheManager (gère le disque et la déduplication)
                const blob = await imageBlobCache.fetchWithDeduplication(key, async () => {
                    const url = await fetcherRef.current();
                    const response = await fetch(url);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                    return await response.blob();
                });

                if (!isSubscribed) return;

                const finalUrl = URL.createObjectURL(blob);
                setCachedBlobUrl(key, finalUrl);
                setBlobUrl(finalUrl);

            } catch (error) {
                if (!isSubscribed) return;
                Logger.error(`[useCachedImage] Échec du chargement pour ${key} :`, error);
                setBlobUrl(null);
            }
        }, debounce);

        return () => {
            isSubscribed = false;
            clearTimeout(timeoutId);
        };
    }, [enabled, key, debounce]);

    return blobUrl;
}
