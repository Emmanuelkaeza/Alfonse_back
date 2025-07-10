#!/bin/bash

# Script de déploiement pour Alpha-Back
set -e

echo "🚀 Démarrage du déploiement Alpha-Back..."

# Variables
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}

echo "📋 Environnement: $NODE_ENV"
echo "🔌 Port: $PORT"

# Vérification des variables d'environnement critiques
if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERREUR: JWT_SECRET n'est pas défini"
    echo "Définissez JWT_SECRET avec une clé de minimum 32 caractères"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ ERREUR: JWT_SECRET doit contenir au minimum 32 caractères"
    exit 1
fi

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm ci --only=production

# Build de l'application
echo "🔨 Compilation de l'application..."
npm run build

# Création du répertoire de données si nécessaire
echo "📁 Création des répertoires nécessaires..."
mkdir -p data
mkdir -p logs

# Vérification de la configuration de base de données
if [ "$NODE_ENV" = "production" ]; then
    if grep -q "synchronize.*true" src/config/database.config.ts; then
        echo "❌ ERREUR: synchronize est activé en production!"
        echo "Modifiez src/config/database.config.ts pour désactiver synchronize en production"
        exit 1
    fi
fi

# Seed de la base de données (seulement si elle n'existe pas)
if [ ! -f "$DATABASE_PATH" ] && [ ! -f "data/database.sqlite" ]; then
    echo "🌱 Initialisation de la base de données..."
    npm run db:seed:prod
fi

echo "✅ Déploiement terminé avec succès!"
echo ""
echo "Pour démarrer l'application:"
echo "  npm run start:prod"
echo ""
echo "Ou avec PM2:"
echo "  npm run start:prod:pm2"
echo ""
echo "Health check disponible sur:"
echo "  http://localhost:$PORT/health"
