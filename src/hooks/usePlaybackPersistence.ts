/**
 * Hook to manage playback state persistence
 * Automatically saves state to IndexedDB with debouncing
 */

import { useEffect, useRef, useCallback } from 'react';
import { savePlaybackState, loadPlaybackState, type PlaybackState } from '@cache/PlaybackStateStorage';

interface UsePlaybackPersistenceOptions {
    playlistId: number | null;
    trackId: number | null;
    currentIndex: number;
    isShuffled: boolean;
    repeatMode: 'off' | 'all' | 'one';
    currentTime: number;
    volume: number;
    /** Debounce delay in ms (default: 2000) */
    debounceMs?: number;
    /** Whether to enable auto-save (default: true) */
    enabled?: boolean;
}

interface UsePlaybackPersistenceReturn {
    /** Manually restore state from IndexedDB */
    restoreState: () => Promise<PlaybackState | null>;
    /** Manually trigger save (bypasses debounce) */
    saveNow: () => Promise<void>;
}

/**
 * Hook to persist playback state to IndexedDB
 * 
 * Features:
 * - Debounced auto-save (default 2s)
 * - Manual restore on mount
 * - Manual save trigger
 * 
 * @example
 * const { restoreState } = usePlaybackPersistence({
 *   playlistId: currentPlaylist?.id,
 *   trackId: currentTrack?.id,
 *   currentIndex,
 *   isShuffled,
 *   repeatMode,
 *   currentTime,
 *   volume,
 * });
 * 
 * // On mount, restore state
 * useEffect(() => {
 *   const restored = await restoreState();
 *   if (restored) {
 *     // Apply restored state
 *   }
 * }, []);
 */
export function usePlaybackPersistence({
    playlistId,
    trackId,
    currentIndex,
    isShuffled,
    repeatMode,
    currentTime,
    volume,
    debounceMs = 2000,
    enabled = true,
}: UsePlaybackPersistenceOptions): UsePlaybackPersistenceReturn {
    const saveTimeoutRef = useRef<number | undefined>(undefined);

    // Store state in ref to avoid stale closures
    const stateRef = useRef({
        playlistId,
        trackId,
        currentIndex,
        isShuffled,
        repeatMode,
        currentTime,
        volume,
    });

    // Update ref when state changes
    useEffect(() => {
        stateRef.current = {
            playlistId,
            trackId,
            currentIndex,
            isShuffled,
            repeatMode,
            currentTime,
            volume,
        };
    }, [playlistId, trackId, currentIndex, isShuffled, repeatMode, currentTime, volume]);

    // Debounced auto-save
    useEffect(() => {
        if (!enabled) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Schedule save
        saveTimeoutRef.current = setTimeout(() => {
            savePlaybackState(stateRef.current);
        }, debounceMs);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [playlistId, trackId, currentIndex, isShuffled, repeatMode, currentTime, volume, enabled, debounceMs]);

    // Manual restore
    const restoreState = useCallback(async (): Promise<PlaybackState | null> => {
        return await loadPlaybackState();
    }, []);

    // Manual save
    const saveNow = useCallback(async (): Promise<void> => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        await savePlaybackState(stateRef.current);
    }, []);

    return {
        restoreState,
        saveNow,
    };
}
