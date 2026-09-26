# MISSION : INDUSTRIALISATION & DÉPLOIEMENT PRODUCTION DU FRONTEND SHOPLOC (K3S)

## 1. Contexte d'Exécution & Infrastructure
- **Répertoire de travail local** : `C:\Users\fgogo\Documents\PROJET M2\GLOP\ShopLoc-Web-Client`
- **Arborescence** : Le code source Angular se situe dans le sous-dossier `shoploc/` (`package.json`, `angular.json`, `src/`). Le build génère les fichiers dans `shoploc/dist/shoploc/browser`.
- **Infrastructure cible** : Cluster K3s sur VPS Oracle Cloud (Ampere A1 ARM64, Ubuntu 24.04, IP `88.96.39.138`).
- **Routage réseau (Traefik Ingress)** :
  - Le trafic `/` est routé vers le Service Kubernetes `shoploc-webclient:80`.
  - Le trafic `/api/shops` est routé vers le backend Spring Boot `service-shop:8080`.
- **Secrets déjà configurés** :
  - Sur K3s (namespace `shoploc`) : Secret `ghcr-secret` actif (permettant de puller les images privées depuis `ghcr.io/miagecollectivit/*`).
  - Sur GitHub Actions (organisation/repo) : `SSH_HOST`, `SSH_USER` et `SSH_KEY` sont prêts.

---

## 2. Travail Demandé (5 Fichiers)

### Fichier 1 : Correction du Service API Angular
- **Chemin** : `shoploc/src/app/core/services/shop.service.ts`
- **Règle** : Dans une SPA exécutée côté navigateur client, `http://localhost:8080/api/shops` interroge la machine locale de l'utilisateur au lieu du serveur. Il faut impérativement utiliser un chemin relatif `/api/shops` pour passer par Traefik Ingress.
- **Modification** : Remplacer `private readonly apiUrl = 'http://localhost:8080/api/shops';` par `private readonly apiUrl = '/api/shops';`.
- **Tests** : Vérifier que les tests unitaires éventuels (`shop.service.spec.ts`) restent compatibles et au vert.

---

### Fichier 2 : Configuration Nginx pour le routage SPA
- **Chemin** : `nginx.conf` (à la racine du dépôt)
- **Contenu** :
```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Support impératif du routage HTML5 Angular (évite les erreurs 404 au rechargement)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des fichiers statiques
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, max-age=15552000, immutable";
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

### Fichier 3 : Dockerfile Multi-Stage de Production
- **Chemin** : `Dockerfile` (à la racine du dépôt, écraser l'existant)
- **Contenu** :
```dockerfile
# Stage 1 : Build de l'application Angular
FROM node:22-alpine AS build
WORKDIR /app

# Cache des dépendances
COPY shoploc/package*.json ./
RUN npm ci

# Copie des sources et compilation production
COPY shoploc/ ./
RUN npm run build -- --configuration production

