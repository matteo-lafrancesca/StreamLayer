# Avancement Stream Layer

Voici l'état d'avancement du projet StreamLayer, ses fonctionnalités son intégration et les évolutions futures.

---

## 1. Résumé et Fonctionnalités

**StreamLayer** est un lecteur audio en streaming modulaire, conçu pour s'intégrer facilement dans des applications Web (via Widget/NPM) et Mobiles (via Capacitor). Son objectif est d'offrir une expérience d'écoute fluide tout en étant facilement intégrable.

### Fonctionnalités Clés

- **Modes d'Affichage Adaptatifs** :
  - **Compact** : Barre discrète en bas d'écran avec contrôles de l'état du player.
  - **Étendu** : Interface complète avec playlists du projet, sélection des tracks, file d'attente.
  - **Responsive** : Interface adaptée pour un affichage sur mobile plus pratique avec une barre de lecture plus minimaliste et une vue track pour un meilleur contrôle du player.
- **Navigation & Organisation** :
  - **Vue Projet** : Navigation entre différentes playlists.
  - **Vue Playlist** : Liste des pistes d'une playlist.
  - **File d'attente (Queue)** : Gestion des morceaux à venir.
- **Contrôles Audio Avancés** :
  - Play/Pause, Précédent/Suivant, Lecture aléatoire (Shuffle), Répétition (Repeat All/One).
  - Contrôle du volume et barre de progression interactive.
  - Streaming adaptatif HLS (via `hls.js`).
- **Expérience Utilisateur** :
- 
  - Animations fluides et design responsive (Mobile/Tablette/Desktop).
  - Préchargement des tracks et des cover pour une fluidité de l'interface
  - Mise en cache des playlists, des tracks et des covers pour limiter les temps de chargement

---

## 2. Intégration et Utilisation

StreamLayer peut être intégré de deux manières principales : comme librairie NPM ou comme Widget UMD.

Après avoir effectué `npm run build` des scripts ES et UMD sont créés permettant d'utiliser le player sur d'autres sites web

### A. Via NPM (Local ou Privé)

*Le paquet n'est pas publié sur le registre public NPM.*

**Installation depuis un dossier local :**

```bash
npm install ../path/to/stream-layer
```

**Utilisation :**

```jsx
import { StreamLayerWidget } from 'stream-layer';
import 'stream-layer/style.css';

function App() {
  return (
    <div className="App">
      <StreamLayerWidget projectId="YOUR_PROJECT_ID" />
    </div>
  );
}
```

Cette méthode permet d'utiliser le projet localement comme une librairie externe.

La commande d'installation crée un lien vers le dossier StreamLayer.

Quand on fait un import, Node.js regarde la section `exports` du `package.json` de StreamLayer :

```json
"exports": {
  ".": {
    "import": "./dist/stream-layer.es.js", // Code JS optimisé (ES Module)
    "types": "./dist/widget.d.ts"          // Définitions TypeScript
  },
  "./style.css": "./dist/stream-layer.css" // Fichier de style CSS
}
```

* `import { ... } from 'stream-layer'` charge le fichier `./dist/stream-layer.es.js`.
* `import 'stream-layer/style.css'` charge le fichier `./dist/stream-layer.css`.

### B. Via CDN / UMD (Site Web Classique)

Idéal pour intégrer le lecteur sur un site WordPress, PHP, ou statique sans build process complexe.

J'ai quand même réussi à utiliser le script UMD sur beaute-job mais j'ai du créer un petit composant qui charge le script au démarrage pour passer les analyses du build Webpack.

*Actuellement le script doit être hébergé localement, un CDN peut être mis en place plus tard.*

```html
<!-- StreamLayer (Local) -->
<!-- Remplacez le chemin ./dist par l'URL de votre CDN futur ou chemin local -->
<script src="./dist/stream-layer.umd.js" data-project-id="34" data-container-id="stream-layer-widget"></script>

<!-- Conteneur (ID doit correspondre au data-container-id du script) -->
<div id="stream-layer-widget"></div>
```

### C. App Mobile Native

Le projet peut être compilé en application Android native grâce à **Capacitor**.

1. **Build de l'application Web** :
   
   ```bash
   npm run build:app
   ```
   
   Cela génère l'application dans le dossier `dist-app` (distinct du build `dist` de la librairie).

2. **Synchronisation avec Capacitor** :
   
   ```bash
   npm run mobile:sync
   ```
   
   Copie les fichiers web vers le projet natif Android.

3. **Lancement du projet Android** :
   
   ```bash
   npm run mobile:android
   ```
   
   Ouvre Android Studio pour compiler l'APK ou lancer sur un émulateur.

J'ai réussi à lancer l'apk sur Appetize pour vérifier si la config Capacitor fonctionnait, mais je n'ai pas pu lancer l'émulation sur ma machine, l'emulateur ne répond pas. Je n'ai donc pas pu complétement tester l'app native pour le moment.

---

## 3. Choses Manquantes et Évolutions

### Bugs Connus & Limitations

* **État Playlist** : Gestion des playlists vides et synchronisation du scroll parfois défaillante.
* **Audio** : Parfois la musique ne se lance pas (problème d'état initial ou interaction browser policy), "Seeking" qui lag.
* **UI** : Barre de son laissant des artefacts visuels, chargement lent des pochettes.
* **Mobile** : Progress bar perfectible sur certains navigateurs mobiles.

### Évolutions Futures (Roadmap)

1. **Mode Offline** :
   * Téléchargement des pistes pour écoute sans réseau.
   * Gestion intelligente du cache (Service Workers).
2. **Analytics Poussés** :
   * Suivi précis du temps d'écoute par morceau/utilisateur.
   * Envoi par batch pour ne pas surcharger le réseau.
3. **Accessibilité (A11y)** :
   * Renforcer la navigation clavier complète.
   * Meilleur support des lecteurs d'écran (Screen Readers).
4. **Optimisations** :
   * Réduire la taille du bundle (Code Splitting).
   * Améliorer la performance du rendu des longues listes (Virtual Scrolling).
