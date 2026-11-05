# TP2 — Docker et Docker Compose

## Compte rendu

**Étudiante :** KHOULOUD — `lzkhouloud23`

**Projet :** application MERN (React, Express et MongoDB)

**Dépôt personnel :** https://github.com/lzkhouloud23/khouloud

**Dépôt de départ :** https://github.com/Poly-DevOps/mern-app

## Objectifs

Conteneuriser le client React et l'API Express, orchestrer les services avec Docker Compose et prévoir la persistance des données MongoDB.

## Travail réalisé

### Questions 1 et 2 — Dépôt et Dockerfiles

- Le projet MERN est conservé dans le dépôt GitHub personnel.
- `server/Dockerfile` construit l'API avec `node:lts-alpine`, installe les dépendances avec `npm ci`, expose le port `9000` et démarre l'API avec `npm start`.
- `client/Dockerfile` construit l'application React, injecte `REACT_APP_API_URL`, puis sert le build avec `serve` sur le port `3000`.
- `server/.dockerignore` et `client/.dockerignore` excluent notamment les dépendances locales, les fichiers `.env` et les fichiers de build inutiles.

### Questions 3 à 5 — Réseau, MongoDB et exécution des conteneurs

- Le réseau Docker `mern-network` permet aux conteneurs de communiquer.
- MongoDB est accessible depuis l'API via `mongodb://mongodb:27017/mern` dans le réseau Docker.
- Le port `27017` est publié pour les connexions depuis l'ordinateur hôte, par exemple avec MongoDB Compass via `mongodb://localhost:27017/mern`.
- Le volume nommé `mern-data` conserve les données de MongoDB quand les conteneurs sont arrêtés puis relancés.
- Les commandes de construction et d'exécution séparées figurent ci-dessous pour montrer le fonctionnement des images et des conteneurs.

```bash
# Depuis la racine du dépôt

docker network create mern-network
docker volume create mern-data

docker build -t mern-server ./server
docker build --build-arg REACT_APP_API_URL=http://localhost:9000 -t mern-client ./client

docker run -d --name mongodb --network mern-network -p 27017:27017 -v mern-data:/data/db mongo:latest
docker run -d --name server --network mern-network -p 9000:9000 -e MONGO_URI=mongodb://mongodb:27017/mern mern-server
docker run -d --name client --network mern-network -p 3000:3000 mern-client
```

### Question 6 — Docker Compose

`docker-compose.yml` définit les services `mongodb`, `server` et `client`, le réseau `mern-network`, le volume persistant `mern-data`, les politiques de redémarrage et le contrôle de santé MongoDB. L'API attend que MongoDB soit en état `healthy`.

Démarrer l'application depuis la racine :

```bash
docker compose up --build -d
docker compose ps
```

Adresses locales :

- Application React : <http://localhost:3000>
- API Express : <http://localhost:9000/>
- MongoDB depuis l'hôte : `mongodb://localhost:27017/mern`

## Vérifications et état d'exécution — Question 7

La configuration Compose a été vérifiée avec `docker compose config`. **Le scénario complet n'a pas encore été exécuté** : Docker Desktop n'a pas démarré son moteur Linux sur la machine utilisée. Les commandes `docker compose up` et `docker compose ps` échouent actuellement parce que le moteur n'est pas joignable. Il n'est donc pas encore possible de confirmer le parcours React → API → MongoDB, ni la persistance après redémarrage.

Une fois Docker Desktop affichant **Engine running**, effectuer les vérifications suivantes :

1. `docker compose up --build -d`, puis `docker compose ps` : vérifier que MongoDB est `healthy` et que les trois services sont actifs.
2. Ouvrir <http://localhost:3000>, créer un enregistrement et vérifier qu'il apparaît dans la liste.
3. Consulter les journaux avec `docker compose logs --tail=50 server` et `docker compose logs --tail=50 mongodb`.
4. Exécuter `docker compose down`, puis `docker compose up -d` et vérifier que l'enregistrement est toujours présent. Ne pas ajouter `-v`, qui supprimerait le volume de données.
5. Ajouter au dépôt des captures d'écran réelles de l'application, de `docker compose ps` et du test de persistance après leur réalisation.

### Difficultés rencontrées et diagnostic

- `localhost:27017` ne répond pas quand le moteur Docker est arrêté ou quand le conteneur MongoDB n'est pas lancé.
- Entre conteneurs, l'API doit utiliser le nom de service `mongodb` dans `MONGO_URI`; `localhost` désignerait le conteneur API lui-même.
- Le navigateur utilise `REACT_APP_API_URL=http://localhost:9000`, car il accède à l'API publiée sur l'hôte. Après modification de cette URL, reconstruire le client.
- En cas d'échec : consulter `docker compose ps -a`, puis les journaux avec `docker compose logs --tail=100 <service>`. Si un port est déjà pris, le libérer ou modifier le port publié.

## Question 8

La question 8 porte sur un autre projet microservices et n'est pas incluse dans ce dépôt, conformément au périmètre demandé.

## Arrêter les services

```bash
docker compose down
```

Cette commande conserve le volume. `docker compose down -v` supprime également `mern-data` et les données MongoDB.
