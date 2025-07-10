# Dockerfile multi-stage pour production
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS production

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copier les node_modules de production
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Créer le répertoire pour la base de données
RUN mkdir -p /app/data && chown nestjs:nodejs /app/data

# Passer à l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/app/data/database.sqlite

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["node", "dist/main.js"]
