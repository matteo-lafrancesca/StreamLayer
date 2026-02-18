## Phase 1 : Préparation de l'environnement (Sur le Mac)

Avant même d'ouvrir votre projet, assurez-vous que le Mac est prêt.

- **Installer Node.js :** Installez la même version que celle utilisée sur votre PC actuel.

- **Installer Xcode :** Téléchargez-le via l'App Store (attention, c'est lourd, environ 12 Go). Une fois installé, ouvrez-le pour accepter les licences.

- **Installer CocoaPods :** C'est l'outil qui gère les bibliothèques natives iOS.
  
  - Ouvrez le terminal et tapez : `sudo gem install cocoapods` (ou via Homebrew : `brew install cocoapods`).

- **Compte Apple :** Préparez vos identifiants Apple ID (un compte gratuit suffit pour tester sur votre propre téléphone).

---

## Phase 2 : Préparation du projet (Terminal)

Une fois votre projet récupéré sur le Mac (via Git ou clé USB) :

- **Installation des dépendances :**
  
  Bash
  
  ```
  npm install
  npm install @capacitor/ios
  ```

- **Build du projet Web :** Capacitor a besoin de fichiers compilés pour les copier dans l'app. Selon votre `package.json`, utilisez votre commande spécifique :
  
  Bash
  
  ```
  npm run build:app
  ```
  
  *Vérifiez que le dossier `dist-app` a bien été créé à la racine.*

- **Ajout de la plateforme iOS :**
  
  Bash
  
  ```
  npx cap add ios
  ```

- **Synchronisation :** Cette étape copie votre code web et vos plugins dans le projet iOS.
  
  Bash
  
  ```
  npx cap sync ios
  ```

 ---

## Phase 3 : Configuration dans Xcode (L'interface Apple)

C'est ici que les choses diffèrent d'Android.

- **Ouvrir Xcode :**
  
  Bash
  
  ```
  npx cap open ios
  ```

- **Configuration de la Signature (Indispensable) :**
  
  - Dans la colonne de gauche, cliquez sur le projet tout en haut (icône bleue "App").
  
  - Allez dans l'onglet **Signing & Capabilities**.
  
  - Cliquez sur **Add Account** et connectez votre Apple ID.
  
  - Dans "Team", sélectionnez votre nom. Xcode va générer un certificat "Development".

- **Permissions (Info.plist) :** Puisque votre app fait du streaming (`hls.js`), Apple est strict sur les flux réseaux :
  
  - Si vos flux vidéo ne sont pas en `https`, vous devez autoriser le "Arbitrary Loads" dans les paramètres réseau.
  
  - Si vous voulez que la musique/vidéo continue en arrière-plan, ajoutez la "Capability" **Background Modes** et cochez **Audio, AirPlay, and Picture in Picture**.

---

## Phase 4 : Déploiement sur l'iPhone

- **Branchez votre iPhone** au Mac avec un câble.

- **Déverrouillez l'iPhone** et cliquez sur "Faire confiance à cet ordinateur".

- **Sélectionnez votre iPhone** en haut de la fenêtre Xcode (à côté du bouton "Play").

- **Activez le mode Développeur** sur l'iPhone (si c'est iOS 16+) :
  
  - *Réglages > Confidentialité et sécurité > Mode développeur (tout en bas) > Activer.* (Le téléphone va redémarrer).

- **Lancez le build :** Cliquez sur le bouton **Play** (Triangle) dans Xcode.

---

## Phase 5 : "Approuver" l'application (Dernière étape)

La première fois que vous installez l'app, elle refusera de se lancer car le développeur (vous) n'est pas encore approuvé par le système.

1. Sur l'iPhone, allez dans **Réglages > Général > VPN et gestion de l'appareil**.

2. Cliquez sur votre adresse mail (Apple ID).

3. Cliquez sur **"Faire confiance à..."**.

**Félicitations, votre app StreamLayer se lancera !**

--- 

### Résumé des commandes à retenir

Chaque fois que vous modifiez votre code React :

1. `npm run build:app` (pour recréer le dossier `dist-app`)

2. `npx cap copy ios` (pour envoyer le nouveau code vers Xcode)

3. Appuyez sur **Play** dans Xcode.

**Conseil pour le streaming :** Si vous testez des flux vidéo, le simulateur Xcode est souvent très lent ou buggé pour la vidéo. Testez **toujours** sur un vrai iPhone pour juger de la fluidité de votre `hls.js`.