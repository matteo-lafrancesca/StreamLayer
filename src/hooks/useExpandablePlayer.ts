import { useHeightAnimation } from './useHeightAnimation';
import { useOpacityAnimation } from './useOpacityAnimation';
import { usePlayer } from '@context/PlayerContext';

/**
 * Shared hook for expandable player functionality
 * Used by both PlayerDesktop and PlayerMobile to manage expansion state,
 * view navigation, and animations
 */
export function useExpandablePlayer() {
    // Get expansion state from global context (shared between mobile and desktop)
    const { isExpanded, setIsExpanded, currentView, setCurrentView } = usePlayer();

    // Height animation (300ms)
    const playerRef = useHeightAnimation({
        isExpanded,
        collapsedHeight: 72,
        expandedHeight: 600,
        duration: 300,
    });

    // Opacity animation for content
    const contentOpacity = useOpacityAnimation({
        isVisible: isExpanded,
        duration: 300,
        delay: 200,
    });

    // Handler for expand toggle
    const onExpandToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return {
        // State
        isExpanded,
        currentView,
        setCurrentView,

        // Animation refs
        playerRef,
        contentOpacity,

        // Handlers
        onExpandToggle
    };
}

