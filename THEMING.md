# Système de Thèmes StreamLayer

Le système de thèmes du widget StreamLayer a été simplifié pour offrir un maximum de flexibilité avec un minimum d'effort de configuration.

## Fonctionnement

Le widget génère dynamiquement l'intégralité de son apparence à partir de seulement **deux couleurs de base** :

- **`primary`** : La couleur "Ambiance". Elle définit la teinte de fond du lecteur. Le widget génère automatiquement un environnement sombre et premium basé sur cette couleur.
- **`secondary`** : La couleur "Action". Elle est utilisée pour tous les éléments interactifs : boutons, barre de progression (seek bar), réglage du volume, et accents visuels.

**Tout le reste est automatique** : le widget calcule lui-même les nuances claires et sombres nécessaires, ainsi qu'un fond sombre élégant et thématique dérivé de votre couleur primaire pour assurer un rendu "premium" et cohérent sans aucune configuration supplémentaire.

## Utilisation

Il existe deux manières de configurer le thème selon la façon dont vous intégrez le widget.

### 1. Intégration via la balise `<script>` (HTML classique)

Utilisez les attributs de données (`data-*`) pour définir vos couleurs au format hexadécimal :

```html
<script 
    src="https://cdn.streamlayer.com/stream-layer.umd.js" 
    data-project-id="..."
    data-theme-primary="#6366f1" 
    data-theme-secondary="#8b5cf6">
</script>
```

### 2. Intégration via React (Composant `<StreamLayer />`)

Passez un objet à la prop `theme` :

```tsx
import { StreamLayer } from 'streamlayer-widget';

function App() {
  const customTheme = {
    primary: '#6366f1',
    secondary: '#8b5cf6'
  };

  return (
    <StreamLayer
      theme={customTheme}
      {...apiProps}
    />
  );
}
```

## Couleurs et Contraste

Pour garantir que l'interface reste toujours lisible :
- Utilisez des codes **hexadécimaux** valides (ex: `#6366f1`).
- Le widget opte par défaut pour une esthétique sombre (dark) dont le fond est subtilement teinté par votre couleur primaire pour un aspect plus intégré et professionnel.
