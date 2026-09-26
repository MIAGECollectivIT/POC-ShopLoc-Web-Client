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