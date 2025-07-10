# 📱 Guide d'Intégration Frontend - Alpha-Back API

## 🎯 Vue d'Ensemble

Cette API fournit tous les endpoints nécessaires pour créer une application frontend complète de gestion de clinique. Le frontend peut être développé avec n'importe quelle technologie (React, Vue.js, Angular, etc.).

## 🔐 Authentification

### Flux d'Authentification
1. **Connexion** : Le frontend envoie email/password → reçoit un token JWT
2. **Stockage** : Stocker le token de façon sécurisée (localStorage sécurisé ou cookies HttpOnly)
3. **Utilisation** : Inclure le token dans l'header `Authorization: Bearer <token>` pour toutes les requêtes
4. **Expiration** : Gérer l'expiration du token (7 jours par défaut) et la reconnexion

### Endpoints d'Authentification
- **POST /auth/login** : Connexion utilisateur
- **POST /auth/register** : Inscription (si activée)
- **GET /auth/profile** : Profil utilisateur connecté

## 👥 Gestion des Utilisateurs

### Types d'Utilisateurs
- **Admin** : Accès complet à toutes les fonctionnalités
- **Réceptionniste** : Gestion des patients et paiements (lecture/écriture)

### Fonctionnalités Frontend Nécessaires
- **Liste des utilisateurs** avec pagination et recherche
- **Formulaire de création/modification** d'utilisateur
- **Gestion des rôles** (dropdown avec admin/réceptionniste)
- **Activation/désactivation** des comptes
- **Changement de mot de passe**

### Endpoints Utilisateurs
- **GET /users** : Liste paginée avec recherche
- **POST /users** : Créer un utilisateur
- **GET /users/:id** : Détails d'un utilisateur
- **PATCH /users/:id** : Modifier un utilisateur
- **DELETE /users/:id** : Supprimer un utilisateur

## 🏥 Gestion des Patients

### Informations Patient
- **Données personnelles** : Nom, prénom, email, téléphone, adresse
- **Informations médicales** : Date de naissance, groupe sanguin, allergies, antécédents
- **Statut** : Actif/Inactif
- **Dates** : Création, dernière mise à jour

### Fonctionnalités Frontend Nécessaires
- **Tableau de bord patients** avec recherche avancée (nom, email, téléphone)
- **Formulaire patient complet** avec validation
- **Profil patient détaillé** avec historique des paiements et abonnements
- **Export de données** (PDF, Excel)
- **Import en lot** (CSV)

### Endpoints Patients
- **GET /patients** : Liste paginée avec recherche multi-critères
- **POST /patients** : Enregistrer un nouveau patient
- **GET /patients/:id** : Fiche complète du patient
- **PATCH /patients/:id** : Modifier les informations
- **DELETE /patients/:id** : Supprimer (avec confirmation)

## 💰 Gestion des Paiements

### Types de Paiements
- **Cash** : Paiement en espèces
- **Card** : Paiement par carte
- **CinetPay** : Paiement en ligne
- **Other** : Autres méthodes

### Statuts de Paiement
- **Pending** : En attente
- **Completed** : Complété
- **Failed** : Échoué
- **Cancelled** : Annulé

### Fonctionnalités Frontend Nécessaires
- **Interface de paiement** avec sélection de méthode
- **Intégration CinetPay** pour paiements en ligne
- **Historique des paiements** avec filtres par date, statut, méthode
- **Reçus de paiement** générés automatiquement
- **Tableaux de bord financiers** avec graphiques
- **Rapports de revenus** par période

### Endpoints Paiements
- **GET /payments** : Liste avec filtres et pagination
- **POST /payments** : Enregistrer un paiement
- **GET /payments/:id** : Détails d'un paiement
- **POST /payments/cinetpay** : Initier un paiement CinetPay
- **POST /payments/cinetpay/callback** : Callback CinetPay (webhook)

## 📅 Gestion des Abonnements

### Plans d'Abonnement
- **Basic** : Plan de base (500 FCFA/mois)
- **Premium** : Plan premium (1000 FCFA/mois)
- **VIP** : Plan VIP (2000 FCFA/mois)

### Statuts d'Abonnement
- **Active** : Abonnement actif
- **Expired** : Expiré
- **Cancelled** : Annulé
- **Pending** : En attente de paiement

### Fonctionnalités Frontend Nécessaires
- **Sélection de plan** avec comparatif des fonctionnalités
- **Processus d'abonnement** guidé
- **Gestion du renouvellement** automatique et manuel
- **Historique des abonnements** par patient
- **Notifications d'expiration** (push, email)
- **Upgrade/downgrade** de plans

### Endpoints Abonnements
- **GET /subscriptions** : Liste avec filtres
- **POST /subscriptions** : Créer un abonnement
- **GET /subscriptions/:id** : Détails d'un abonnement
- **PATCH /subscriptions/:id** : Modifier un abonnement
- **POST /subscriptions/:id/renew** : Renouveler
- **DELETE /subscriptions/:id** : Annuler

## 📊 Tableaux de Bord et Statistiques

