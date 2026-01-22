import { useState, useEffect, useRef } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';

const BATCH_SIZE = 10; // Charger 10 tracks à la fois

// Cache pour les tracks complètes de chaque playlist
const fullTracksCache = new Map<number, Track[]>();

interface UsePlaylistTracksLazyResult {
    tracks: Track[] | null;
    loading: boolean;
    error: Error | null;
    isLoadingMore: boolean;
    totalCount: number | null;
}

/**
 * Hook pour récupérer les tracks d'une playlist avec lazy loading progressif
 * Charge les tracks par batches de 10 pour un affichage ultra-rapide
 * @param playlistId - L'ID de la playlist
 * @param accessToken - Token d'accès (requis pour éviter la dépendance circulaire avec PlayerContext)
 * @param expectedTotal - Nombre total de tracks attendu (depuis playlist.nb_items)
 */
export function usePlaylistTracksLazy(
    playlistId: number | null | undefined,
    accessToken: string | null | undefined,
    expectedTotal?: number
): UsePlaylistTracksLazyResult {
    const [tracks, setTracks] = useState<Track[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const loadingRef = useRef(false);
    const currentOffsetRef = useRef(0);

    useEffect(() => {
        if (!playlistId || !accessToken) {
            setTracks(null);
            setTotalCount(null);
            setLoading(false);
            setIsLoadingMore(false);
            currentOffsetRef.current = 0;
            return;
        }

        // Vérifier le cache complet
        const cached = fullTracksCache.get(playlistId);
        if (cached) {
            setTracks(cached);
            setTotalCount(cached.length);
            setLoading(false);
            setIsLoadingMore(false);
            currentOffsetRef.current = cached.length;
            return;
        }

        // Réinitialiser le ref de chargement pour cette playlist
        loadingRef.current = false;

        // Ref pour suivre si le composant est monté
        const isMounted = { current: true };

        // Éviter les doubles chargements
        if (loadingRef.current) return;
        loadingRef.current = true;

        // Fonction pour charger un batch
        const loadBatch = async (offset: number, isFirst: boolean) => {
            try {
                if (isFirst) {
                    if (!isMounted.current) return;
                    setLoading(true);
                    setError(null);
                    setTracks(null);
                    setTotalCount(null);
                    currentOffsetRef.current = 0;
                }

                const response = await getPlaylistTracks({
                    playlistId,
                    limit: BATCH_SIZE,
                    offset,
                    accessToken
                });

                if (!isMounted.current) return;

                const actualTotal = expectedTotal ?? response.count_item;

                if (isFirst) {
                    console.log('[LazyLoad] Premier batch chargé:', response.items.length, '/', actualTotal);
                    setTracks(response.items);
                    setTotalCount(actualTotal);
                    setLoading(false);
                    currentOffsetRef.current = response.items.length;
                } else {
                    console.log('[LazyLoad] Batch chargé:', response.items.length, 'tracks (total:', offset + response.items.length, '/', actualTotal, ')');
                    setTracks(prevTracks => {
                        const newTracks = prevTracks ? [...prevTracks, ...response.items] : response.items;
                        currentOffsetRef.current = newTracks.length;

                        // Mettre en cache si on a tout chargé
                        if (newTracks.length >= actualTotal) {
                            fullTracksCache.set(playlistId, newTracks);
                            console.log('[LazyLoad] Toutes les tracks chargées et mises en cache');
                        }

                        return newTracks;
                    });
                }

                // Charger le batch suivant si nécessaire
                if (offset + response.items.length < actualTotal) {
                    if (isFirst) {
                        setIsLoadingMore(true);
                    }
                    // Petit délai pour ne pas bloquer l'UI
                    setTimeout(() => {
                        if (isMounted.current) {
                            loadBatch(offset + BATCH_SIZE, false);
                        }
                    }, 100);
                } else {
                    setIsLoadingMore(false);
                    loadingRef.current = false;
                }

            } catch (err) {
                if (!isMounted.current) return;
                console.error('[LazyLoad] Erreur de chargement:', err);
                setError(err instanceof Error ? err : new Error('Erreur lors du chargement des tracks'));
                setLoading(false);
                setIsLoadingMore(false);
                loadingRef.current = false;
            }
        };

        // Démarrer le chargement
        loadBatch(0, true);

        return () => {
            isMounted.current = false;
        };

    }, [playlistId, accessToken, expectedTotal]);

    return {
        tracks,
        loading,
        error,
        isLoadingMore,
        totalCount
    };
}
