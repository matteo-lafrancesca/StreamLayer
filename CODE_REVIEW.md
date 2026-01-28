# Code Review: StreamLayer

**Date:** 2026-01-28
**Reviewer:** "Pro" Agentic Assistant

## 🚨 Critical Issues (Must Fix)

These issues can cause runtime errors, crashes, or unpredictable behavior.

### 1. Conditional Hook Call in `useApi.ts`
**File:** `src/hooks/useApi.ts` (Line 11)
```typescript
const authContext = providedAccessToken === undefined ? useAuth() : null;
```
**Problem:** React Hooks (`useAuth`) **must** be called in the exact same order on every component render. Calling them conditionally violates the [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning) and will cause the application to crash if the condition changes or in strict mode.
**Fix:** Always call the hook and ignore the result if not needed.
```typescript
const authContext = useAuth();
const { /* ... */ } = providedAccessToken === undefined ? authContext : {};
```

### 2. State Duplication & Synchronization Loops
**File:** `src/context/PlayerContext.tsx`
**Problem:** The `PlayerContext` duplicates state that already exists in `QueueManager`.
- `playingTrack` in context is synced via `useEffect` from `queueManager.currentTrack`.
- This creates a "State Ping-Pong": `QueueManager` updates -> Component Renders -> `useEffect` fires -> `setPlayingTrack` -> Component Renders again.
**Fix:** Derive `playingTrack` directly during render.
```typescript
// instead of useState + useEffect
const playingTrack = queueManager.currentTrack;
```

## ⚠️ Major Architectural Issues

These issues affect performance, maintainability, and code cleanliness.

### 1. Sync `setState` in `useEffect` (Cascading Renders)
**Files:** `TrackViewMobile.tsx`, `PlayerContext.tsx`, `useAudioPlayer.ts`, `Slider.tsx`
**Problem:** There are pervasive warnings about calling `setState` synchronously inside `useEffect`. This forces React to render, then immediately render again (a "cascade"), doubling the work for the main thread.
- **Example (`TrackViewMobile.tsx`):** Animation logic sets state immediately upon prop change detection.
- **Example (`useAudioPlayer.ts`):** `setAudioElement(audio)` inside the mount effect.

### 2. Fast Refresh De-optimizations
**Files:** `PlayerContext.tsx`, `AssetCacheContext.tsx`
**Problem:** These files export helper functions or constants alongside the React Component/Context.
```typescript
export const CONSTANT = ...
export function Provider() { ... }
```
**Impact:** This breaks Vite's HMR (Hot Module Replacement) for these files. When you save them, the entire page reloads instead of just the component updating, slowing down development.
**Fix:** Move constants and non-hook helpers to separate files (e.g., `src/utils/` or `src/constants/`).

## 🔍 Code Quality & Best Practices

### 1. `any` Type Usage
**Files:** `useApi.ts`, `useDataFetcher.ts`
**Observation:** `catch (error: any)` is standard, but `useDataFetcher.ts` has `Unexpected any`.
**Recommendation:** Use `unknown` for errors and narrow valid types with type guards (e.g., `instanceof Error`).

### 2. Audio Element Lifecycle
**File:** `useAudioPlayer.ts`
**Observation:** The audio element is created effectively as a side-effect, but also stored in state.
**Recommendation:** Since the `Audio` element is imperative, using `useRef` to hold the instance is correct. Putting it in `useState` (`setAudioElement`) contributes to the re-render issues. If you need to trigger updates based on audio events, bind specific state atoms (like `isPlaying`, `currentTime`) to those events, rather than storing the full heavy object in state.

### 3. Missing Dependency Arrays
**File:** `usePlaylists.ts` (Line 125), `usePreloadPlaylistImages.ts` (Line 79)
**Observation:** `useEffect` hooks with missing dependencies. This usually indicates a bug where the effect uses stale closure values or doesn't re-run when it should.

## 💡 Suggestions for Improvement

1.  **Centralize Constants:** You have started this (`src/constants/`), which is great. Continue moving "magic numbers" (like animation durations in `TrackViewMobile`) there.
2.  **Strict Mode Compliance:** The sheer number of `useEffect` double-invocation issues suggests the app might behave weirdly in React Strict Mode (which runs effects twice in dev). Fixing the "Sync setState" issues is key here.
3.  **Animation Library:** `TrackViewMobile` implements manual JS-based animations with timeouts. Consider using `framer-motion` or generic CSS transitions triggered by class changes to simplify the logic and improve smoothness.