### Dashboard Principal
- **Métriques clés** : Nombre de patients, revenus du mois, abonnements actifs
- **Graphiques** : Évolution des revenus, nouveaux patients, taux de renouvellement
- **Activité récente** : Derniers paiements, nouveaux patients, expirations à venir

### Rapports Disponibles
- **Rapport financier** : Revenus par période, méthodes de paiement
- **Rapport patients** : Nouveaux patients, patients actifs/inactifs
- **Rapport abonnements** : Taux de conversion, renouvellements, annulations

### Endpoints Statistiques
- **GET /users/stats** : Statistiques utilisateurs
- **GET /patients/stats** : Statistiques patients
- **GET /payments/stats** : Statistiques paiements
- **GET /subscriptions/stats** : Statistiques abonnements

## 🎨 Suggestions d'Interface

### Design System
- **Couleurs** : Palette médicale (bleu, vert, blanc)
- **Typography** : Police claire et lisible
- **Iconographie** : Icônes médicales et administratives
- **Responsive** : Mobile-first design

### Composants Essentiels
- **Navigation** : Menu latéral avec rôles
- **Tableaux** : Avec tri, pagination, recherche
- **Formulaires** : Validation en temps réel
- **Modales** : Confirmations, détails rapides
- **Notifications** : Toast pour actions réussies/échouées
- **Loading states** : Spinners, skeletons

### Pages Principales
1. **Dashboard** : Vue d'ensemble avec métriques
2. **Patients** : Liste, création, modification, profil
3. **Paiements** : Historique, nouveau paiement, rapports
4. **Abonnements** : Plans, gestion, renouvellements
5. **Utilisateurs** : Gestion des comptes (admin uniquement)
6. **Paramètres** : Configuration, profil utilisateur

## 🔔 Notifications et Alertes

### Types de Notifications
- **Paiements** : Confirmations, échecs
- **Abonnements** : Expirations, renouvellements
- **Système** : Erreurs, maintenances
- **Activité** : Nouveaux patients, actions importantes

### Méthodes de Notification
- **In-app** : Notifications dans l'interface
- **Email** : Notifications par email (à implémenter côté backend)
- **Push** : Notifications push navigateur

## 🔒 Sécurité Frontend

### Bonnes Pratiques
- **Validation côté client** : Toujours doubler avec validation backend
- **Sanitisation** : Nettoyer les entrées utilisateur
- **HTTPS** : Toujours utiliser HTTPS en production
- **CSP** : Content Security Policy
- **Token storage** : Stockage sécurisé des tokens JWT

### Gestion des Permissions
- **Affichage conditionnel** : Masquer les fonctionnalités selon le rôle
- **Redirection** : Rediriger si accès non autorisé
- **Feedback** : Messages clairs pour les actions interdites

## 📱 Responsive et Mobile

### Breakpoints Recommandés
- **Mobile** : 320px - 768px
- **Tablet** : 768px - 1024px
- **Desktop** : 1024px+

### Fonctionnalités Mobile
- **Navigation tactile** : Menu hamburger, gestes
- **Formulaires optimisés** : Claviers adaptés, validation tactile
- **Tableaux responsifs** : Colonnes cachées/affichées selon l'écran

## 🚀 Performance

### Optimisations
- **Pagination** : Charger les données par pages
- **Lazy loading** : Charger les images/composants à la demande
- **Caching** : Cache intelligent des données
- **Debouncing** : Pour les recherches en temps réel

### Monitoring
- **Temps de chargement** : Surveiller les performances
- **Erreurs API** : Logger et gérer les erreurs
- **Usage** : Analytics pour améliorer l'UX

## 📋 Checklist d'Intégration

### Phase 1 : Authentification
- [ ] Formulaire de connexion
- [ ] Gestion du token JWT
- [ ] Redirection selon les rôles
- [ ] Déconnexion et expiration

### Phase 2 : Patients
- [ ] Liste des patients avec recherche
- [ ] Formulaire d'ajout/modification
- [ ] Profil patient complet
- [ ] Validation des données

### Phase 3 : Paiements
- [ ] Interface de paiement
- [ ] Intégration CinetPay
- [ ] Historique et rapports
- [ ] Génération de reçus

### Phase 4 : Abonnements
- [ ] Sélection et souscription
- [ ] Gestion des renouvellements
- [ ] Historique des abonnements
- [ ] Notifications d'expiration

### Phase 5 : Administration
- [ ] Gestion des utilisateurs (admin)
- [ ] Tableaux de bord
- [ ] Rapports et statistiques
- [ ] Paramètres système

## 📞 Support Technique

### Documentation API
- **Swagger** : Disponible en développement sur `/api/docs`
- **Postman Collection** : Collection prête pour tests
- **Exemples** : Exemples de requêtes/réponses

### Codes d'Erreur Courants
- **401** : Non authentifié - Rediriger vers login
- **403** : Non autorisé - Afficher message d'erreur
- **404** : Ressource non trouvée
- **422** : Données invalides - Afficher erreurs de validation
- **500** : Erreur serveur - Afficher message générique

---

**💡 Conseil :** Commencez par implémenter l'authentification et la gestion des patients, puis ajoutez progressivement les autres fonctionnalités.
