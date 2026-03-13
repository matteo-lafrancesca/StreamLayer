import { useState, useEffect } from 'react';
import { getPlaylistTracks } from '@services/api/playlists';
import type { Track } from '@definitions/track';
import { useApi } from '../Auth/useApi';
import { useAuth } from '@context/AuthContext';
import { useLazyPagination } from '../cache/useLazyPagination';
import { playlistTracksCache } from '@cache/managers';
import { Logger } from '@utils/system';

interface UsePlaylistTracksLazyResult {
    tracks: Track[] | null;
    loading: boolean;
    error: Error | null;
    isLoadingMore: boolean;
    totalCount: number | null;
}

// Charge les morceaux d'une playlist de manière progressive (pagination) avec cache
export function usePlaylistTracksLazy(
    playlistId: number | null | undefined,
    accessToken: string | null | undefined,
    expectedTotal?: number
): UsePlaylistTracksLazyResult {
    const cacheKey = playlistId ? `playlist-tracks-${playlistId}` : null;
    const { authenticatedCall } = useApi(accessToken);
    const { error: authError } = useAuth();

    const [cachedTracks, setCachedTracks] = useState<Track[] | null>(null);
    const [cacheChecked, setCacheChecked] = useState(false);
    const [swrError, setSwrError] = useState<Error | null>(null);

    useEffect(() => {
        if (!cacheKey) {
            setCachedTracks(null);
            setCacheChecked(false);
            setSwrError(null);
            return;
        }

        setCachedTracks(null);
        setCacheChecked(false);
        setSwrError(null);
        let isSubscribed = true;

        const checkCache = async () => {
            const cached = await playlistTracksCache.get(cacheKey);
            if (!isSubscribed) return;
            setCacheChecked(true);

            if (cached) {
                setCachedTracks(cached);
                const isStale = playlistTracksCache.isStale(cacheKey, 5 * 60 * 1000);

                if (accessToken && isStale) {
                    playlistTracksCache.fetchWithDeduplication(cacheKey, () =>
                        authenticatedCall(async (token) => {
                            const response = await getPlaylistTracks({
                                playlistId: playlistId!,
                                limit: expectedTotal ?? 1000,
                                offset: 0,
                                accessToken: token,
                            });
                            if (response.items && response.items.length > 0) {
                                if (isSubscribed) {
                                    setCachedTracks(response.items);
                                    setSwrError(null);
                                }
                                return response.items;
                            }
                            return cached;
                        })
                    ).catch((err) => {
                        Logger.error('[usePlaylistTracksLazy] Revalidation failed:', err);
                        if (isSubscribed) setSwrError(err instanceof Error ? err : new Error(String(err)));
                    });
                }
            }
        };

        checkCache();
        return () => { isSubscribed = false; };
    }, [cacheKey, accessToken, authenticatedCall]);

    const pagination = useLazyPagination<Track>({
        key: playlistId ?? null,
        fetcher: async (offset, limit) => {
            const response = await getPlaylistTracks({
                playlistId: playlistId!,
                limit,
                offset,
                accessToken: accessToken!,
            });
            return {
                items: response.items,
                total: expectedTotal ?? response.count_item,
            };
        },
        batchSize: 10,
        expectedTotal,
        enabled: !!playlistId && !!accessToken && cacheChecked && !cachedTracks,
    });

    useEffect(() => {
        if (
            cacheKey &&
            pagination.dataKey === playlistId &&
            pagination.items.length > 0 &&
            pagination.totalCount &&
            pagination.items.length >= pagination.totalCount &&
            !pagination.hasMore
        ) {
            playlistTracksCache.set(cacheKey, pagination.items);
        }
    }, [cacheKey, pagination.items, pagination.totalCount, pagination.hasMore, pagination.dataKey, playlistId]);

    // L'erreur est prioritaire sur les données si elle est présente (même avec du cache)
    const error = authError || swrError || pagination.error;

    if (error) {
        return {
            tracks: null,
            loading: false,
            error,
            isLoadingMore: false,
            totalCount: 0,
        };
    }

    if (cachedTracks) {
        return {
            tracks: cachedTracks,
            loading: false,
            error: null,
            isLoadingMore: false,
            totalCount: cachedTracks.length,
        };
    }

    return {
        tracks: pagination.items.length > 0 ? pagination.items : null,
        loading: pagination.loading && !cacheChecked,
        error: null, // Déjà géré au dessus
        isLoadingMore: pagination.loadingMore,
        totalCount: pagination.totalCount,
    };
}
