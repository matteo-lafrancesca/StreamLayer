import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { useApi } from './useApi';

interface UseDataFetcherOptions<T> {
    fetcher: (token: string) => Promise<T>;
    cacheKey?: string | number;
    enabled?: boolean;
    cacheMap?: Map<any, T>;
    inFlightMap?: Map<any, Promise<T>>;
    accessToken?: string | null;
}

interface UseDataFetcherResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook générique pour récupérer des données depuis l'API
 * Gère le chargement, les erreurs, le cache et l'authentification
 */
export function useDataFetcher<T>({
    fetcher,
    cacheKey,
    enabled = true,
    cacheMap,
    inFlightMap,
    accessToken: providedAccessToken,
}: UseDataFetcherOptions<T>): UseDataFetcherResult<T> {
    // Only call usePlayer if accessToken is not provided (avoid circular dependency)
    const playerContext = providedAccessToken === undefined ? usePlayer() : null;
    const accessToken = providedAccessToken ?? playerContext?.accessToken ?? null;
    const { authenticatedCall } = useApi(providedAccessToken);
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [error, setError] = useState<Error | null>(null);

    // Ref pour la fonction fetcher afin d'éviter les boucles infinies dans useEffect
    const fetcherRef = useRef(fetcher);

    useEffect(() => {
        fetcherRef.current = fetcher;
    }, [fetcher]);

    useEffect(() => {
        // Si désactivé ou pas de token, on attend
        if (!enabled || !accessToken) {
            if (enabled && !accessToken) setLoading(true);
            return;
        }

        // 1. Vérification du cache immédiat
        if (cacheKey && cacheMap) {
            const cached = cacheMap.get(cacheKey);
            if (cached) {
                setData(cached);
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        setError(null);

        // 2. Vérification d'une requête déjà en cours (Deduplication)
        if (cacheKey && inFlightMap && inFlightMap.has(cacheKey)) {
            inFlightMap.get(cacheKey)!
                .then((result) => {
                    setData(result);
                    // Mettre à jour le cache si nécessaire (au cas où le fetcher principal ne l'a pas fait)
                    if (cacheMap && !cacheMap.has(cacheKey)) {
                        cacheMap.set(cacheKey, result);
                    }
                })
                .catch((err) => {
                    setError(err instanceof Error ? err : new Error('Erreur inconnue'));
                })
                .finally(() => {
                    setLoading(false);
                });
            return;
        }

        // 3. Lancement de la nouvelle requête
        const fetchPromise = authenticatedCall(async (token) => {
            return await fetcherRef.current(token);
        });

        // Enregistrement dans la map des requêtes en cours
        if (cacheKey && inFlightMap) {
            inFlightMap.set(cacheKey, fetchPromise);
        }

        fetchPromise
            .then((result) => {
                setData(result);
                // Mise en cache
                if (cacheKey && cacheMap) {
                    cacheMap.set(cacheKey, result);
                }
            })
            .catch((err) => {
                console.error('[DataFetcher] Error:', err);
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
            })
            .finally(() => {
                // Nettoyage de la map "in-flight"
                if (cacheKey && inFlightMap) {
                    inFlightMap.delete(cacheKey);
                }
                setLoading(false);
            });
    }, [accessToken, authenticatedCall, cacheKey, enabled, cacheMap, inFlightMap]);

    return { data, loading, error };
}
