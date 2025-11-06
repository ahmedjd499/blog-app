# Blog Platform - Multi-Author Blogging Application

Une plateforme de blogging collaborative construite avec la stack MEAN (MongoDB, Express.js, Angular, Node.js) avec authentification JWT, gestion des rôles, commentaires en temps réel via Socket.io, et système de notifications.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [Choix techniques](#choix-techniques)
- [Tests](#tests)
- [Utilisation](#utilisation)
- [Gestion des rôles et permissions](#gestion-des-rôles-et-permissions)

## ✨ Fonctionnalités

### Authentification et Autorisation
- Système d'inscription et de connexion sécurisé avec JWT
- Refresh token pour maintenir la session utilisateur
- 4 rôles utilisateurs : **Admin**, **Editor**, **Writer**, **Reader**
- Gestion des permissions basée sur les rôles (RBAC)

### Gestion des Articles
- Création, modification, suppression d'articles
- Upload d'images pour les articles
- Liste paginée des articles
- Recherche et filtrage des articles
- Permissions selon le rôle (Writer peut créer, Editor peut éditer, Admin tout contrôler)

### Système de Commentaires
- Commentaires en temps réel avec Socket.io
- Système de réponses (replies) imbriquées
- Modification et suppression de commentaires
- Notifications en temps réel pour les nouveaux commentaires

### Système de Notifications
- Notifications push en temps réel via Socket.io
- Notifications persistantes stockées en MongoDB (expiration automatique après 30 jours)
- Interface dropdown avec badge de compteur non-lu
- Support desktop et mobile
- Notifications navigateur (Browser Notification API)

### Interface Utilisateur
- Design moderne et responsive avec Tailwind CSS
- Navigation intuitive avec navbar dynamique
- Support mobile complet
- Dark mode ready

## 🛠 Technologies utilisées

### Backend
- **Node.js** v18+ - Runtime JavaScript
- **Express.js** v4.18 - Framework web
- **MongoDB** avec **Mongoose** - Base de données NoSQL
- **Socket.io** v4.6 - Communication temps réel bidirectionnelle
- **JWT** (jsonwebtoken) - Authentification et autorisation
- **Bcrypt** - Hachage des mots de passe
- **Multer** - Upload de fichiers
- **Express-validator** - Validation des données

### Frontend
- **Angular** v16.2.16 - Framework frontend
- **TypeScript** - Langage typé
- **RxJS** - Programmation réactive
- **Tailwind CSS** v3.4 - Framework CSS utility-first
- **Socket.io-client** - Client WebSocket
- **Angular Router** - Navigation SPA

### DevOps & Outils
- **Nodemon** - Rechargement automatique du serveur
- **CORS** - Configuration des requêtes cross-origin
- **dotenv** - Gestion des variables d'environnement
- **helmet** - Middleware de sécurité pour Express 

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) - [Télécharger](https://nodejs.org/)
- **MongoDB** (v6 ou supérieur) - [Télécharger](https://www.mongodb.com/try/download/community)
- **npm** ou **yarn** - Gestionnaire de paquets (inclus avec Node.js)
- **Angular CLI** (optionnel mais recommandé) :
  ```bash
  npm install -g @angular/cli
  ```

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ahmedjd499/blog-app.git
cd blog-app
```

### 2. Configuration du Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier `backend` :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog-platform
JWT_SECRET=votre_secret_jwt_très_sécurisé_ici
JWT_REFRESH_SECRET=votre_refresh_secret_très_sécurisé_ici
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
```

**Important** : Remplacez les secrets JWT par vos propres valeurs sécurisées en production.

### 3. Configuration du Frontend

```bash
cd ../frontend
npm install
```

Vérifier le fichier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};
```

### 4. Démarrer MongoDB

Assurez-vous que MongoDB est en cours d'exécution :

```bash
# Windows (si installé comme service)
net start MongoDB

# macOS/Linux
mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Lancer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```

Le serveur backend démarre sur `http://localhost:5000`

**Terminal 2 - Frontend :**
```bash
cd frontend
ng serve
# ou
npm start
```

L'application frontend est accessible sur `http://localhost:4200`

### 6. Création du premier compte Admin

Au premier lancement, inscrivez-vous via l'interface. Le premier utilisateur est automatiquement Admin. Vous pouvez ensuite créer d'autres utilisateurs avec différents rôles depuis le panneau Admin.

## 📁 Structure du projet

```
blog-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Configuration MongoDB
│   ├── controllers/
│   │   ├── articleController.js  # Logique des articles
│   │   ├── authController.js     # Authentification
│   │   ├── commentController.js  # Commentaires + notifications
│   │   ├── notificationController.js # Gestion notifications
│   │   └── userController.js     # Gestion utilisateurs
│   ├── middleware/
│   │   ├── auth.js              # Vérification JWT
│   │   ├── roleCheck.js         # Contrôle des permissions
│   │   └── upload.js            # Upload fichiers
│   ├── models/
│   │   ├── Article.js           # Schéma MongoDB Article
│   │   ├── Comment.js           # Schéma MongoDB Comment
│   │   ├── Notification.js      # Schéma MongoDB Notification
│   │   └── User.js              # Schéma MongoDB User
│   ├── routes/
│   │   ├── articles.js          # Routes API articles
│   │   ├── auth.js              # Routes API auth
│   │   ├── comments.js          # Routes API commentaires
│   │   ├── notifications.js     # Routes API notifications
│   │   └── users.js             # Routes API utilisateurs
│   ├── uploads/                 # Dossier images uploadées
│   ├── .env                     # Variables d'environnement
│   ├── server.js                # Point d'entrée serveur
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── admin-dashboard/    # Gestion admin
│   │   │   │   ├── article-detail/     # Détail article
│   │   │   │   ├── article-form/       # Création/édition
│   │   │   │   ├── article-list/       # Liste articles
│   │   │   │   ├── comment-list/       # Commentaires
│   │   │   │   ├── home/               # Page accueil
│   │   │   │   ├── login/              # Connexion
│   │   │   │   ├── navbar/             # Navigation + notifications
│   │   │   │   ├── profile/            # Profil utilisateur
│   │   │   │   └── register/           # Inscription
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts       # Protection routes authentifiées
│   │   │   │   └── role.guard.ts       # Protection routes par rôle
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts # Ajout token + refresh
│   │   │   ├── services/
│   │   │   │   ├── article.service.ts  # Service articles
│   │   │   │   ├── auth.service.ts     # Service authentification
│   │   │   │   ├── comment.service.ts  # Service commentaires
│   │   │   │   ├── notification.service.ts # Service notifications
│   │   │   │   ├── socket.service.ts   # Service Socket.io
│   │   │   │   └── user.service.ts     # Service utilisateurs
│   │   │   ├── directives/
│   │   │   │   └── click-outside.directive.ts # Fermeture dropdown
│   │   │   ├── pipes/
│   │   │   │   └── time-ago.pipe.ts    # Format temps relatif
│   │   │   ├── app-routing.module.ts   # Configuration routes
│   │   │   └── app.module.ts           # Module principal
│   │   ├── assets/                     # Images, fonts
│   │   ├── environments/               # Configuration env
│   │   └── styles.css                  # Styles globaux
│   ├── tailwind.config.js
│   ├── angular.json
│   └── package.json
│
└── README.md
```

## 🎯 Choix techniques

### Architecture Backend

#### 1. **Express.js avec architecture MVC**
- **Pourquoi ?** Séparation claire des responsabilités (routes, contrôleurs, modèles)
- **Avantage** : Code maintenable, testable, et évolutif

#### 2. **MongoDB avec Mongoose**
- **Pourquoi ?** 
  - Schéma flexible pour les articles et commentaires
  - Excellentes performances pour les lectures/écritures fréquentes
  - Support natif des structures imbriquées (replies dans comments)
- **Optimisations** :
  - Index sur `recipient + createdAt` pour les notifications
  - TTL index pour expiration automatique des notifications (30 jours)
  - Index sur `articleId` pour les commentaires

#### 3. **JWT avec Refresh Token**
- **Pourquoi ?** 
  - Access token court (15min) pour la sécurité
  - Refresh token long (7j) pour l'expérience utilisateur
  - Stateless : pas de session côté serveur
- **Avantage** : Scalabilité horizontale facilitée

#### 4. **Socket.io pour le temps réel**
- **Pourquoi ?** 
  - Communication bidirectionnelle pour les commentaires
  - Rooms personnelles par utilisateur (`user_${userId}`)
  - Rooms par article pour les commentaires contextuels
- **Avantage** : Notifications instantanées sans polling

#### 5. **Système de rôles avec middleware**
- **Implémentation** : Middleware `roleCheck([roles])` réutilisable
- **Hiérarchie** : Admin > Editor > Writer > Reader
- **Avantage** : Centralisation de la logique de permissions

### Architecture Frontend

#### 1. **Angular 16 avec TypeScript**
- **Pourquoi ?** 
  - Framework robuste pour les applications complexes
  - Type safety avec TypeScript
  - Dependency Injection natif
- **Avantage** : Code prévisible et maintenable

#### 2. **RxJS pour la gestion d'état**
- **Implémentation** : 
  - `BehaviorSubject` pour `currentUser$`, `notifications$`
  - Streams réactifs pour les mises à jour temps réel
- **Avantage** : Synchronisation automatique de l'UI

#### 3. **Guards pour la sécurité**
- **AuthGuard** : Protège les routes authentifiées
- **RoleGuard** : Contrôle l'accès par rôle
- **Avantage** : Sécurité déclarative dans le routing

#### 4. **Interceptor HTTP**
- **Fonctionnalités** :
  - Ajout automatique du token JWT
  - Refresh automatique du token sur 401
  - File d'attente des requêtes pendant le refresh
- **Avantage** : Authentification transparente

#### 5. **Tailwind CSS**
- **Pourquoi ?** 
  - Développement rapide avec classes utilitaires
  - Design system cohérent
  - Responsive design facilité
  - Taille finale optimisée (purge CSS)
- **Avantage** : Productivité et performances

### Sécurité

1. **Hachage bcrypt** (salt rounds: 10)
2. **Validation des entrées** (express-validator)
3. **CORS configuré** pour l'origine frontend
4. **Tokens courts** avec refresh strategy
5. **Sanitization** des données utilisateur
6. **Protection XSS** (pas de HTML brut dans les commentaires)

### Performance

1. **Index MongoDB** pour les requêtes fréquentes
2. **Pagination** côté serveur
3. **Lazy loading** des modules Angular (potentiel)
4. **Tree-shaking** avec Tailwind purge
5. **Compression gzip** (à activer en production)

## 🧪 Tests

### Tests Backend

Les tests unitaires et d'intégration pour le backend utilisent **Jest** et **Supertest**.

#### Installation des dépendances de test

```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server @types/jest
```

#### Configuration de Jest

Créer `backend/jest.config.js` :

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**'
  ],
  testMatch: ['**/__tests__/**/*.test.js']
};
```

#### Tests des rôles et permissions

Créer `backend/__tests__/roles.test.js` :

```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Article = require('../models/Article');
const mongoose = require('mongoose');

describe('Roles and Permissions Tests', () => {
  let adminToken, editorToken, writerToken, readerToken;
  let adminUser, editorUser, writerUser, readerUser;
  let testArticle;

  beforeAll(async () => {
    // Connexion à la base de test
    await mongoose.connect(process.env.MONGODB_TEST_URI);
    
    // Créer des utilisateurs de test
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    
    editorUser = await User.create({
      username: 'editor',
      email: 'editor@test.com',
      password: 'password123',
      role: 'editor'
    });
    
    writerUser = await User.create({
      username: 'writer',
      email: 'writer@test.com',
      password: 'password123',
      role: 'writer'
    });
    
    readerUser = await User.create({
      username: 'reader',
      email: 'reader@test.com',
      password: 'password123',
      role: 'reader'
    });

    // Obtenir les tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminRes.body.data.accessToken;

    const editorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'editor@test.com', password: 'password123' });
    editorToken = editorRes.body.data.accessToken;

    const writerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'writer@test.com', password: 'password123' });
    writerToken = writerRes.body.data.accessToken;

    const readerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reader@test.com', password: 'password123' });
    readerToken = readerRes.body.data.accessToken;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Article Creation Permissions', () => {
    test('Admin can create article', async () => {
      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Article',
          content: 'Content by admin',
          excerpt: 'Excerpt'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testArticle = res.body.data;
    });

    test('Editor can create article', async () => {
      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Editor Article',
          content: 'Content by editor',
          excerpt: 'Excerpt'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Writer can create article', async () => {
      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${writerToken}`)
        .send({
          title: 'Writer Article',
          content: 'Content by writer',
          excerpt: 'Excerpt'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('Reader cannot create article', async () => {
      const res = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Article',
          content: 'Content by reader',
          excerpt: 'Excerpt'
        });
      
      expect(res.status).toBe(403);
    });
  });

  describe('Article Edit Permissions', () => {
    test('Admin can edit any article', async () => {
      const res = await request(app)
        .put(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated by Admin',
          content: 'Updated content',
          excerpt: 'Updated excerpt'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated by Admin');
    });

    test('Editor can edit any article', async () => {
      const res = await request(app)
        .put(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          title: 'Updated by Editor',
          content: 'Updated content',
          excerpt: 'Updated excerpt'
        });
      
      expect(res.status).toBe(200);
    });

    test('Writer can only edit own articles', async () => {
      const res = await request(app)
        .put(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${writerToken}`)
        .send({
          title: 'Updated by Writer',
          content: 'Updated content',
          excerpt: 'Updated excerpt'
        });
      
      expect(res.status).toBe(403);
    });

    test('Reader cannot edit articles', async () => {
      const res = await request(app)
        .put(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Updated by Reader',
          content: 'Updated content',
          excerpt: 'Updated excerpt'
        });
      
      expect(res.status).toBe(403);
    });
  });

  describe('Article Delete Permissions', () => {
    test('Reader cannot delete articles', async () => {
      const res = await request(app)
        .delete(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${readerToken}`);
      
      expect(res.status).toBe(403);
    });

    test('Writer cannot delete others articles', async () => {
      const res = await request(app)
        .delete(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${writerToken}`);
      
      expect(res.status).toBe(403);
    });

    test('Admin can delete any article', async () => {
      const res = await request(app)
        .delete(`/api/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });
  });

  describe('User Management Permissions', () => {
    test('Admin can get all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Admin can update user roles', async () => {
      const res = await request(app)
        .put(`/api/users/${readerUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'writer' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('writer');
    });

    test('Non-admin cannot update user roles', async () => {
      const res = await request(app)
        .put(`/api/users/${readerUser._id}/role`)
        .set('Authorization', `Bearer ${editorToken}`)
        .send({ role: 'admin' });
      
      expect(res.status).toBe(403);
    });

    test('Admin can delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${readerUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
    });

    test('Non-admin cannot delete users', async () => {
      const res = await request(app)
        .delete(`/api/users/${writerUser._id}`)
        .set('Authorization', `Bearer ${editorToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});
```

#### Exécuter les tests

Ajouter dans `backend/package.json` :

```json
"scripts": {
  "test": "jest --coverage",
  "test:watch": "jest --watch"
}
```

Lancer les tests :

```bash
npm test
```

### Tests Frontend (E2E)

Les tests end-to-end utilisent **Cypress**.

#### Installation de Cypress

```bash
cd frontend
npm install --save-dev cypress
```

#### Configuration

Créer `frontend/cypress/e2e/roles-permissions.cy.ts` :

```typescript
describe('Roles and Permissions E2E Tests', () => {
  const baseUrl = 'http://localhost:4200';
  const apiUrl = 'http://localhost:5000/api';

  // Helper pour login
  const login = (email: string, password: string) => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
  };

  describe('Reader Role', () => {
    beforeEach(() => {
      login('reader@test.com', 'password123');
    });

    it('should not see "Write Article" button', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.contains('Write Article').should('not.exist');
    });

    it('should not access article creation page', () => {
      cy.visit(`${baseUrl}/articles/create`);
      cy.url().should('not.include', '/articles/create');
      cy.url().should('include', '/articles');
    });

    it('should be able to read articles', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').should('exist');
    });

    it('should be able to comment', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').first().click();
      cy.get('textarea[placeholder*="comment"]').type('Test comment');
      cy.contains('Post Comment').click();
      cy.contains('Test comment').should('exist');
    });
  });

  describe('Writer Role', () => {
    beforeEach(() => {
      login('writer@test.com', 'password123');
    });

    it('should see "Write Article" button', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.contains('Write Article').should('exist');
    });

    it('should be able to create article', () => {
      cy.visit(`${baseUrl}/articles/create`);
      cy.get('input[name="title"]').type('Test Article');
      cy.get('textarea[name="excerpt"]').type('Test excerpt');
      cy.get('textarea[name="content"]').type('Test content');
      cy.contains('Publish').click();
      cy.contains('Test Article').should('exist');
    });

    it('should be able to edit own articles', () => {
      cy.visit(`${baseUrl}/profile`);
      cy.get('.my-article').first().find('button').contains('Edit').click();
      cy.get('input[name="title"]').clear().type('Updated Article');
      cy.contains('Update').click();
      cy.contains('Updated Article').should('exist');
    });

    it('should not be able to edit others articles', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').first().click();
      cy.contains('Edit Article').should('not.exist');
    });
  });

  describe('Editor Role', () => {
    beforeEach(() => {
      login('editor@test.com', 'password123');
    });

    it('should be able to edit any article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').first().click();
      cy.contains('Edit Article').should('exist');
      cy.contains('Edit Article').click();
      cy.get('input[name="title"]').clear().type('Edited by Editor');
      cy.contains('Update').click();
      cy.contains('Edited by Editor').should('exist');
    });

    it('should be able to delete any article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').first().click();
      cy.contains('Delete').click();
      cy.contains('Confirm').click();
      cy.url().should('include', '/articles');
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      login('admin@test.com', 'password123');
    });

    it('should see Admin Dashboard link', () => {
      cy.contains('Admin').should('exist');
    });

    it('should access admin dashboard', () => {
      cy.contains('Admin').click();
      cy.url().should('include', '/admin');
      cy.contains('User Management').should('exist');
    });

    it('should be able to change user roles', () => {
      cy.visit(`${baseUrl}/admin`);
      cy.get('.user-row').first().within(() => {
        cy.get('select').select('editor');
        cy.contains('Save').click();
      });
      cy.contains('Role updated').should('exist');
    });

    it('should be able to delete users', () => {
      cy.visit(`${baseUrl}/admin`);
      cy.get('.user-row').last().within(() => {
        cy.contains('Delete').click();
      });
      cy.contains('Confirm').click();
      cy.contains('User deleted').should('exist');
    });

    it('should be able to delete any article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.get('.article-card').first().click();
      cy.contains('Delete').click();
      cy.contains('Confirm').click();
      cy.contains('deleted successfully').should('exist');
    });
  });

  describe('Navigation Guards', () => {
    it('should redirect unauthenticated users', () => {
      cy.visit(`${baseUrl}/articles/create`);
      cy.url().should('include', '/login');
    });

    it('should prevent role escalation', () => {
      login('reader@test.com', 'password123');
      cy.visit(`${baseUrl}/admin`);
      cy.url().should('not.include', '/admin');
    });
  });
});
```

#### Exécuter les tests E2E

Ajouter dans `frontend/package.json` :

```json
"scripts": {
  "e2e": "cypress open",
  "e2e:headless": "cypress run"
}
```

Lancer les tests :

```bash
npm run e2e
```

## 👥 Gestion des rôles et permissions

### Hiérarchie des rôles

| Rôle | Permissions |
|------|------------|
| **Admin** | Accès complet : gérer utilisateurs, modifier/supprimer tous articles, accès dashboard admin |
| **Editor** | Créer/éditer/supprimer tous les articles, gérer commentaires |
| **Writer** | Créer des articles, éditer/supprimer uniquement ses propres articles |
| **Reader** | Lire articles, poster commentaires, gérer son profil |

### Matrice de permissions détaillée

| Action | Admin | Editor | Writer | Reader |
|--------|-------|--------|--------|--------|
| Lire articles | ✅ | ✅ | ✅ | ✅ |
| Créer article | ✅ | ✅ | ✅ | ❌ |
| Éditer propre article | ✅ | ✅ | ✅ | ❌ |
| Éditer article autre | ✅ | ✅ | ❌ | ❌ |
| Supprimer propre article | ✅ | ✅ | ✅ | ❌ |
| Supprimer article autre | ✅ | ✅ | ❌ | ❌ |
| Poster commentaire | ✅ | ✅ | ✅ | ✅ |
| Supprimer propre commentaire | ✅ | ✅ | ✅ | ✅ |
| Supprimer commentaire autre | ✅ | ✅ | ❌ | ❌ |
| Voir liste utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Modifier rôle utilisateur | ✅ | ❌ | ❌ | ❌ |
| Supprimer utilisateur | ✅ | ❌ | ❌ | ❌ |
| Accès dashboard admin | ✅ | ❌ | ❌ | ❌ |

### Implémentation technique

#### Backend - Middleware `roleCheck`

```javascript
// middleware/roleCheck.js
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};
```

#### Frontend - RoleGuard

```typescript
// guards/role.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const expectedRoles = route.data['roles'] as string[];
  const currentUser = this.authService.currentUserValue;

  if (!currentUser || !expectedRoles.includes(currentUser.role)) {
    this.router.navigate(['/articles']);
    return false;
  }

  return true;
}
```

## 📝 Utilisation

### Créer un article

1. Connectez-vous avec un compte Writer, Editor ou Admin
2. Cliquez sur "Write Article" dans la navbar
3. Remplissez le formulaire (titre, extrait, contenu, image optionnelle)
4. Cliquez sur "Publish"

### Commenter un article

1. Ouvrez un article
2. Scrollez jusqu'à la section commentaires
3. Tapez votre commentaire
4. Cliquez sur "Post Comment"
5. Pour répondre, cliquez sur "Reply" sous un commentaire

### Gérer les notifications

1. Cliquez sur l'icône cloche dans la navbar
2. Badge rouge indique les notifications non lues
3. Cliquez sur une notification pour accéder à l'article
4. Cliquez sur "X" pour supprimer une notification
5. "Clear All" pour tout effacer

### Administration (Admin uniquement)

1. Cliquez sur "Admin" dans la navbar
2. Gérez les utilisateurs : changez les rôles, supprimez des comptes
3. Visualisez les statistiques de la plateforme

## 🚀 Déploiement en Production

### Backend

1. Configurez les variables d'environnement :
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=votre_secret_très_très_long_et_sécurisé
```

2. Activez CORS pour votre domaine frontend :
```javascript
app.use(cors({
  origin: 'https://votre-domaine.com',
  credentials: true
}));
```

3. Activez la compression gzip et le rate limiting

### Frontend

1. Build de production :
```bash
ng build --configuration production
```

2. Configurez `environment.prod.ts` :
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.votre-domaine.com/api',
  socketUrl: 'https://api.votre-domaine.com'
};
```

3. Déployez le dossier `dist/` sur un hébergement (Netlify, Vercel, etc.)

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Ahmed - [GitHub](https://github.com/ahmedjd499)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
