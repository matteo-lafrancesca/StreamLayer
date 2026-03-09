# Contexte & Directives pour les Agents

## 🚀 Présentation du Projet

**StreamLayer** est un widget de lecteur de streaming audio développé pour fonctionner de manière fluide sur les plateformes Web et Mobile. Il est exportable en tant que composant UI autonome pour être intégré dans des applications plus vastes via des balises de script ou des composants React.

### Stack Technique

- **Framework/Bibliothèque :** React 18 + TypeScript
- **Bundler :** Vite
- **Environnement Mobile :** Capacitor (Android & iOS)
- **Audio/Streaming :** HLS.js
- **UI/UX :** CSS personnalisé (`design-tokens.css`, variables), framer-motion/dnd-kit (animations/sortables)
- **Icônes :** lucide-react

### Structure du Projet

- `src/widget.tsx` : Le point d'entrée principal pour le widget Web autonome compilé.
- `src/App.tsx` : Wrapper de l'application pour le développement local et les tests.
- `src/components/StreamLayer/` : Le composant principal du Lecteur (Player) et ses sous-composants imbriqués.
- `src/hooks/` : Contient la logique critique comme `usePlayer`, `useTrackReporting`, etc.
- `src/services/api/` : Gère les appels réseau (ex: `reporting.ts`).

---

## 🎯 Objectifs Actuels & Priorités

Basé sur l'historique récent de ce projet, voici les principes directeurs et les priorités :

1. **Préparation pour la Production & Robustesse :** 
   L'application est en cours de finalisation pour la production. Le code doit être robuste, gérer correctement les cas limites (comme les ErrorBoundaries), et ne devrait jamais faire planter l'application parente. Gardez un œil sur les problèmes potentiels de HMR (Hot Module Replacement) dans les Contextes (comme `PlayerContext`).

2. **Précision de la Logique de Reporting :** 
   L'analytique et le reporting (temps d'écoute, pauses, arrêts) doivent être extrêmement précis. Les payloads envoyés à l'API doivent être optimisés et dynamiques (ex: résolution dynamique du type d'appareil et du statut en ligne), en omettant tout champ statique inutile pour minimiser la taille.

3. **Code Propre & Base de Code "Humanisée" :**
   
   - **Commentaires :** Supprimez les commentaires excessifs, contextuels ou "bavards". Gardez des commentaires purement objectifs et descriptifs de la fonctionnalité du code, en particulier dans les hooks et les caches.
   - **Refactoring :** Cherchez constamment des opportunités pour éliminer la duplication de code, séparer les responsabilités et simplifier la logique complexe. Évitez les "code smells" (mauvaises pratiques) et les `console.log` persistants dans les chemins de production.
   - **Simplicité :** N'essaie pas de faire du code verbeux, de tout mettre dans une ligne ou d'utiliser un tas de fonctions en une seule fois, ton code sera relu par un humain il faut qu'il soit extrêmement simple à comprendre même sans commentaires alors on laisse le code aéré et simple. 

4. **Détails UI / UX :**
   
   - Les vues mobiles nécessitent une attention "pixel-perfect" concernant l'espacement et le positionnement (comme les barres de contrôle du lecteur).
   - Rendu conditionnel dynamique (ex: n'afficher "Lecture depuis [Playlist]" que si un morceau est *réellement* en cours de lecture).

---

## 🤖 Instructions pour les Agents (Ce que vous êtes censé faire)

Lorsque vous commencez une tâche sur ce projet, respectez le flux de travail suivant :

1. **Comprendre Avant Tout :** Avant d'écrire du code, analysez de manière approfondie les hooks et composants pertinents pour tracer le flux de données (en particulier ce qui touche au Contexte du Player ou aux Services API).
2. **Suivre le Style :** 
   - Écrivez en TypeScript strict.
   - Utilisez correctement les imports absolus (ex: `@components/...`, `@styles/...`).
   - Respectez les modèles d'architecture existants (Hooks pour la logique, Services pour l'API, Composants pour l'UI).
3. **Optimiser :** Pensez toujours à l'efficacité. Si vous modifiez les payloads d'API ou l'implémentation du cache, assurez-vous d'améliorer la vitesse ou de réduire la taille.
4. **Nettoyer après soi :** Si vous refactorez une méthode, supprimez le code obsolète (legacy). Assurez-vous que vos modifications ne cassent pas le Fast Refresh pendant le développement.
