# Utiliser une image de Node.js de base avec Alpine pour des images légères
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de configuration de dépendances
COPY package*.json ./

# Installer les dépendances de l'application
RUN npm install

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Exposer le port 3000 (port par défaut de React)
EXPOSE 3000

# Lancer le serveur de développement React
CMD ["npm", "start"]
