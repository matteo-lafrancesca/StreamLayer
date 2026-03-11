import { useState, useEffect } from 'react';

// Retarde l'affichage du contenu jusqu'à ce que les images soient prêtes à être décodées
// Évite le clignotement des placeholders en gardant le contenu invisible au début
export function useImageReadyState(isLoading: boolean, delay = 50): boolean {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Small delay to let browser decode images
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isLoading, delay]);

    return isVisible;
}
