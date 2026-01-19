import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@context/PlayerContext';
import { useApi } from './useApi';

interface UseDataFetcherOptions<T> {
    fetcher: (token: string) => Promise<T>;
    cacheKey?: string | number;
    enabled?: boolean;
    cacheMap?: Map<any, T>;
    accessToken?: string | null; // Optional to avoid circular dependency
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
    // si l'utilisateur passe une fonction fléchée inline
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

        // Vérification du cache
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

        // Appel API authentifié
        authenticatedCall(async (token) => {
            return await fetcherRef.current(token);
        })
            .then((result) => {
                setData(result);
                // Mise en cache
                if (cacheKey && cacheMap) {
                    cacheMap.set(cacheKey, result);
                }
            })
            .catch((err) => {
                setError(err instanceof Error ? err : new Error('Erreur inconnue'));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [accessToken, authenticatedCall, cacheKey, enabled, cacheMap]);

    return { data, loading, error };
}
