# MIAGE Collectiv'IT — ShopLoc (Front-end Web Client)

Projet réalisé dans le cadre du cours de GLOP (Génie Logiciel par la Pratique), visant à proposer une application de fidélité pour l'ensemble des commerçants d'une municipalité.

---

## 1. Architecture et Coexistence Frontend / Backend

Le projet global est découpé en deux dépôts indépendants :
- **Backend (`Service-Shop`)** : API REST Spring Boot + base de données PostgreSQL gérés par leur propre `compose.yaml`.
- **Frontend (`ShopLoc-Web-Client`)** : Application Angular servie par un conteneur Nginx via son propre `compose.yaml`.

### Répartition des ports sur la machine hôte (`localhost`) :

| Composant | Port hôte | Rôle |
|---|---|---|
| **Frontend Angular** (`ShopLoc-Web-Client`) | `4200` | Interface utilisateur web (Nginx) |
| **Backend API** (`Service-Shop`) | `8080` | API REST Spring Boot (`/api/shops`) |
| **Base PostgreSQL** (`Service-Shop`) | `5432` | Données relationnelles |

> **Coexistence :** Les deux environnements Docker tournent en parallèle sans aucun conflit de port. L'application Angular s'exécutant dans le navigateur du client, elle communique directement avec l'API backend sur `http://localhost:8080`.

---

## 2. Démarrage rapide avec Docker Compose (Recommandé)

### Étape 1 : Démarrer le Backend (`Service-Shop`)
Dans un terminal, démarrez les conteneurs backend et base de données :
```bash
cd Service-Shop
docker compose up --build -d
```
Vérifiez que l'API répond :
```bash
curl http://localhost:8080/api/shops
```

### Étape 2 : Démarrer le Frontend (`ShopLoc-Web-Client`)
Dans un second terminal (ou depuis la racine du frontend) :
```bash
cd ShopLoc-Web-Client
docker compose up --build -d
```

### Étape 3 : Accéder à l'application
Ouvrez votre navigateur sur : **[http://localhost:4200](http://localhost:4200)**

- Liste des boutiques : `http://localhost:4200/`
- Détails d'une boutique : `http://localhost:4200/shops/:id`

---

## 3. Commandes utiles Docker pour le Frontend

- **Afficher les logs en temps réel :**
  ```bash
  docker compose logs -f
  ```
- **Arrêter le conteneur frontend :**
  ```bash
  docker compose down
  ```
- **Reconstruire l'image après modification :**
  ```bash
  docker compose up --build -d
  ```

---

## 4. Alternative : Démarrage en mode développement local (sans Docker)

Si vous souhaitez travailler sur le code avec le rechargement à chaud (*hot reload*) :

```bash
cd ShopLoc-Web-Client/shoploc

# Installation des dépendances
npm install

# Lancer le serveur de développement Angular
npm start
```
L'application sera accessible sur `http://localhost:4200/`.

---

## 5. Tests unitaires et vérification du build

```bash
cd ShopLoc-Web-Client/shoploc

# Exécuter les tests unitaires
npm test -- --watch=false

# Vérifier la compilation de production
npm run build
```

---

## 6. Qualité de code et Git Hooks (Husky)

> **CRITICAL SETUP :** Ne contournez pas l'initialisation à la racine. Les hooks pre-commit Husky sont obligatoires.

À la racine du dépôt `ShopLoc-Web-Client` :
```bash
npm install
```
Un hook pre-commit s'exécute automatiquement lors de chaque commit pour formater et valider le code.