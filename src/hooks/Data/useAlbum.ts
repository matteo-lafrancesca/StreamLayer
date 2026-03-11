import { getAlbumInfo } from '@services/api/albums';
import type { Album } from '@definitions/album';
import { useCachedData } from '../cache/useCachedData';
import { albumsCache } from '@cache/managers';

interface UseAlbumResult {
    album: Album | null;
    loading: boolean;
    error: Error | null;
}

// Récupère les détails d'un album avec gestion du cache
export function useAlbum(albumId: number | null | undefined): UseAlbumResult {
    const { data: album, loading, error } = useCachedData<Album>({
        key: albumId ?? null,
        fetcher: (token) => getAlbumInfo(albumId!, token),
        enabled: !!albumId,
        cacheManager: albumsCache,
    });

    return { album, loading, error };
}
