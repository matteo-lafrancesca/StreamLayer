/**
 * Instances centralisées des gestionnaires de cache.
 */
import { createCacheManager } from './CacheManager';
import type { Playlist } from '@definitions/playlist';
import type { Album } from '@definitions/album';
import type { Track } from '@definitions/track';

export const playlistsCache = createCacheManager<Playlist[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 20,
});

export const albumsCache = createCacheManager<Album>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 100,
});

export const playlistTracksCache = createCacheManager<Track[]>('data', {
    ttl: 7 * 24 * 60 * 60 * 1000,
    maxItems: 50,
});

export const imageBlobCache = createCacheManager<Blob>('images', {
    ttl: 30 * 24 * 60 * 60 * 1000,
    maxItems: 500,
});
