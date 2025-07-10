@echo off
REM Script de déploiement pour Alpha-Back (Windows)
setlocal EnableDelayedExpansion

echo 🚀 Démarrage du déploiement Alpha-Back...

REM Variables
if "%NODE_ENV%"=="" set NODE_ENV=production
if "%PORT%"=="" set PORT=3000

echo 📋 Environnement: %NODE_ENV%
echo 🔌 Port: %PORT%

REM Vérification des variables d'environnement critiques
if "%JWT_SECRET%"=="" (
    echo ❌ ERREUR: JWT_SECRET n'est pas défini
    echo Définissez JWT_SECRET avec une clé de minimum 32 caractères
    exit /b 1
)

REM Installation des dépendances
echo 📦 Installation des dépendances...
npm ci --only=production
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances
    exit /b 1
)

REM Build de l'application
echo 🔨 Compilation de l'application...
npm run build
if errorlevel 1 (
    echo ❌ Erreur lors de la compilation
    exit /b 1
)

REM Création du répertoire de données si nécessaire
echo 📁 Création des répertoires nécessaires...
if not exist "data" mkdir data
if not exist "logs" mkdir logs

REM Seed de la base de données (seulement si elle n'existe pas)
if not exist "%DATABASE_PATH%" if not exist "data\database.sqlite" (
    echo 🌱 Initialisation de la base de données...
    npm run db:seed:prod
)

echo ✅ Déploiement terminé avec succès!
echo.
echo Pour démarrer l'application:
echo   npm run start:prod
echo.
echo Health check disponible sur:
echo   http://localhost:%PORT%/health

endlocal
