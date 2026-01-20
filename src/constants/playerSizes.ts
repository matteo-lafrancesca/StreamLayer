/**
 * Player size constants
 * Centralized constants for all player dimensions and icon sizes
 */
export const PLAYER_SIZES = {
    DESKTOP: {
        COLLAPSED_HEIGHT: 72,
        EXPANDED_HEIGHT: 600,
        COMPACT_WIDTH: 220,
        ICON_SMALL: 18,
        ICON_MEDIUM: 20,
        ICON_LARGE: 24,
        PLAY_BUTTON: 56,
    },
    MOBILE: {
        COLLAPSED_HEIGHT: 72,
        ICON_SMALL: 24,
        ICON_SKIP: 28,
        PLAY_BUTTON: 30,
        CHEVRON: 28,
    },
    SWIPE_THRESHOLD: 150,
    PLAYER_BOTTOM_MARGIN: 20,
} as const;
