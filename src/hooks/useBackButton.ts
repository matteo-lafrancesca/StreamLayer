import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { usePlayerUI } from '@context/PlayerUIContext';

/**
 * Hook to handle the native Android back button/gesture.
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
                if (currentView === 'playlist') {
                    setCurrentView('project');
                } else if (currentView === 'project') {
                    setCurrentView('track');
                } else if (currentView === 'queue') {
                    setCurrentView('track');
                } else {
                    setIsExpanded(false);
                }
            } else {
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
