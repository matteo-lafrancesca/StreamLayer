# Cahier des Charges StreamLayer

---

## 1. Présentation du Projet

**StreamLayer** est un lecteur de musique en streaming conçu pour être intégré dans des applications **web et mobiles**. L'objectif est de fournir une solution complète, modulaire et réutilisable pour la lecture audio avec :

- Authentification sécurisée à l'API backend
- Expérience utilisateur fluide et continue
- Support multi-plateformes (Web + Mobile)
- Collecte de données analytiques d'écoute

---

## 2. Fonctionnalités Principales

### 2.1 Modes d'Affichage

#### Mode Compact![](C:\Users\Mattéo%20Lafrancesca\AppData\Roaming\marktext\images\2026-01-15-10-54-01-image.png)

Lecteur minimaliste affichant :

- Pochette de l'album
- Titre et artiste (avec défilement si texte long)
- Contrôles de base : Play/Pause, Précédent, Suivant
- Barre de progression cliquable et draggable
- Contrôle de volume
- Bouton d'expansion

#### Mode Réduit

Lecteur très réduit affichant :

- Pochette de l'album
- Contrôles Play/Pause

Mode pour que le lecteur ne prenne plus de place et se fasse oublier pendant la navigation sur le site

#### Mode Étendu

Vue complète avec navigation :

- **Vue Playlist** : Liste scrollable des morceaux de la playlist active![](C:\Users\Mattéo%20Lafrancesca\AppData\Roaming\marktext\images\2026-01-15-11-37-23-image.png)
- **Vue Détails** : Affichage d'informations supplémentaires sur les morceaux, ajout d'un menu dépliable dans la vue playlist![](C:\Users\Mattéo%20Lafrancesca\AppData\Roaming\marktext\images\2026-01-15-11-40-25-image.png)
- **Vue Projet** : Grille de toutes les playlists disponibles![](C:\Users\Mattéo%20Lafrancesca\AppData\Roaming\marktext\images\2026-01-15-10-54-21-image.png)
- **Liste d'attente** : Vue qui affiche les morceaux à venir et possibilité de changer l'ordre.
- Toggle entre les vues playlist et projet
- Bouton de réduction vers mode compact

#### Animation et Comportement

- Transition fluide (slide-up/down) entre compact et étendu
- Auto-réduction après 30 secondes d'inactivité
- Timer réinitialisé au mouvement de souris

### 2.2 Contrôles de Lecture

| Fonction          | Comportement                             |
| ----------------- | ---------------------------------------- |
| Play/Pause        | Lance ou met en pause la lecture         |
| Précédent/Suivant | Navigation dans la playlist              |
| Shuffle           | Lecture aléatoire (état persisté)        |
| Repeat            | Modes : Off / Repeat All / Repeat One    |
| Volume            | Ajustement 0-100% avec slider draggable  |
| Seeking           | Clic ou drag sur la barre de progression |

### 2.3 Navigation et Playlists

- Sélection d'une playlist parmi celles du projet
- Affichage de tous les morceaux de la playlist sélectionnée
- Clic sur un morceau pour le lancer immédiatement
- Passage automatique au morceau suivant à la fin.

### 2.4 MediaSession API

Intégration des contrôles système natifs :

- Touches multimédia du clavier
- Écran de verrouillage mobile (iOS/Android)
- Notifications système (Windows/macOS)
- Métadonnées automatiquement mises à jour

---

## 3. Design Responsive

#### Desktop (≥1024px)

- Lecteur en position fixe
- Largeur fixe : 700px
- Mode compact : hauteur auto
- Mode étendu : 700×600px

#### Tablette (768px - 1023px)

- Lecteur en position fixe bottom
- Largeur : 100% avec padding horizontal
- Mode compact : hauteur réduite optimisée
- Mode étendu : Full-height avec header fixe

#### Mobile (<768px)

- **Mode Compact** :
  - Barre fixée en bas de l'écran (full-width)
  - Hauteur optimisée pour touch (~80px)
  - Pas de contrôle de volume
  - Touches plus grandes pour le tactile (min 44×44px)
- **Mode Étendu** :
  - Full-screen overlay
  - Header avec bouton retour
  - Liste/grille scrollable optimisée touch
  - Swipe down pour fermer

---

## 4. Spécifications Techniques

### 4.1 Technologies

- **Web** : React, TypeScript, Vite
- **Streaming** : HLS.js pour le web
- **State** : Context API + LocalStorage
- **Styling** : CSS Modules avec variables pour thémisation

### 4.2 API Backend

**Base URL** : `https://multiprojects-infra-dev.api-umf.com`

**Authentification** : JWT Bearer Token avec refresh automatique

**Endpoints clés** :

- Playlists du projet
- Morceaux d'une playlist
- Stream audio (HLS)
- Pochettes (album/playlist)
- Analytics d'écoute

### 4.3 Persistance et Cache

**LocalStorage** :

- État du lecteur (piste, volume, shuffle, repeat)
- Position de lecture pour reprise
- Playlist sélectionnée

**Cache** :

- Images de pochettes en mémoire
- Préchargement des métadonnées
- Queue d'analytics en attente d'envoi

### 4.4 Audio Streaming

- Format : HLS 
- Lecteur : hls.js pour compatibilité sur tous les navigateurs
- Buffer : Préchargement intelligent
- Qualité : Adaptation selon bande passante

---

## 5. Analytics et Reporting

### 5.1 Événements Trackés

* 

### 5.2 Gestion Offline

- Queue locale des événements non envoyés

- Stockage dans IndexedDB

- Envoi automatique au retour de connexion

- Batch sending pour optimiser

---

## 6. Gestion des Erreurs

### 6.1 Stratégies de Retry

- **Erreurs réseau (500, 503)** : 3 tentatives avec backoff (1s, 2s, 5s)
- **Erreurs 404** : Placeholder pour images, skip pour tracks
- **Erreurs auth** : Refresh token automatique, reconnexion si échec

### 6.2 Indicateurs Utilisateur

- Loader pendant chargement
- Message d'erreur clair avec action
- Animation buffering sur la barre

---

## 7. Accessibilité

### 7.1 Standards

- Support navigation clavier (Tab, Enter, Space, Arrows)
- Focus visible sur tous les éléments interactifs
- ARIA labels sur les contrôles
- Annonce des changements pour lecteurs d'écran

### 7.2 Shortcuts Clavier

- `Space` : Play/Pause
- `→` / `←` : Seek ±5s
- `↑` / `↓` : Volume ±10%

---

## 8. Distribution

### 8.1 Package NPM

```bash
npm install @streamlayer/player
```

**Utilisation** :

```tsx
import { PlayerProvider, Player } from '@streamlayer/player';

<PlayerProvider>
  <App />
  <Player />
</PlayerProvider>
```

### 8.2 Configuration

Paramètres principaux :

- `projectId` 
- `apiBaseUrl` 
- `theme` : couleurs personnalisées
- `position` : placement du lecteur 

### Bugs rencontrés
- Pas de gestion pour playlist vide
- Etat du player non synchronisé (scroll dans une playlist)
- Remettre à zéro la musique lorsqu'on lance une nouvelle musique
- Seeking lag quand playing
- Bug barre de son laisse des points gris 
- Chargement pochette lent
- Musique ne se lance jamais de temps en temps

- Progress Bar ne fonctionne pas bien sur BJ
- La police change en fonction du site 