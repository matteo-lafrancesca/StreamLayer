# StreamLayer Widget - Guide d'Intégration

## Installation

### Via npm (si publié)
```bash
npm install stream-layer
```

### Via CDN (UMD)
```html
<!-- React (peer dependency) -->
<script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>

<!-- StreamLayer Widget -->
<link rel="stylesheet" href="https://unpkg.com/stream-layer/dist/stream-layer.css">
<script src="https://unpkg.com/stream-layer/dist/stream-layer.umd.js"></script>
```

## Usage Vanilla JavaScript (UMD)

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreamLayer Widget Demo</title>
  
  <!-- Dependencies -->
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  
  <!-- StreamLayer -->
  <link rel="stylesheet" href="./dist/stream-layer.css">
  <script src="./dist/stream-layer.umd.js"></script>
</head>
<body>
  <div id="stream-layer-widget"></div>

  <script>
    // Initialize widget using named exports
    const cleanup = StreamLayer.initStreamLayer({
      projectId: '34',
      containerId: 'stream-layer-widget',
      onReady: () => {
        console.log('StreamLayer widget is ready!');
      },
      onError: (error) => {
        console.error('StreamLayer error:', error);
      }
    });

    // Cleanup when needed (e.g., SPA navigation)
    // cleanup();
  </script>
</body>
</html>
```

## Usage React (ESM)

```tsx
import { StreamLayerWidget } from 'stream-layer';
import 'stream-layer/style.css';

function App() {
  return (
    <div>
      <h1>Mon Application</h1>
      <StreamLayerWidget projectId="34" />
    </div>
  );
}

export default App;
```

## Options de Configuration

### StreamLayerConfig

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `projectId` | `string` | ✅ | ID du projet à charger |
| `containerId` | `string` | ❌ | ID du conteneur DOM (défaut: `'stream-layer-widget'`) |
| `apiUrl` | `string` | ❌ | URL personnalisée de l'API |
| `onReady` | `() => void` | ❌ | Callback appelé quand le widget est prêt |
| `onError` | `(error: Error) => void` | ❌ | Callback appelé en cas d'erreur |

## API Methods

### `initStreamLayer(config: StreamLayerConfig): () => void`

Initialise le widget dans un conteneur DOM.

**Retourne** : Une fonction de nettoyage pour détruire l'instance.

### `destroyStreamLayer(containerId?: string): void`

Détruit une instance du widget et nettoie les ressources.

## Isolation CSS

Le widget utilise un préfixe `sl-` pour toutes ses classes CSS afin d'éviter les conflits avec les styles de la page hôte. Le CSS est automatiquement scopé via CSS Modules.

## Compatibilité

- **React** : 19.x (peer dependency)
- **Navigateurs** : Chrome, Firefox, Safari, Edge (dernières versions)
- **Build Tools** : Compatible Webpack, Vite, Rollup, Parcel

## Troubleshooting

### Le widget ne s'affiche pas

Vérifiez que :
1. React et ReactDOM sont chargés avant StreamLayer
2. Le conteneur DOM existe dans le HTML
3. Le CSS est bien importé
4. Le `projectId` est valide

### Conflits de styles CSS

Le widget utilise CSS Modules avec préfixe `sl-`. Si vous rencontrez des conflits :
1. Vérifiez que le CSS du widget est chargé après vos styles
2. Utilisez la spécificité CSS si nécessaire
3. Évitez les sélecteurs globaux trop génériques
