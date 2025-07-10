# 🚀 Guide de Production - Alpha-Back API

## 📋 Checklist de Production

### ✅ Sécurité
- [ ] **JWT_SECRET** : Changé avec une clé de minimum 32 caractères aléatoires
- [ ] **Synchronize Database** : Désactivé en production (`DB_SYNCHRONIZE=false`)
- [ ] **Database Logging** : Désactivé en production (`DB_LOGGING=false`)
- [ ] **CORS Origins** : Configuré avec les domaines frontend réels
- [ ] **Rate Limiting** : Activé et configuré selon vos besoins
- [ ] **Helmet** : Activé pour la sécurité HTTP
- [ ] **Variables d'environnement** : Toutes les valeurs par défaut changées

### ✅ Performance
- [ ] **Compression** : Activée
- [ ] **Database Indexes** : Vérifiés et optimisés
- [ ] **Logging** : Configuré pour la production
- [ ] **Health Check** : Endpoint `/health` disponible

### ✅ Configuration Environnement
- [ ] **NODE_ENV=production**
- [ ] **Base de données** : Chemin correct et persistant
- [ ] **CinetPay** : Clés API réelles configurées
- [ ] **Swagger** : Désactivé en production

## 🔐 Variables d'Environnement Critiques

```bash
# OBLIGATOIRE - Changez ces valeurs !
JWT_SECRET=votre-cle-jwt-super-secrete-minimum-32-caracteres
CINETPAY_API_KEY=votre-vraie-cle-api-cinetpay
CINETPAY_SITE_ID=votre-vrai-site-id-cinetpay

# Configuration
NODE_ENV=production
PORT=3000
DATABASE_PATH=/app/data/database.sqlite

# CORS - Ajoutez vos vrais domaines
CORS_ORIGINS=https://votre-frontend.com,https://admin.votre-frontend.com

# Sécurité Base de Données
DB_SYNCHRONIZE=false
DB_LOGGING=false

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=10
```

## 🚀 Méthodes de Déploiement

### 1. Déploiement Standard

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd alpha-back

# 2. Configurer l'environnement
cp .env.production .env
# Éditer .env avec vos vraies valeurs

# 3. Déployer
chmod +x deploy.sh
./deploy.sh

# 4. Démarrer
npm run start:prod
```

### 2. Déploiement avec PM2 (Recommandé)

```bash
# Installation PM2
npm install -g pm2

# Déploiement
./deploy.sh

# Démarrage avec PM2
npm run start:prod:pm2

# Gestion PM2
pm2 status
pm2 logs alpha-back
pm2 restart alpha-back
pm2 stop alpha-back
```

### 3. Déploiement Docker

```bash
# 1. Configurer les variables d'environnement
cp .env.production .env

# 2. Build et démarrage
docker-compose up -d

# 3. Vérifier les logs
docker-compose logs -f alpha-back

# 4. Health check
curl http://localhost:3000/health
```

## 🔧 Configuration Base de Données

### SQLite (Recommandé pour petites/moyennes charges)

```bash
# Chemin de production
DATABASE_PATH=/app/data/database.sqlite

# Backup automatique (ajoutez au cron)
0 2 * * * cp /app/data/database.sqlite /app/backups/db-$(date +\%Y\%m\%d).sqlite
```

### Migration vers PostgreSQL (Pour de grosses charges)

Si vous avez besoin de migrer vers PostgreSQL :

```typescript
// Dans src/config/database.config.ts
export const createDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.name'),
  entities: [User, Patient, Payment, Subscription],
  synchronize: false, // TOUJOURS false en production
  logging: false,
});
```

## 📊 Monitoring et Maintenance

### Health Check

```bash
# Vérification manuelle
curl http://localhost:3000/health

# Monitoring automatique (exemple avec cron)
*/5 * * * * curl -f http://localhost:3000/health || echo "API DOWN" | mail admin@example.com
```

### Logs

```bash
# Logs PM2
pm2 logs alpha-back

# Logs Docker
docker-compose logs -f alpha-back

# Rotation des logs (PM2)
pm2 install pm2-logrotate
```

### Backup Base de Données

```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /app/data/database.sqlite $BACKUP_DIR/database_$DATE.sqlite
# Garder seulement les 30 derniers backups
ls -t $BACKUP_DIR/database_*.sqlite | tail -n +31 | xargs rm -f
```

## 🛡️ Sécurité en Production

### 1. Firewall

```bash
# Ouvrir seulement les ports nécessaires
ufw allow 22    # SSH
ufw allow 3000  # API
ufw enable
```

### 2. SSL/TLS

Utilisez un reverse proxy comme Nginx :

```nginx
server {
    listen 443 ssl;
    server_name api.votre-domaine.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Variables d'Environnement Sécurisées

```bash
# Utiliser un gestionnaire de secrets
# AWS: AWS Secrets Manager
# Azure: Key Vault
# Google Cloud: Secret Manager
# Local: Hashicorp Vault
```

## 📈 Performance

### 1. Optimisation Base de Données

```sql
-- Indexes recommandés
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_subscriptions_patient_id ON subscriptions(patient_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 2. Rate Limiting

```bash
# Configuration fine selon votre usage
RATE_LIMIT_TTL=60     # 60 secondes
RATE_LIMIT_LIMIT=100  # 100 requêtes par minute
```

## 🚨 Troubleshooting

### Problèmes Courants

1. **Database locked** : Vérifiez les permissions et que l'app n'est pas lancée en double
2. **JWT errors** : Vérifiez que JWT_SECRET est bien configuré
3. **CORS errors** : Vérifiez CORS_ORIGINS
4. **Memory leaks** : Utilisez PM2 avec `--max-memory-restart`

### Commandes Utiles

```bash
# Vérifier l'état de l'application
pm2 status
pm2 monit

# Redémarrer en cas de problème
pm2 restart alpha-back

# Vérifier les logs d'erreur
pm2 logs alpha-back --err

# Réinitialiser la base de données (ATTENTION!)
npm run db:reset
```

## 📞 Support

Pour toute question ou problème en production :

1. Vérifiez les logs : `pm2 logs alpha-back`
2. Vérifiez le health check : `curl http://localhost:3000/health`
3. Consultez la documentation Swagger en dev : `http://localhost:3000/api/docs`
4. Vérifiez les variables d'environnement

---

**⚠️ IMPORTANT :** Testez toujours en environnement de staging avant la production !
