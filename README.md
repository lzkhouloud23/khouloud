# TP8 : Microservices avec REST, GraphQL et gRPC

## Description

Ce projet est une implémentation d’une architecture microservices utilisant :
- REST API (Express)
- GraphQL (Apollo Server)
- gRPC (communication entre microservices)

Le système est composé de deux microservices :
- Movie Microservice
- TV Show Microservice

Un API Gateway centralise les communications et expose une API unifiée via REST et GraphQL.

---

## Architecture

- Microservices indépendants (Movies & TV Shows)
- Communication interne via gRPC
- API Gateway pour exposer REST + GraphQL
- Schéma GraphQL pour requêtes flexibles

---

## Technologies utilisées

- Node.js
- Express.js
- GraphQL / Apollo Server
- gRPC (@grpc/grpc-js)
- Protocol Buffers (.proto)
- CORS

---

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/lzkhouloud23/Microservices-avec-REST-GraphQL-et-gRPC.git
