# Spécifications du Reporting (Digster SDK)

Ce document récapitule la logique de reporting extraite du code source natif Android du SDK Digster (`SWPlayer.java` et `SWRequestFactory.java`). Il sert de référence pour implémenter une logique similaire dans StreamLayer.

## 1. Endpoint API

Le reporting s'effectue via une seule route API qui accepte les événements par lot (batch).

* **URL** : `{API_BASE_URL}/stats/`
* **Méthode** : `POST`
* **Authentification** : Requise (Bearer Token dans les headers).
* **Content-Type** : `application/json`

## 2. Structure de la Requête (Request Body)

Le corps de la requête doit être un objet JSON contenant un tableau `items`. Ce tableau contient une liste d'objets "stat" (voir structure ci-dessous).

```json
{
  "items": [
    {
       // Objet Stat 1
    },
    {
       // Objet Stat 2
    }
  ]
}
```

## 3. Structure de l'Objet Stat

Chaque événement de lecture (play, pause, stop, etc.) génère un objet avec les propriétés suivantes :

| Propriété           | Type   | Description                                                                | Valeur Exemple                                   |
|:------------------- |:------ |:-------------------------------------------------------------------------- |:------------------------------------------------ |
| `id`                | String | L'identifiant unique de la piste jouée (`play_id`).                        | `"12345"`                                        |
| `status`            | String | L'état du lecteur au moment de l'événement.                                | `"started"`, `"paused"`, `"resume"`, `"stopped"` |
| `creation_datetime` | Number | Timestamp UNIX de l'événement en **millisecondes**.                        | `1678900000000`                                  |
| `time`              | Number | La position de lecture ou la durée (en secondes). Voir logique ci-dessous. | `15`                                             |
| `device_type`       | String | Type de l'appareil (fixé en dur dans le SDK).                              | `"mobile"`                                       |

### Logique pour le champ `time`

La valeur du champ `time` dépend du `status` et de l'état du lecteur (notamment si la lecture a terminé ou non) :

* **Si `status` == "stopped"** :
  * Si la piste est **terminée** (lecture arrivée au bout) : `time` = **Durée totale de la piste**.
  * Sinon : `time` = **Position actuelle** du curseur de lecture.
* **Si `status` == "started"** :
  * `time` = `0` (sauf cas particulier de reprise après un cast).
* **Pour les autres statuts ("paused", "resume")** :
  * `time` = **Position actuelle** du curseur de lecture.

*Note : La valeur de `time` ne peut jamais excéder la durée totale de la piste.*

## 4. Déclencheurs (Triggers)

Un événement de reporting doit être créé et (idéalement) envoyé lors des changements d'états suivants du lecteur audio :

1. **Démarrage de la lecture** (`"started"`) : Envoyé dès qu'une piste commence à jouer.
2. **Mise en pause** (`"paused"`) : Envoyé quand l'utilisateur met la lecture en pause.
3. **Reprise de la lecture** (`"resume"`) : Envoyé quand l'utilisateur relance la lecture après une pause.
4. **Arrêt de la lecture** (`"stopped"`) : Envoyé quand :
   * La piste se termine naturellement.
   * L'utilisateur change de piste manuellement (Skip start/end).
   * Le lecteur est stoppé.

## 5. Exemple d'Implémentation

Voici un exemple de payload JSON complet pour une session d'écoute simple :

```json
{
  "items": [
    {
      "id": "track_888",
      "status": "started",
      "creation_datetime": 1707470000000,
      "time": 0,
      "device_type": "mobile"
    },
    {
      "id": "track_888",
      "status": "paused",
      "creation_datetime": 1707470015000,
      "time": 15,
      "device_type": "mobile"
    },
    {
      "id": "track_888",
      "status": "resume",
      "creation_datetime": 1707470020000,
      "time": 15,
      "device_type": "mobile"
    },
    {
      "id": "track_888",
      "status": "stopped",
      "creation_datetime": 1707470200000,
      "time": 180, // Supposons que la piste fait 3min (180s)
      "device_type": "mobile"
    }
  ]
}
```

## 6. Gestion Offline (Cas Particulier)

Le SDK gère les cas où l'utilisateur n'a pas de connexion réseau au moment de l'événement.

1. **Mise en cache** : Si le réseau est indisponible, l'événement `stat` est stocké localement dans une file d'attente (fichier `FILE_OFFLINE_STATS`).
2. **Synchronisation** :
   - Au retour du réseau (Wi-Fi ou Mobile) ou au login de l'utilisateur, le `SWOfflineManager` tente d'envoyer les stats en attente.
   - Les stats sont envoyées par **lots de 100 maximum** (`MAX_NUMBER_OF_OFFLINE_STATS_ITEMS_TO_SEND`).
   - Une fois l'envoi réussi (réponse 200 OK), les stats sont supprimées du cache local.

Si vous implémentez un mode hors ligne dans StreamLayer, vous devez reproduire ce mécanisme de "Store & Forward" pour ne perdre aucune donnée d'écoute.
