import { useState, useEffect } from 'react';

/**
 * Hook pour gérer l'affichage instantané après chargement des images
 * Évite le flash des placeholders en rendant le contenu invisible jusqu'à ce que tout soit prêt
 * 
 * @param isLoading - Indique si le contenu est en cours de chargement
 * @param delay - Délai en ms pour laisser le navigateur décoder les images (défaut: 50ms)
 * @returns isVisible - true quand le contenu peut être affiché
 */
export function useImageReadyState(isLoading: boolean, delay = 50): boolean {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            // Petit délai pour laisser le navigateur décoder les images
            const timer = setTimeout(() => setIsVisible(true), delay);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isLoading, delay]);

    return isVisible;
}
