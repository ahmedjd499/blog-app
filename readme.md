# 📝 Blog Platform - Multi-Author Blogging Application

A collaborative blogging platform built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) featuring JWT authentication, role-based access control (RBAC), real-time comments via Socket.io, and push notifications.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-16-red.svg)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

🇫🇷 [Version Française](README.fr.md)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Project Structure](#-project-structure)
- [Technical Choices](#-technical-choices)
- [Testing](#-testing)
- [Role & Permissions](#-role--permissions)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure signup/login with JWT (Access + Refresh tokens)
- Password hashing with bcrypt
- 4 user roles: **Admin**, **Editor**, **Writer**, **Reader**
- Role-Based Access Control (RBAC) with granular permissions

### 📰 Article Management
- Create, read, update, delete articles (CRUD)
- Rich text editor with Quill.js
- Image upload for articles
- Pagination, search, and filtering
- Role-based permissions (Writers create, Editors edit all, Admins control everything)

### 💬 Real-time Comments System
- Live comments with Socket.io
- Nested replies support
- Edit and delete comments
- Real-time notifications for new comments

### 🔔 Push Notifications
- Real-time notifications via Socket.io
- Persistent notifications in MongoDB (auto-expire after 30 days)
- Dropdown interface with unread badge counter
- Desktop and mobile support
- Browser Notification API integration

### 🎨 User Interface
- Modern responsive design with Tailwind CSS
- Intuitive navigation with dynamic navbar
- Full mobile support
- Dark mode ready

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.18 | Web framework |
| MongoDB | 6+ | NoSQL database |
| Mongoose | 8.0 | MongoDB ODM |
| Socket.io | 4.6 | Real-time bidirectional communication |
| JWT | - | Authentication & authorization |
| Bcrypt | - | Password hashing |
| Multer | - | File uploads |
| Express-validator | - | Input validation |
| Jest | - | Testing framework |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 16.2 | Frontend framework |
| TypeScript | 5.1 | Typed JavaScript |
| RxJS | 7.8 | Reactive programming |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| Socket.io-client | 4.8 | WebSocket client |
| Quill.js | 1.3 | Rich text editor |
| Cypress | 13+ | E2E testing |

### DevOps & Tools
- **Nodemon** - Auto-reload server
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables
- **Helmet** - Security middleware
- **Swagger** - API documentation

---

## 📦 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager (included with Node.js)
- **Angular CLI** (optional but recommended):
  ```bash
  npm install -g @angular/cli
  ```

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ahmedjd499/blog-app.git
cd blog-app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Copy example file
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/blog-app

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this

# JWT Expiration
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:4200
```

#### Initialize Database with Mock Data

```bash
# Ensure MongoDB is running
npm run import-data
```

This creates test users:
- **Admin**: admin@test.com / password123
- **Editor**: editor@test.com / password123
- **Writer**: writer@test.com / password123
- **Reader**: reader@test.com / password123

#### Start Backend Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Backend runs on `http://localhost:5000`

**Swagger API Documentation**: http://localhost:5000/api-docs

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment

Check `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  socketUrl: 'http://localhost:5000'
};
```

#### Start Frontend Application

```bash
# Development server
ng serve
# or
npm start
```

Frontend runs on `http://localhost:4200`

### 4️⃣ Access the Application

1. Open browser: http://localhost:4200
2. Login with test credentials (e.g., admin@test.com / password123)
3. Explore the features!

---

## 📁 Project Structure

```
blog-app/
├── backend/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── roles.js                 # Role definitions
│   │   └── swagger.js               # Swagger configuration
│   ├── controllers/
│   │   ├── adminController.js       # Admin operations
│   │   ├── articleController.js     # Article CRUD logic
│   │   ├── authController.js        # Authentication logic
│   │   ├── commentController.js     # Comments + notifications
│   │   └── notificationController.js # Notification management
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── checkRole.js             # Permission control
│   │   ├── articlePermissions.js    # Article-specific permissions
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── upload.js                # File upload handling
│   ├── models/
│   │   ├── Article.js               # Article schema
│   │   ├── Comment.js               # Comment schema
│   │   ├── Notification.js          # Notification schema
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── admin.js                 # Admin routes
│   │   ├── articles.js              # Article API routes
│   │   ├── auth.js                  # Auth API routes
│   │   ├── comments.js              # Comment API routes
│   │   └── notifications.js         # Notification API routes
│   ├── sockets/
│   │   └── commentSocket.js         # Socket.io real-time logic
│   ├── scripts/
│   │   ├── generateMockData.js      # Generate test data
│   │   └── importMockData.js        # Import data to DB
│   ├── __tests__/                   # Jest test files
│   ├── uploads/                     # Uploaded images
│   ├── .env                         # Environment variables
│   ├── server.js                    # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── admin-dashboard/     # Admin panel
│   │   │   │   ├── article-card/        # Article card component
│   │   │   │   ├── article-detail/      # Article detail view
│   │   │   │   ├── article-form/        # Create/Edit article
│   │   │   │   ├── article-list/        # Articles listing
│   │   │   │   ├── comment-list/        # Comments display
│   │   │   │   ├── home/                # Homepage
│   │   │   │   ├── login/               # Login page
│   │   │   │   ├── navbar/              # Navigation + notifications
│   │   │   │   ├── register/            # Registration page
│   │   │   │   └── user-profile/        # User profile
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts        # Authenticated route protection
│   │   │   │   └── role.guard.ts        # Role-based route protection
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts  # Auto JWT + refresh handling
│   │   │   ├── services/
│   │   │   │   ├── article.service.ts   # Article API service
│   │   │   │   ├── auth.service.ts      # Authentication service
│   │   │   │   ├── comment.service.ts   # Comment service
│   │   │   │   ├── notification.service.ts # Notification service
│   │   │   │   ├── socket.service.ts    # Socket.io service
│   │   │   │   └── admin.service.ts     # Admin operations service
│   │   │   ├── directives/
│   │   │   │   └── click-outside.directive.ts # Close dropdown on outside click
│   │   │   ├── pipes/
│   │   │   │   └── time-ago.pipe.ts     # Relative time formatting
│   │   │   ├── models/
│   │   │   │   └── *.model.ts           # TypeScript interfaces
│   │   │   ├── app-routing.module.ts    # Route configuration
│   │   │   └── app.module.ts            # Root module
│   │   ├── assets/                      # Images, fonts
│   │   ├── environments/                # Environment configs
│   │   └── styles.css                   # Global styles
│   ├── cypress/
│   │   ├── e2e/
│   │   │   └── roles-permissions.cy.ts  # E2E tests for RBAC
│   │   └── support/                     # Cypress support files
│   ├── tailwind.config.js
│   ├── angular.json
│   ├── cypress.config.ts
│   └── package.json
│
├── README.md                            # This file
└── README.fr.md                         # French version
```

---

## 🎯 Technical Choices

### Backend Architecture

#### 1. **Express.js with MVC Pattern**
**Why?**
- Clear separation of concerns (routes, controllers, models)
- Maintainable and testable code
- Scalable architecture

**Benefits:**
- Easy to onboard new developers
- Follows industry best practices
- Facilitates unit and integration testing

#### 2. **MongoDB with Mongoose**
**Why?**
- Flexible schema for articles and comments
- Excellent read/write performance
- Native support for nested structures (comment replies)

**Optimizations:**
- Index on `recipient + createdAt` for notifications
- TTL index for automatic notification expiration (30 days)
- Index on `articleId` for comment queries
- Compound indexes for pagination

#### 3. **JWT with Refresh Token Strategy**
**Why?**
- Short access token (15min) for security
- Long refresh token (7 days) for UX
- Stateless: no server-side sessions

**Benefits:**
- Horizontal scalability
- Reduced database lookups
- Automatic token refresh for seamless UX

#### 4. **Socket.io for Real-time Features**
**Why?**
- Bidirectional communication for comments
- Personal rooms per user (`user_${userId}`)
- Article rooms for contextual comments

**Benefits:**
- Instant notifications without polling
- Reduced server load
- Better user experience

#### 5. **Role-Based Access Control (RBAC)**
**Implementation:**
- Reusable `checkRole([roles])` middleware
- Hierarchy: Admin > Editor > Writer > Reader
- Permission checks at route and controller level

**Benefits:**
- Centralized permission logic
- Easy to add new roles
- Secure by default

### Frontend Architecture

#### 1. **Angular 16 with TypeScript**
**Why?**
- Robust framework for complex applications
- Type safety with TypeScript
- Native dependency injection
- Modular architecture

**Benefits:**
- Predictable and maintainable code
- Strong community and ecosystem
- Enterprise-ready

#### 2. **RxJS for State Management**
**Implementation:**
- `BehaviorSubject` for `currentUser$`, `notifications$`
- Reactive streams for real-time updates
- Observable patterns throughout

**Benefits:**
- Automatic UI synchronization
- Composable data flows
- Memory leak prevention

#### 3. **Route Guards for Security**
- **AuthGuard**: Protects authenticated routes
- **RoleGuard**: Controls access by role
- **CanDeactivate**: Warns about unsaved changes

**Benefits:**
- Declarative security in routing
- Prevents unauthorized access
- Clear navigation flow

#### 4. **HTTP Interceptor**
**Features:**
- Automatic JWT token attachment
- Automatic token refresh on 401
- Request queue during refresh
- Error handling

**Benefits:**
- Transparent authentication
- Seamless token renewal
- Better UX

#### 5. **Tailwind CSS**
**Why?**
- Rapid development with utility classes
- Consistent design system
- Responsive design made easy
- Optimized bundle size (purge CSS)

**Benefits:**
- High productivity
- Small production bundle
- Easy customization

### Security Measures

1. **bcrypt Hashing** (10 salt rounds)
2. **Input Validation** (express-validator + Angular validators)
3. **CORS Configuration** for frontend origin
4. **Short-lived Tokens** with refresh strategy
5. **Data Sanitization** for user inputs
6. **XSS Protection** (no raw HTML in comments)
7. **Rate Limiting** on sensitive endpoints
8. **Helmet.js** for HTTP headers security

### Performance Optimizations

1. **MongoDB Indexes** for frequent queries
2. **Server-side Pagination**
3. **Lazy Loading** of Angular modules
4. **Tree-shaking** with Tailwind purge
5. **Gzip Compression** (production)
6. **Image Optimization** with Multer limits
7. **Connection Pooling** for MongoDB

---

## 🧪 Testing

### Backend Tests (Jest + Supertest)

The backend includes comprehensive unit and integration tests.

#### Run Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Test Coverage

Tests cover:
- ✅ Authentication (register, login, refresh token)
- ✅ Authorization (role-based access)
- ✅ Article CRUD operations
- ✅ Comment system
- ✅ Notification system
- ✅ Middleware (auth, role check)

**Coverage Report**: `backend/coverage/lcov-report/index.html`

### Frontend E2E Tests (Cypress)

End-to-end tests validate the entire role and permissions system.

#### Run E2E Tests

```bash
cd frontend

# Interactive mode (Cypress Test Runner)
npm run e2e:open

# Headless mode (CI/CD)
npm run e2e

# With HTML report
npm run e2e:report
```

#### Test Coverage

E2E tests validate:

**Reader Role:**
- ✅ Cannot access article creation
- ✅ Cannot see "Write Article" button
- ✅ Can view articles
- ✅ Can post comments
- ✅ Cannot see edit/delete buttons on others' articles
- ✅ Cannot access admin panel

**Writer Role:**
- ✅ Can create articles
- ✅ Can edit own articles
- ✅ Can delete own articles
- ✅ Cannot edit others' articles
- ✅ Cannot access admin panel

**Editor Role:**
- ✅ Can create articles
- ✅ Can edit ANY article
- ✅ Can delete ANY article
- ✅ Cannot access admin panel

**Admin Role:**
- ✅ Full access to all features
- ✅ Can access admin dashboard
- ✅ Can manage users (change roles, delete)
- ✅ Can edit/delete any content

**Security Tests:**
- ✅ Unauthenticated users redirected to login
- ✅ Session maintained after page refresh
- ✅ Session cleared on logout
- ✅ Role-based route protection

#### View Test Report

After running `npm run e2e:report`, open:
```
frontend/cypress/reports/mochawesome/report.html
```

---

## 🔐 Role & Permissions

### Role Hierarchy

```
Admin (Highest)
  ↓
Editor
  ↓
Writer
  ↓
Reader (Lowest)
```

### Permission Matrix

| Permission | Reader | Writer | Editor | Admin |
|------------|--------|--------|--------|-------|
| View articles | ✅ | ✅ | ✅ | ✅ |
| Post comments | ✅ | ✅ | ✅ | ✅ |
| Delete own comments | ✅ | ✅ | ✅ | ✅ |
| Create articles | ❌ | ✅ | ✅ | ✅ |
| Edit own articles | ❌ | ✅ | ✅ | ✅ |
| Delete own articles | ❌ | ✅ | ✅ | ✅ |
| Edit any article | ❌ | ❌ | ✅ | ✅ |
| Delete any article | ❌ | ❌ | ✅ | ✅ |
| Delete any comment | ❌ | ❌ | ❌ | ✅ |
| Access admin panel | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ❌ | ✅ |

### Implementation Details

**Backend (Express Middleware):**
```javascript
// Protect routes
router.post('/articles', 
  authenticate, 
  checkRole(['writer', 'editor', 'admin']), 
  createArticle
);

// Article-specific permissions
router.put('/articles/:id', 
  authenticate, 
  checkArticlePermission, 
  updateArticle
);
```

**Frontend (Angular Guards):**
```typescript
// Route protection
{
  path: 'admin',
  component: AdminDashboardComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

---

## 📚 API Documentation

### Interactive API Docs

Once the backend is running, access Swagger UI:

**URL**: http://localhost:5000/api-docs

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout

#### Articles
- `GET /api/articles` - List articles (paginated)
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create article (Writer+)
- `PUT /api/articles/:id` - Update article (Owner, Editor, Admin)
- `DELETE /api/articles/:id` - Delete article (Owner, Editor, Admin)

#### Comments
- `GET /api/comments/article/:articleId` - Get article comments
- `POST /api/comments` - Create comment (Authenticated)
- `PUT /api/comments/:id` - Update comment (Owner)
- `DELETE /api/comments/:id` - Delete comment (Owner, Admin)

#### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

#### Admin
- `GET /api/admin/users` - List all users (Admin)
- `PUT /api/admin/users/:id/role` - Change user role (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)
- `GET /api/admin/stats` - Get dashboard stats (Admin)

---

## 👨‍💻 Author

**Ahmed**
- GitHub: [@ahmedjd499](https://github.com/ahmedjd499)
- Email: ahmedjaidi4@gmail.com

---

**⭐ If you find this project useful, please consider giving it a star!**

