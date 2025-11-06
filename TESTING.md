# 🧪 Testing Guide - Blog Platform

This guide covers all testing strategies, setup, and execution for the blog platform project.

---

## 📋 Table of Contents

- [Testing Strategy](#testing-strategy)
- [Backend Tests (Jest)](#backend-tests-jest)
- [Frontend E2E Tests (Cypress)](#frontend-e2e-tests-cypress)
- [Test Data](#test-data)
- [CI/CD Integration](#cicd-integration)

---

## 🎯 Testing Strategy

### Test Pyramid

```
        E2E Tests (Cypress)
       /                  \
      /   Integration      \
     /    Tests (Jest)       \
    /                          \
   /    Unit Tests (Jest)       \
  /________________________________\
```

### Coverage Goals

- **Unit Tests**: 80%+ code coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys + RBAC

---

## 🔧 Backend Tests (Jest)

### Setup

Tests are already configured in the project. Dependencies:
- `jest` - Test framework
- `supertest` - HTTP assertions
- `mongodb-memory-server` - In-memory MongoDB for tests

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test auth.api.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Verbose output
npm test -- --verbose
```

### Test Structure

```
backend/
└── __tests__/
    ├── auth.api.test.js           # Authentication tests
    ├── article.api.test.js        # Article CRUD tests
    ├── comment.api.test.js        # Comment system tests
    ├── notification.api.test.js   # Notification tests
    └── roles.test.js              # Role & permissions tests
```

### Test Coverage

#### 1. Authentication Tests (`auth.api.test.js`)

**Tests:**
- ✅ User registration
  - Valid registration
  - Duplicate email handling
  - Password validation
- ✅ User login
  - Successful login with valid credentials
  - Failed login with invalid credentials
  - Token generation (access + refresh)
- ✅ Token refresh
  - Valid refresh token
  - Expired refresh token
  - Invalid refresh token
- ✅ Logout
  - Successful logout
  - Clear refresh token

**Run:**
```bash
npm test auth.api.test.js
```

#### 2. Article Tests (`article.api.test.js`)

**Tests:**
- ✅ Create article
  - Writer can create
  - Editor can create
  - Admin can create
  - Reader cannot create
- ✅ Get articles
  - Public access to list
  - Pagination works
  - Search and filtering
- ✅ Update article
  - Owner can update
  - Editor can update any
  - Admin can update any
  - Non-owner writer cannot update
- ✅ Delete article
  - Owner can delete
  - Editor can delete any
  - Admin can delete any
  - Non-owner writer cannot delete

**Run:**
```bash
npm test article.api.test.js
```

#### 3. Comment Tests (`comment.api.test.js`)

**Tests:**
- ✅ Create comment
  - Authenticated users can comment
  - Unauthenticated users cannot comment
  - Comment on existing article
- ✅ Get comments
  - Fetch all comments for an article
  - Nested replies structure
- ✅ Update comment
  - Owner can update own comment
  - Non-owner cannot update
- ✅ Delete comment
  - Owner can delete own comment
  - Admin can delete any comment
  - Non-owner cannot delete

**Run:**
```bash
npm test comment.api.test.js
```

#### 4. Notification Tests (`notification.api.test.js`)

**Tests:**
- ✅ Create notification
  - Notification created on new comment
  - Notification created on reply
- ✅ Get notifications
  - User gets own notifications only
  - Unread count is correct
- ✅ Mark as read
  - Single notification
  - All notifications
- ✅ Delete notification
  - Owner can delete own notification

**Run:**
```bash
npm test notification.api.test.js
```

#### 5. Role & Permission Tests (`roles.test.js`)

**Tests:**
- ✅ Role middleware
  - checkRole allows authorized roles
  - checkRole blocks unauthorized roles
- ✅ Article permissions
  - Writer owns article: can edit/delete
  - Editor: can edit/delete any article
  - Admin: can edit/delete any article
  - Reader: cannot edit/delete any article

**Run:**
```bash
npm test roles.test.js
```

### View Coverage Report

After running `npm run test:coverage`, open:
```bash
# Windows
start backend/coverage/lcov-report/index.html

# Mac
open backend/coverage/lcov-report/index.html

# Linux
xdg-open backend/coverage/lcov-report/index.html
```

### Coverage Report Location

```
backend/
└── coverage/
    ├── lcov.info              # Coverage data for CI
    ├── coverage-final.json    # JSON coverage data
    └── lcov-report/
        └── index.html         # HTML coverage report
```

---

## 🌐 Frontend E2E Tests (Cypress)

### Setup

Cypress is already configured. No additional setup needed.

### Running Tests

```bash
cd frontend

# Interactive mode (Cypress Test Runner)
npx cypress open
# or
npm run e2e:open

# Headless mode (all specs)
npx cypress run
# or
npm run e2e

# Run specific spec
npx cypress run --spec "cypress/e2e/roles-permissions.cy.ts"

# Generate HTML report
npm run e2e:report
```

### Test Structure

```
frontend/
└── cypress/
    ├── e2e/
    │   └── roles-permissions.cy.ts    # Main E2E test suite
    ├── support/
    │   ├── commands.ts                # Custom commands
    │   └── e2e.ts                     # Support file
    └── fixtures/                      # Test data
```

### Test Coverage

#### Roles & Permissions E2E (`roles-permissions.cy.ts`)

**Test Suites:**

1. **Reader Role Tests**
   - ✅ Should successfully login as Reader
   - ✅ Should NOT see "Write Article" button in navbar
   - ✅ Should NOT access article creation page
   - ✅ Should be able to read articles
   - ✅ Should be able to view article details
   - ✅ Should be able to post comments
   - ✅ Should NOT see edit/delete buttons on articles
   - ✅ Should NOT see Admin link in navbar

2. **Writer Role Tests**
   - ✅ Should successfully login as Writer
   - ✅ Should see "Write Article" button in navbar
   - ✅ Should be able to access article creation page
   - ✅ Should be able to create a new article
   - ✅ Should be able to edit own articles
   - ✅ Should be able to delete own articles
   - ✅ Should NOT be able to edit articles from other users
   - ✅ Should NOT see Admin link in navbar

3. **Editor Role Tests**
   - ✅ Should successfully login as Editor
   - ✅ Should see "Write Article" button
   - ✅ Should be able to create articles
   - ✅ Should be able to edit ANY article
   - ✅ Should be able to delete ANY article
   - ✅ Should NOT see Admin link (unless also admin)

4. **Admin Role Tests**
   - ✅ Should successfully login as Admin
   - ✅ Should see Admin link in navbar
   - ✅ Should be able to access admin dashboard
   - ✅ Should see list of users in admin dashboard
   - ✅ Should be able to change user roles
   - ✅ Should be able to delete users
   - ✅ Should be able to edit ANY article
   - ✅ Should be able to delete ANY article
   - ✅ Should be able to create articles

5. **Navigation Guards and Security**
   - ✅ Should redirect unauthenticated users to login
   - ✅ Should prevent reader from accessing admin panel
   - ✅ Should prevent writer from accessing admin panel
   - ✅ Should prevent editor from accessing admin panel
   - ✅ Should maintain session after page refresh
   - ✅ Should clear session on logout

6. **Comments Permissions**
   - ✅ Should allow all authenticated users to comment
   - ✅ Should allow users to delete their own comments
   - ✅ Should allow admin to delete any comment

### View E2E Test Report

After running `npm run e2e:report`, open:
```bash
# Windows
start frontend\cypress\reports\mochawesome\report.html

# Mac
open frontend/cypress/reports/mochawesome/report.html

# Linux
xdg-open frontend/cypress/reports/mochawesome/report.html
```

### Report Features

The Mochawesome HTML report includes:
- 📊 Pass/Fail statistics with charts
- ⏱️ Test duration for each test
- 📸 Screenshots for failed tests
- 🔍 Detailed test output and logs
- 📁 Organized by test suites
- 🎨 Beautiful, responsive design

### Test Report Location

```
frontend/
└── cypress/
    ├── reports/
    │   └── mochawesome/
    │       ├── *.json              # Individual test results
    │       ├── report.json         # Merged results
    │       └── report.html         # Final HTML report
    ├── screenshots/                # Failed test screenshots
    └── videos/                     # Test execution videos (if enabled)
```

---

## 📊 Test Data

### Mock Users

The project includes pre-configured test users (created via `npm run import-data`):

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@test.com | password123 | admin | Full system access |
| editor@test.com | password123 | editor | Edit any content |
| writer@test.com | password123 | writer | Create own content |
| reader@test.com | password123 | reader | Read-only access |

### Mock Data Scripts

```bash
# Backend directory
cd backend

# Generate mock data JSON files
node scripts/generateMockData.js

# Import mock data to MongoDB
npm run import-data

# OR do both with one command (if configured):
npm run seed
```

### Generated Mock Data

- **Users**: 4 users (one of each role)
- **Articles**: 10-20 sample articles
- **Comments**: 30-50 comments across articles
- **Notifications**: Generated based on comments

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
          
      - name: Run backend tests
        run: |
          cd backend
          npm test -- --coverage
        env:
          MONGODB_URI: mongodb://localhost:27017/blog-test
          JWT_SECRET: test-secret
          REFRESH_TOKEN_SECRET: test-refresh-secret
          
      - name: Upload backend coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
          flags: backend

  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install backend dependencies
        run: |
          cd backend
          npm ci
          
      - name: Start backend server
        run: |
          cd backend
          npm run import-data
          npm start &
          sleep 10
        env:
          MONGODB_URI: mongodb://localhost:27017/blog-test
          JWT_SECRET: test-secret
          REFRESH_TOKEN_SECRET: test-refresh-secret
          PORT: 5000
          
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          working-directory: frontend
          start: npm start
          wait-on: 'http://localhost:4200'
          wait-on-timeout: 120
          browser: chrome
          
      - name: Upload Cypress screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
          
      - name: Upload Cypress videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: frontend/cypress/videos
          
      - name: Upload test reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-reports
          path: frontend/cypress/reports
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test

variables:
  MONGODB_URI: "mongodb://mongo:27017/blog-test"
  JWT_SECRET: "test-secret"
  REFRESH_TOKEN_SECRET: "test-refresh-secret"

backend-tests:
  stage: test
  image: node:18
  services:
    - mongo:6
  before_script:
    - cd backend
    - npm ci
  script:
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    when: always
    paths:
      - backend/coverage/
    reports:
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage/cobertura-coverage.xml

e2e-tests:
  stage: test
  image: cypress/browsers:node18.12.0-chrome107
  services:
    - mongo:6
  before_script:
    - cd backend && npm ci && cd ..
    - cd frontend && npm ci && cd ..
  script:
    - cd backend
    - npm run import-data
    - npm start &
    - sleep 10
    - cd ../frontend
    - npm start &
    - npx wait-on http://localhost:4200
    - npm run e2e
  artifacts:
    when: always
    paths:
      - frontend/cypress/screenshots/
      - frontend/cypress/videos/
      - frontend/cypress/reports/
    expire_in: 1 week
```

---

## 📈 Test Metrics

### Backend Test Metrics

After running `npm run test:coverage`:

```
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
All files                   |   85.2  |   78.5   |   82.1  |   85.8  |
 controllers/               |   90.3  |   85.2   |   87.5  |   91.0  |
  authController.js         |   95.1  |   90.3   |   92.8  |   95.5  |
  articleController.js      |   88.7  |   82.1   |   85.2  |   89.3  |
  commentController.js      |   87.5  |   80.5   |   83.3  |   88.1  |
 middleware/                |   82.1  |   75.3   |   80.0  |   83.2  |
  auth.js                   |   88.5  |   82.1   |   85.7  |   89.2  |
  checkRole.js              |   92.3  |   88.9   |   90.0  |   93.1  |
 models/                    |   75.3  |   65.2   |   70.5  |   76.1  |
 routes/                    |   95.2  |   90.1   |   93.5  |   95.8  |
```

### E2E Test Metrics

After running `npm run e2e:report`:

```
✅ Passed: 45 tests
❌ Failed: 0 tests
⏭️ Skipped: 0 tests
⏱️ Duration: 2m 45s
```

---

## 🎯 Test Best Practices

### Backend Tests

1. **Use describe blocks** for grouping related tests
2. **Use beforeEach/afterEach** for setup/teardown
3. **Test one thing per test** - atomic tests
4. **Use meaningful test names** - "should do X when Y"
5. **Mock external dependencies** - don't call real APIs
6. **Clean up test data** - use in-memory DB or cleanup hooks

### E2E Tests

1. **Use custom commands** for repeated actions (login, logout)
2. **Use data-* attributes** for test selectors (better than classes)
3. **Wait for elements** - use `cy.wait()` or better assertions
4. **Test user journeys** - not just individual features
5. **Use fixtures** for test data
6. **Keep tests independent** - each test should run standalone

---

## 🐛 Debugging Tests

### Backend Tests

```bash
# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand auth.api.test.js

# Verbose output
npm test -- --verbose --detectOpenHandles

# Only failed tests
npm test -- --onlyFailures
```

### Cypress Tests

```bash
# Open Cypress Test Runner (best for debugging)
npm run e2e:open

# Run with Chrome DevTools
npx cypress run --headed --browser chrome

# Debug mode
DEBUG=cypress:* npm run e2e
```

---

## 📝 Writing New Tests

### Backend Test Template

```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('Feature Name', () => {
  let authToken;
  
  beforeEach(async () => {
    // Setup: create test data, get auth token, etc.
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'writer'
    });
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    authToken = response.body.accessToken;
  });
  
  afterEach(async () => {
    // Cleanup: remove test data
    await User.deleteMany({});
  });
  
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
  });
});
```

### Cypress Test Template

```typescript
describe('Feature Name', () => {
  const baseUrl = 'http://localhost:4200';
  
  beforeEach(() => {
    // Setup: login, navigate, etc.
    cy.visit(`${baseUrl}/login`);
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
  });
  
  it('should do something', () => {
    cy.visit(`${baseUrl}/page`);
    cy.get('[data-cy="element"]').should('exist');
    cy.get('[data-cy="element"]').click();
    cy.url().should('include', '/expected-path');
  });
});
```

---

## ✅ Test Checklist

Before submitting code, ensure:

- [ ] All backend tests pass: `npm test`
- [ ] Backend coverage ≥ 80%: `npm run test:coverage`
- [ ] All E2E tests pass: `npm run e2e`
- [ ] No console errors in Cypress tests
- [ ] Tests are independent (can run in any order)
- [ ] Test names are descriptive
- [ ] New features have corresponding tests
- [ ] Tests clean up after themselves

---

## 🆘 Troubleshooting

### Common Issues

**Backend tests hanging:**
```bash
# Add timeout and detect open handles
npm test -- --forceExit --detectOpenHandles
```

**Cypress tests failing randomly:**
```bash
# Increase timeouts in cypress.config.ts
defaultCommandTimeout: 10000,
requestTimeout: 10000,
```

**MongoDB connection error:**
```bash
# Ensure MongoDB is running
mongod --version
# Check connection string in .env
```

**Port already in use:**
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

---

**Happy Testing! 🎉**
