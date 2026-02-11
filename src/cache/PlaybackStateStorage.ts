/**
 * Playback State Storage
 * Persists playback state to IndexedDB for restoration on page reload
 */

import { persistentCache } from './PersistentCache';

export interface PlaybackState {
    /** ID of the playlist being played */
    playlistId: number | null;
    /** ID of the current track */
    trackId: number | null;
    /** Current index in the queue */
    currentIndex: number;
    /** Whether shuffle is enabled */
    isShuffled: boolean;
    /** Repeat mode */
    repeatMode: 'off' | 'all' | 'one';
    /** Current playback position in seconds */
    currentTime: number;
    /** Volume level (0-100) */
    volume: number;
    /** Timestamp when state was saved */
    timestamp: number;
}

const PLAYBACK_STATE_KEY = 'playback-state';
const STATE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Save playback state to IndexedDB
 */
export async function savePlaybackState(state: Omit<PlaybackState, 'timestamp'>): Promise<void> {
    const stateWithTimestamp: PlaybackState = {
        ...state,
        timestamp: Date.now(),
    };

    try {
        await persistentCache.set('data', PLAYBACK_STATE_KEY, stateWithTimestamp);
        console.log('[PlaybackStateStorage] State saved:', stateWithTimestamp);
    } catch (error) {
        console.error('[PlaybackStateStorage] Failed to save state:', error);
    }
}

/**
 * Load playback state from IndexedDB
 * Returns null if no state exists or if state is too old
 */
export async function loadPlaybackState(): Promise<PlaybackState | null> {
    try {
        const state = await persistentCache.get<PlaybackState>('data', PLAYBACK_STATE_KEY);

        if (!state) {
            console.log('[PlaybackStateStorage] No saved state found');
            return null;
        }

        // Check if state is too old
        const age = Date.now() - state.timestamp;
        if (age > STATE_TTL) {
            console.log('[PlaybackStateStorage] State too old, clearing');
            await clearPlaybackState();
            return null;
        }

        console.log('[PlaybackStateStorage] State loaded:', state);
        return state;
    } catch (error) {
        console.error('[PlaybackStateStorage] Failed to load state:', error);
        return null;
    }
}

/**
 * Clear playback state from IndexedDB
 */
export async function clearPlaybackState(): Promise<void> {
    try {
        await persistentCache.delete('data', PLAYBACK_STATE_KEY);
        console.log('[PlaybackStateStorage] State cleared');
    } catch (error) {
        console.error('[PlaybackStateStorage] Failed to clear state:', error);
    }
}
