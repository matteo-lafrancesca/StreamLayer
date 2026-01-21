import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { useDataFetcher } from './useDataFetcher';

// Cache simple en mémoire pour les albums (données)
const albumsCache = new Map<number, Album>();
// Cache pour les requêtes en cours (promesses)
const albumsPromiseCache = new Map<number, Promise<Album>>();

interface UseAlbumResult {
    album: Album | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook pour récupérer les informations d'un album
 * @param albumId - L'ID de l'album (null si non nécessaire)
 * @returns Album, état de chargement et erreur éventuelle
 */
export function useAlbum(albumId: number | null | undefined): UseAlbumResult {
    const { data: album, loading, error } = useDataFetcher<Album>({
        fetcher: (token) => getAlbumInfo(albumId!, token),
        cacheKey: albumId!,
        cacheMap: albumsCache,
        inFlightMap: albumsPromiseCache,
        enabled: !!albumId,
    });

    return { album, loading, error };
}

