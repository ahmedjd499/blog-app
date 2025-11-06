# 🚀 Quick Test Guide

## Run All Tests

### Backend Tests
```bash
cd backend
npm test
```

### E2E Tests with Report
```bash
cd frontend
npm run e2e:report
```

## View Test Reports

### Backend Coverage Report
```bash
# Windows
start backend\coverage\lcov-report\index.html

# Mac/Linux
open backend/coverage/lcov-report/index.html
```

### E2E Test Report
```bash
# Windows
start frontend\cypress\reports\mochawesome\report.html

# Mac/Linux
open frontend/cypress/reports/mochawesome/report.html
```

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | password123 | Admin |
| editor@test.com | password123 | Editor |
| writer@test.com | password123 | Writer |
| reader@test.com | password123 | Reader |

## Tested Scenarios

### ✅ Authentication
- Register, login, logout
- Token refresh
- Password hashing

### ✅ Authorization
- Role-based access control
- Permission checks
- Route guards

### ✅ Articles
- Create, read, update, delete
- Ownership validation
- Editor/Admin override

### ✅ Comments
- Post comments
- Edit own comments
- Delete permissions

### ✅ Admin Panel
- User management
- Role changes
- User deletion

### ✅ Security
- Unauthenticated access blocked
- Unauthorized access blocked
- Session management

## Full Documentation

See [TESTING.md](TESTING.md) for complete testing documentation.
