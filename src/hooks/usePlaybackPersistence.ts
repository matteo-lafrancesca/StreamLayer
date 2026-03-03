/**
 * Hook to manage playback state persistence
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

    const stateRef = useRef({
        playlistId,
        trackId,
        currentIndex,
        isShuffled,
        repeatMode,
        currentTime,
        volume,
    });

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

    useEffect(() => {
        if (!enabled) return;
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            savePlaybackState(stateRef.current);
        }, debounceMs);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [playlistId, trackId, currentIndex, isShuffled, repeatMode, currentTime, volume, enabled, debounceMs]);

    const restoreState = useCallback(async (): Promise<PlaybackState | null> => {
        return await loadPlaybackState();
    }, []);

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