# Stage 2 : Serveur Nginx Alpine de production
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Nettoyage et copie des artefacts compilés
RUN rm -rf ./*
COPY --from=build /app/dist/shoploc/browser ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Fichier 4 : Exclusion Docker
- **Chemin** : `.dockerignore` (à la racine du dépôt)
- **Contenu** :
```text
.git
.github
.husky
node_modules
dist
.vscode
.idea
Dockerfile*
docker-compose*
compose.yaml
README.md
```

---

### Fichier 5 : Manifest Kubernetes
- **Chemin** : `k8s/deployment.yaml`
- **Contenu** :
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shoploc-webclient
  namespace: shoploc
  labels:
    app: shoploc-webclient
spec:
  replicas: 1
  selector:
    matchLabels:
      app: shoploc-webclient
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: shoploc-webclient
    spec:
      imagePullSecrets:
        - name: ghcr-secret
      containers:
        - name: webclient
          image: ghcr.io/miagecollectivit/shoploc-web-client:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 80
              name: http
          resources:
            requests:
              cpu: 25m
              memory: 64Mi
            limits:
              cpu: 250m
              memory: 256Mi
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: shoploc-webclient
  namespace: shoploc
  labels:
    app: shoploc-webclient
spec:
  type: ClusterIP
  selector:
    app: shoploc-webclient
  ports:
    - name: http
      port: 80
      targetPort: 80
      protocol: TCP
```

---

### Fichier 6 : Pipeline GitHub Actions CI/CD
- **Chemin** : `.github/workflows/deploy.yml`
- **Contenu** :
```yaml
name: Deploy ShopLoc-Web-Client CI/CD

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: production-webclient-deploy
  cancel-in-progress: false

jobs:
  # ==========================================
  # JOB 1 : TESTS & COMPILATION ANGULAR
  # ==========================================
  test-and-build:
    name: Angular Build Verification
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
          cache-dependency-path: 'shoploc/package-lock.json'

      - name: Install dependencies
        run: |
          cd shoploc
          npm ci

      - name: Build Angular for Production
        run: |
          cd shoploc
          npm run build -- --configuration production

  # ==========================================
  # JOB 2 : BUILD & PUSH IMAGE DOCKER ARM64
  # ==========================================
  build-and-push:
    name: Build & Push Docker ARM64 to GHCR
    needs: test-and-build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up QEMU (ARM64 emulation)
        uses: docker/setup-qemu-action@v3
        with:
          platforms: arm64

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Compute Lowercase Image Name
        run: |
          echo "IMAGE_NAME=ghcr.io/${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha,format=short

      - name: Build and push Docker ARM64 image
        uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  # ==========================================
  # JOB 3 : DÉPLOIEMENT AUTOMATIQUE SUR K3S
  # ==========================================
  deploy:
    name: Rollout Deploy to K3s Cluster
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: SSH into K3s host and rollout restart
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
            cat << 'EOF' > /home/ubuntu/shoploc-poc/shoploc-webclient.yaml
            apiVersion: apps/v1
            kind: Deployment
            metadata:
              name: shoploc-webclient
              namespace: shoploc
              labels:
                app: shoploc-webclient
            spec:
              replicas: 1
              selector:
                matchLabels:
                  app: shoploc-webclient
              strategy:
                type: RollingUpdate
                rollingUpdate:
                  maxSurge: 1
                  maxUnavailable: 0
              template:
                metadata:
                  labels:
                    app: shoploc-webclient
                spec:
                  imagePullSecrets:
                    - name: ghcr-secret
                  containers:
                    - name: webclient
                      image: ghcr.io/miagecollectivit/shoploc-web-client:latest
                      imagePullPolicy: Always
                      ports:
                        - containerPort: 80
                          name: http
                      resources:
                        requests:
                          cpu: 25m
                          memory: 64Mi
                        limits:
                          cpu: 250m
                          memory: 256Mi
                      livenessProbe:
                        httpGet:
                          path: /
                          port: 80
                        initialDelaySeconds: 15
                        periodSeconds: 10
                        timeoutSeconds: 3
                        failureThreshold: 3
                      readinessProbe:
                        httpGet:
                          path: /
                          port: 80
                        initialDelaySeconds: 5
                        periodSeconds: 5
                        timeoutSeconds: 3
                        failureThreshold: 3
            ---
            apiVersion: v1
            kind: Service
            metadata:
              name: shoploc-webclient
              namespace: shoploc
              labels:
                app: shoploc-webclient
            spec:
              type: ClusterIP
              selector:
                app: shoploc-webclient
              ports:
                - name: http
                  port: 80
                  targetPort: 80
                  protocol: TCP
            EOF
            kubectl apply -f /home/ubuntu/shoploc-poc/shoploc-webclient.yaml
            kubectl rollout restart deployment/shoploc-webclient -n shoploc
            kubectl rollout status deployment/shoploc-webclient -n shoploc --timeout=180s
```

---

## 3. Validation & Push
1. Lancer un test de build local : `cd shoploc && npm run build` pour certifier l'absence d'erreur TypeScript.
2. Commiter avec le message : `feat(ci): configure production nginx, multi-stage arm64 dockerfile and k3s deployment`.
3. Pousser sur la branche `main` (`git push origin main`).
