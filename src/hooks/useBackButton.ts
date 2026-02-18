import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { usePlayerUI } from '@context/PlayerUIContext';

/**
 * Hook to handle the native Android back button/gesture.
 * 1. Playlist -> Project
 * 2. Project -> Track (Lecteur)
 * 3. Track -> Collapse Player
 * 4. Collapsed -> Double Back to Exit App
 */
export function useBackButton() {
    const {
        currentView,
        setCurrentView,
        isExpanded,
        setIsExpanded,
    } = usePlayerUI();

    const lastBackPress = useRef<number>(0);

    useEffect(() => {
        const handler = App.addListener('backButton', () => {
            if (isExpanded) {
                // If the player is expanded, navigate back within it
                if (currentView === 'playlist') {
                    setCurrentView('project');
                } else if (currentView === 'project') {
                    setCurrentView('track');
                } else if (currentView === 'queue') {
                    setCurrentView('track');
                } else {
                    // We are in 'track' view, so we collapse
                    setIsExpanded(false);
                }
            } else {
                // Player is already collapsed -> Double Back to Exit
                const now = Date.now();
                if (now - lastBackPress.current < 2000) {
                    App.exitApp();
                } else {
                    lastBackPress.current = now;
                    Toast.show({
                        text: 'Appuyez à nouveau pour quitter',
                        duration: 'short',
                        position: 'bottom',
                    });
                }
            }
        });

        return () => {
            handler.then(h => h.remove());
        };
    }, [isExpanded, currentView, setCurrentView, setIsExpanded]);
}
