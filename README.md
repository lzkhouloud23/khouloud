# MERN App - Docker et Docker Compose

Cette application comprend un client React, une API Express et MongoDB. Docker Compose lance les trois services sur le réseau `mern-network`. Le volume nommé `mern-data` conserve les données après l'arrêt des conteneurs.

## Prérequis et configuration

- Docker Desktop démarré avec Docker Compose v2 (`docker compose`)
- Git

Le client appelle l'API depuis le navigateur à `http://localhost:9000`. Pour changer cette adresse, définissez `REACT_APP_API_URL` avant la construction. Le serveur contacte MongoDB dans le réseau Docker avec `MONGO_URI=mongodb://mongodb:27017/mern`; `mongodb` est le nom d'hôte du service Compose.

Depuis MongoDB Compass ou un autre outil installé sur votre ordinateur, utilisez `mongodb://localhost:27017/mern`. Le port 27017 est publié par Compose pour cette connexion depuis l'hôte. Copiez `.env.example` vers `.env` pour personnaliser les variables. Ne mettez aucun secret dans Git.

## Construire et démarrer

Depuis la racine du dépôt :

```bash
docker compose up --build -d
docker compose ps
```

Ouvrez <http://localhost:3000> pour le client et <http://localhost:9000/> pour l'API. MongoDB doit passer à `healthy` avant le démarrage du serveur.

Pour construire et démarrer les conteneurs séparément, comme dans les étapes du TP :

```bash
docker network create mern-network
docker volume create mern-data
docker build -t mern-server ./server
docker build --build-arg REACT_APP_API_URL=http://localhost:9000 -t mern-client ./client
docker run -d --name mongodb --network mern-network -p 27017:27017 -v mern-data:/data/db mongo:latest
docker run -d --name server --network mern-network -p 9000:9000 -e MONGO_URI=mongodb://mongodb:27017/mern mern-server
docker run -d --name client --network mern-network -p 3000:3000 mern-client
```

## Vérifier l'application et la persistance

1. Créez un enregistrement depuis l'interface et confirmez qu'il apparaît dans la liste.
2. Inspectez les services et journaux :

   ```bash
   docker compose ps
   docker compose logs --tail=50 server
   docker compose logs --tail=50 client mongodb
   ```

3. Redémarrez les conteneurs et vérifiez que l'enregistrement est toujours présent :

   ```bash
   docker compose down
   docker compose up -d
   ```

`docker compose down` conserve le volume. `docker compose down -v` le supprime aussi et efface les données.

## Diagnostic

- Échec de build : `docker compose build --no-cache <service>`, puis vérifiez le Dockerfile, le contexte et les journaux npm.
- Conteneur arrêté ou en redémarrage : `docker compose ps -a` puis `docker compose logs --tail=100 <service>`.
- MongoDB `unhealthy` ou connexion `localhost:27017` refusée : confirmez que Docker Desktop est démarré, consultez `docker compose ps` et `docker compose logs --tail=50 mongodb`, vérifiez l'état `healthy` et que le port 27017 est libre.
- Le serveur ne joint pas la base : dans le réseau Compose, l'hôte URI doit être `mongodb`, pas `localhost`.
- Le navigateur ne joint pas l'API : vérifiez `REACT_APP_API_URL` et reconstruisez le client, car l'URL est intégrée pendant le build React.
- Port occupé : libérez-le ou modifiez les ports publiés dans `docker-compose.yml`.

## Arrêter les services

```bash
docker compose down
```

Pour supprimer aussi les données persistantes : `docker compose down -v`.

## Fichiers Docker

- `server/Dockerfile` et `server/.dockerignore` : API Express.
- `client/Dockerfile` et `client/.dockerignore` : client React servi par `serve`.
- `docker-compose.yml` : services, healthcheck MongoDB, réseau et volume persistant.
