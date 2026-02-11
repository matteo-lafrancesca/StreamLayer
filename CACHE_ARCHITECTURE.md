# Cache System Architecture

## Overview

The StreamLayer cache system has been refactored into a clean, 3-layer architecture that separates concerns and promotes reusability.

## Architecture

```
┌─────────────────────────────────────────┐
│   BUSINESS HOOKS (Domain-specific)     │
│  usePlaylistTracks, useAlbumCover, etc  │
└──────────────┬──────────────────────────┘
               │ use
┌──────────────▼──────────────────────────┐
│   GENERIC CACHE HOOKS                   │
│  useCachedData, useCachedImage          │
└──────────────┬──────────────────────────┘
               │ use
┌──────────────▼──────────────────────────┐
│   CACHE LAYER                           │
│  CacheManager (Memory + IndexedDB)      │
└─────────────────────────────────────────┘
```

## Core Components

### 1. Cache Layer (`src/cache/`)

#### `CacheManager.ts`
Unified cache manager that handles both memory (Map) and persistent (IndexedDB) caching.

**Features:**
- Memory cache with LRU eviction
- IndexedDB persistence via `PersistentCache`
- Request deduplication
- TTL management
- Configurable max items

**Usage:**
```typescript
const cache = createCacheManager<MyData>('data', {
  ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  maxItems: 100,
});

// Get from cache (Memory → Disk)
const data = await cache.get('my-key');

// Set to cache (Memory + Disk)
await cache.set('my-key', myData);

// Fetch with deduplication
const result = await cache.fetchWithDeduplication('my-key', () => fetchData());
```

#### `cacheStrategies.ts`
Reusable cache strategies for common patterns.

**Strategies:**
- `cacheFirst`: Memory → Disk → Network (default)
- `networkFirst`: Network → Cache fallback
- `staleWhileRevalidate`: Return cached, fetch in background
- `cacheOnly`: Only return cached data

### 2. Generic Hooks (`src/hooks/cache/`)

#### `useCachedData.ts`
Generic hook for caching any JSON data.

**Usage:**
```typescript
const { data, loading, error, refetch } = useCachedData({
  key: 'my-data-key',
  fetcher: (token) => fetchMyData(token),
});
```

**Features:**
- Automatic authentication handling
- Memory + IndexedDB caching
- Request deduplication
- Manual refetch support

#### `useCachedImage.ts`
Generic hook for caching images (Blobs).

**Usage:**
```typescript
const imageUrl = useCachedImage({
  key: `image-${id}-${size}`,
  fetcher: () => fetchImage(id, size, token),
  debounce: 200,
});
```

**Features:**
- Memory cache (blob URLs)
- IndexedDB persistence (Blobs)
- Debouncing
- Automatic blob URL management

#### `useLazyPagination.ts`
Generic hook for lazy pagination.

**Usage:**
```typescript
const { items, loading, loadingMore, hasMore } = useLazyPagination({
  key: 'my-list',
  fetcher: (offset, limit) => fetchPage(offset, limit),
  batchSize: 10,
});
```

**Features:**
- Batch loading for fast initial render
- Automatic background loading
- Progress tracking

### 3. Business Hooks (`src/hooks/`)

Business hooks now use the generic cache hooks, making them much simpler.

#### Before (179 lines):
```typescript
// usePlaylistTracksLazy.ts - OLD
// Mixed cache logic + pagination + business logic
```

#### After (115 lines):
```typescript
// usePlaylistTracksLazy.ts - NEW
const { data: cachedTracks } = useCachedData({ ... });
const pagination = useLazyPagination({ ... });
```

**Refactored hooks:**
- `usePlaylistTracksLazy` (179 → 115 lines)
- `useAlbumCover` (simplified)
- `usePlaylistCover` (simplified)
- `usePlaylists` (simplified)

## Cache Flow

### Data Caching (JSON)
```
1. useCachedData called
2. Check Memory Cache (instant)
3. If miss → Check IndexedDB (async)
4. If miss → Fetch from Network
5. Store in Memory + IndexedDB
6. Return data
```

### Image Caching (Blobs)
```
1. useCachedImage called
2. Check Memory Cache (blob URL)
3. If miss → Check IndexedDB (Blob)
4. If miss → Fetch from Network
5. Convert to Blob → Store in IndexedDB
6. Create blob URL → Store in Memory
7. Return blob URL
```

## Benefits

✅ **Clarity**: Clear separation of concerns  
✅ **Reusability**: Single source of truth for caching  
✅ **Maintainability**: Easier to understand and modify  
✅ **Testability**: Each layer testable independently  
✅ **Consistency**: Same caching strategy everywhere  
✅ **Performance**: Optimized with request deduplication  

## Migration Guide

### From `useDataFetcher` to `useCachedData`

```typescript
// OLD
const { data, loading, error } = useDataFetcher({
  fetcher: (token) => fetchData(token),
  cacheKey: 'my-key',
  cacheMap: myCache,
});

// NEW
const { data, loading, error } = useCachedData({
  key: 'my-key',
  fetcher: (token) => fetchData(token),
});
```

### From `useDebouncedImage` to `useCachedImage`

```typescript
// OLD
const imageUrl = useDebouncedImage(shouldLoad, cacheKey, fetchFn, 200);

// NEW
const imageUrl = useCachedImage({
  key: shouldLoad ? cacheKey : null,
  fetcher: fetchFn,
  debounce: 200,
});
```

## Deprecated Hooks

The following hooks are deprecated and will be removed in a future version:
- `useDataFetcher` → Use `useCachedData`
- `useDebouncedImage` → Use `useCachedImage`

Both files contain migration examples in their deprecation notices.
