FROM node:22-alpine
WORKDIR /app

# Copie des dépendances pour optimiser le cache Docker
COPY shoploc/package*.json ./
RUN npm install

# Copie du code source
COPY shoploc/ ./

EXPOSE 4200

# Lance le serveur de dev Angular accessible depuis l'extérieur du conteneur
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
