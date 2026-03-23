# StreamLayer

StreamLayer est un lecteur audio conçu pour être intégré facilement, soit comme un widget sur n'importe quel site web (via un script UMD), soit comme une application mobile native (via Capacitor).

--- 

## Installation

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration (.env)

Créez un fichier `.env` à la racine (basez-vous sur `.env_example`) :

```bash
VITE_API_KEY_ID=votre_cle_id
VITE_API_BASE_URL=https://votre-api.com
VITE_USER_API=votre_user
VITE_PASSWORD_API=votre_password
```

### 3. Lancer en développement

```bash
npm run dev
```

---

## Architecture

### 1. `components/` - L'UI et l'Interface

- **`Player/`** : Le cœur fonctionnel.
  - `Player.tsx` : Le point d'entrée qui orchestre l'affichage selon le device (Desktop vs Mobile).
  - `Desktop/` & `Mobile/` : Contiennent les layouts spécifiques à chaque plateforme.
  - `Views/` : Gère le système de navigation interne du player (ProjectView pour la liste des albums, PlaylistView pour les morceaux, QueueView pour la file d'attente).
  - `Common/` : Composants partagés comme la barre de progression, les réglages de volume ou les pochettes d'album.
- **`UI/`** : Bibliothèque de composants réutilisables (Boutons, Sliders, Cartes, IconButtons).
- **`StreamLayer.tsx`** : Le wrapper principal qui injecte les providers et l'ErrorBoundary.

### 2. `context/` - Gestion de l'État

On utilise React Context pour découper la logique globale :

- **`PlayerContext`** : Se concentre sur le flux audio pur (HLS.js, lecture/pause, gestion physique de la file d'attente, préchargement).
- **`PlayerUIContext`** : Gère l'expérience utilisateur (mode compact/étendu, thémage dynamique).
- **`AuthContext`** : Gère l'authentification silencieuse à l'API via le `projectId` et la persistance du token.

### 3. `services/` & `api/` - Gestion des données

- **`api/client.ts`** : Instance Axios configurée pour injecter les tokens.
- **Services métiers** : `tracks.ts`, `playlists.ts`, `albums.ts` exportant les appels aux endpoints.
- **`tokenManager.ts`** : Logique de refresh automatique.
- **`reporting.ts`** : Envoi des statistiques d'écoute.
- **`covers.ts`** : Logique de transformation des URLs d'images.

### 4. `hooks/` - Logique métier isolée

Les hooks sont classés par domaine pour éviter de surcharger les composants :

- **`Audio/`** : Manipulation de l'API audio du navigateur.
- **`Auth/`** : Abstractions autour de la connexion utilisateur.
- **`Data/`** : Hooks de récupération de données avec gestion du cache.
- **`UI/`** : Raccourcis clavier, gestion du plein écran, calculs de layout responsives.

### 5. `styles/` - Système de Design

- **`design-tokens.css`** : La source pour les variables (couleurs, arrondis, espacements, ombres).
- **`styles.css` & `utilities.css`** : Styles globaux et classes utilitaires.
- **CSS Modules (`*.module.css`)** : Utilisés pour l'isolation des styles par composant afin d'éviter les fuites de style lors de l'intégration du widget.

### 6. `utils/` - Aideurs et Logique pure

Regroupe les fonctions pures sans état :

- **`audio.ts`** : Formattage du temps, calculs de progression.
- **`ui.ts`** : Génération des variables de thémage, gestion du viewport.
- **`player.ts`** : Logique de manipulation des listes (shuffle, history) et des objets Track.

### 7. `types/` - Type Safety

Contient toutes les interfaces TypeScript du projet. C'est ici qu'on définit les contrats de données (Track, Playlist, Theme, etc.) pour garantir une cohérence entre l'API et l'UI.

---

## Points d'entrée clés

- **`widget.tsx`** : Le point d'entrée pour l'intégration web (UMD). Il expose `initStreamLayer` pour monter le player manuellement, mais gère aussi l'initialisation via les attributs `data-*`.
- **`App.tsx`** : Le composant racine pour le mode application standalone (utilisé pour les tests et le build mobile).
- **`main.tsx`** : Point d'entrée standard React/Vite.

## Stack Technique

- **React 18** & **TypeScript**
- **Vite** : Pour le build et le serveur de dev.
- **Capacitor** : Pour le bridge vers Android/iOS.
- **hls.js** : Pour le streaming adaptatif.
- **dnd-kit** : Pour le drag and drop.
- **Lucide React** : Pour les icônes.

## Intégration via Script UMD (Site Externe)

### 1. Prérequis

Vous devez disposer du fichier builder `stream-layer.umd.js` (généré via `npm run build` dans le dossier `dist`).

### 2. Mise en place

Il suffit d'ajouter une balise `<script>` avec les attributs `data-*` nécessaires. Le player s'initialisera automatiquement.

```html
<div id="stream-layer-widget"></div>

<!-- Chargement du script avec configuration -->
<script 
  src="path/to/stream-layer.umd.js"
  data-project-id="VOTRE_ID_PROJET"
  data-api-base-url="https://api.votre-domaine.com"
  data-api-key-id="VOTRE_API_KEY_ID"
  data-user-api="VOTRE_USER_API"
  data-password-api="VOTRE_PASSWORD_API"
  data-container-id="stream-layer-widget"
  data-theme-primary="#ff0000"
  data-theme-secondary="#000000"
></script>
```

### 3. Attributs disponibles

| Attribut               | Obligatoire | Description                                  |
|:---------------------- |:-----------:|:-------------------------------------------- |
| `data-project-id`      | Oui         | L'identifiant du projet à charger.           |
| `data-api-base-url`    | Oui         | L'URL de base de l'API.                      |
| `data-api-key-id`      | Oui         | L'ID de la clé API pour l'authentification.  |
| `data-user-api`        | Oui         | Le nom d'utilisateur pour l'API.             |
| `data-password-api`    | Oui         | Le mot de passe pour l'API.                  |
| `data-container-id`    | Non         | L'ID de l'élément DOM où injecter le player. |
| `data-theme-primary`   | Non         | Couleur principale du player (héxadécimal).  |
| `data-theme-secondary` | Non         | Couleur secondaire du player (héxadécimal).  |

---

## Tests & Démos

Pour tester le projet dans ses différents modes :

1. **Mode App (Vite)** : `npm run dev` puis ouvrez `http://localhost:5173`. Utilise `App.tsx` et les variables du `.env`.
2. **Mode Widget (UMD)** : 
   - Compilez le projet : `npm run build`.
   - Ouvrez `demo.html` dans votre navigateur. Ce fichier simule une intégration réelle sur un site externe.

---

## Personnalisation & Thème

Le player utilise un système de **Design Tokens**. Les couleurs passées via `data-theme-*` (ou via le provider) viennent surcharger les variables CSS suivantes :

- `--color-primary` : Utilisée pour les boutons, la barre de progression et les accents.
- `--color-secondary` : Utilisée pour les fonds et les ambiances colorées.

Le thémage est géré dans `src/styles/design-tokens.css` et injecté dynamiquement dans le `PlayerUIProvider`.

---

## Notes

- **Audio** : On utilise `hls.js` pour le streaming. La logique de lecture est isolée dans le `PlayerContext`. Attention à la browser policy qui bloque l'autoplay sans interaction utilisateur.
- **Cache** : Les pochettes et métadonnées sont mises en cache pour limiter les appels réseau (`src/services/api/covers.ts`).
- **Reporting** : Un système de tracking est en place (`src/hooks/Reporting/useReporting.ts`). Il utilise un batching (lots de 50) et une file persistante hors-ligne.

### To-do

- **Reporting Métier** (`src/hooks/Reporting/useTrackReporting.ts`) : 
  - Certains champs sont actuellement **hardcodés** et doivent être rendus dynamiques : `container_type` (fixé à `list`), `full` (fixé à `true`) et `territory_code` (fixé à `FR`).

---

## Commandes utiles

- `npm run build` : Génère la librairie (fichier UMD dans `dist`).
- `npm run build:app` : Génère l'app web pour Capacitor (dans `dist-app`).
- `npm run mobile:sync` : Envoie le build web vers les projets natifs (Android/iOS).
