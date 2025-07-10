# 🏥 API de Gestion de Clinique

API complète développée avec NestJS pour la gestion d'une clinique médicale, incluant la gestion des patients, des utilisateurs et des paiements via CinetPay.

## 🚀 Fonctionnalités

### 👥 Gestion des Utilisateurs
- **Administrateurs** : Accès complet au système
- **Réceptionnistes** : Gestion des patients et paiements
- Authentification JWT sécurisée
- Gestion des rôles et permissions

### 🏥 Gestion des Patients
- Enregistrement complet des patients
- Recherche et pagination
- Historique médical et allergies
- Contacts d'urgence
- Statistiques des patients

### 💳 Gestion des Paiements
- Support de multiples méthodes de paiement :
  - Espèces
  - Carte bancaire
  - Mobile Money
  - **CinetPay** (paiement en ligne)
- Suivi des transactions
- Statistiques financières
- Callbacks automatiques

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- SQLite (inclus)

## ⚡ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd alpha-back
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Modifier les variables dans .env
```

4. **Initialiser la base de données**
```bash
npm run db:seed
```

## 🔧 Configuration

### Variables d'environnement (.env)

```env
# Configuration de l'application
PORT=3000

# Configuration de la base de données
DATABASE_PATH=database.sqlite

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Configuration CinetPay
CINETPAY_API_KEY=your-cinetpay-api-key
CINETPAY_SITE_ID=your-cinetpay-site-id
CINETPAY_BASE_URL=https://api-checkout.cinetpay.com
```

## 🚀 Démarrage

### Mode développement
```bash
npm run start:dev
```

### Mode production
```bash
npm run build
npm run start:prod
```

## 📚 Documentation API

Une fois l'application démarrée, accédez à la documentation Swagger :

**URL :** `http://localhost:3000/api/docs`

### Comptes par défaut

Après l'initialisation (`npm run db:seed`) :

**Administrateur :**
- Email: `admin@clinic.com`
- Mot de passe: `admin123`

**Réceptionniste :**
- Email: `receptionist@clinic.com`  
- Mot de passe: `receptionist123`

## 🔗 Endpoints Principaux

### 🔐 Authentification
```
POST /auth/login          # Connexion utilisateur
```

### 👥 Utilisateurs (Admin uniquement)
```
GET    /users             # Liste des utilisateurs
POST   /users             # Créer un utilisateur
GET    /users/:id         # Détails d'un utilisateur
PATCH  /users/:id         # Modifier un utilisateur
DELETE /users/:id         # Supprimer un utilisateur
PATCH  /users/:id/toggle-status  # Activer/désactiver
```

### 🏥 Patients
```
GET    /patients          # Liste des patients (avec recherche/pagination)
POST   /patients          # Enregistrer un patient
GET    /patients/stats    # Statistiques des patients
GET    /patients/:id      # Détails d'un patient
PATCH  /patients/:id      # Modifier un patient
DELETE /patients/:id      # Supprimer un patient (Admin)
PATCH  /patients/:id/toggle-status  # Activer/désactiver
```

### 💳 Paiements
```
GET    /payments          # Liste des paiements (avec filtres)
POST   /payments          # Créer un paiement
GET    /payments/stats    # Statistiques des paiements
GET    /payments/:id      # Détails d'un paiement
GET    /payments/transaction/:transactionId  # Par ID transaction
PATCH  /payments/:id/status  # Modifier le statut (Admin)
POST   /payments/cinetpay/callback  # Callback CinetPay
```

## 🔒 Sécurité et Permissions

### Authentification
- JWT Bearer Token requis pour tous les endpoints (sauf /auth/login)
- Tokens avec expiration configurée

### Autorisation par rôles

| Endpoint | Admin | Réceptionniste |
|----------|-------|----------------|
| Gestion utilisateurs | ✅ | ❌ |
| Lecture patients | ✅ | ✅ |
| Écriture patients | ✅ | ✅ |
| Suppression patients | ✅ | ❌ |
| Gestion paiements | ✅ | ✅ |
| Statistiques avancées | ✅ | ❌ |

## 💳 Intégration CinetPay

### Configuration
1. Créer un compte sur [CinetPay](https://cinetpay.com)
2. Récupérer l'API Key et Site ID
3. Configurer les variables d'environnement

### Flux de paiement
1. **Création** : `POST /payments` avec `method: "cinetpay"`
2. **Redirection** : L'API retourne l'URL de paiement CinetPay
3. **Callback** : CinetPay notifie le statut via `/payments/cinetpay/callback`
4. **Vérification** : Le statut du paiement est mis à jour automatiquement

## 🗄️ Base de Données

### Structure
- **SQLite** pour le développement (facilement remplaçable)
- **TypeORM** pour l'ORM
- Migrations automatiques en mode développement

### Entités principales
- `User` : Utilisateurs du système
- `Patient` : Patients de la clinique  
- `Payment` : Transactions et paiements

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 🚀 Déploiement

### Variables de production
- Modifier `JWT_SECRET` avec une clé forte
- Configurer la base de données de production
- Sécuriser les endpoints sensibles
- Configurer HTTPS

---

**Développé avec ❤️ par l'équipe AlphaBack**
