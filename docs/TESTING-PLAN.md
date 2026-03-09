# 🧪 Awali Real Estate — Complete Testing Plan

## Enterprise-Grade Test Suite for the Awali Backend Platform

> **Version:** 1.0.0
> **Date:** March 9, 2026
> **Purpose:** Ensure every module, endpoint, business rule, and integration works perfectly before production deployment.

---

## 1. Testing Strategy Overview

### 1.1 Testing Pyramid

```
                    ┌───────────────┐
                    │   E2E Tests   │  ← Full workflow (lead → deal → close)
                    │    (10%)      │
                    ├───────────────┤
                    │  Integration  │  ← API routes + DB + middleware
                    │   Tests (30%) │
                    ├───────────────┤
                    │               │
                    │  Unit Tests   │  ← Services, utils, validators
                    │   (60%)       │
                    └───────────────┘
```

### 1.2 Technology Stack

| Tool                  | Purpose                              |
| --------------------- | ------------------------------------ |
| Jest                  | Test runner, assertions, mocking     |
| ts-jest               | TypeScript preprocessor              |
| Supertest             | HTTP route integration testing       |
| mongodb-memory-server | In-memory MongoDB for isolated tests |
| jest-mock-extended    | Type-safe mocks                      |
| @faker-js/faker       | Realistic test data generation       |

### 1.3 Base URL for Testing

All integration tests hit the Express app mounted at `http://localhost:5000/api/v1`. The test setup creates an in-memory server — no external dependencies.

```typescript
// Tests use relative paths: POST /api/v1/auth/login
// The app is configured with API_PREFIX=/api and API_VERSION=v1
```

---

## 2. Test Infrastructure Setup

### 2.1 Test Database (MongoDB Memory Server)

```
┌─────────────────────────────────────────────────────────────────────┐
│  TEST DATABASE LIFECYCLE                                            │
│                                                                     │
│  beforeAll()  → Start MongoMemoryServer, connect Mongoose          │
│  beforeEach() → Clear all collections (clean slate per test)       │
│  afterAll()   → Disconnect, stop MongoMemoryServer                 │
│                                                                     │
│  ⚡ Each test gets a completely clean database                      │
│  ⚡ No external MongoDB needed for testing                          │
│  ⚡ Tests run in isolation — no shared state                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Test Environment Variables

```bash
NODE_ENV=test
PORT=5001
BASE_URL=http://localhost:5001/api/v1
JWT_ACCESS_SECRET=test-access-secret-that-is-at-least-32-characters-long
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-characters-long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=4                 # Lower for faster tests
RATE_LIMIT_MAX_REQUESTS=1000    # High limit to avoid blocking tests
CLOUDFLARE_ACCOUNT_ID=test-account
CLOUDFLARE_R2_ACCESS_KEY_ID=test-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=test-secret
CLOUDFLARE_R2_BUCKET_NAME=test-bucket
CLOUDFLARE_R2_PUBLIC_URL=https://test-r2.example.com
```

### 2.3 Test Factories Required

| Factory                | Generates                           |
| ---------------------- | ----------------------------------- |
| `UserFactory`          | Admin users with roles              |
| `RoleFactory`          | Roles with configurable permissions |
| `UnitFactory`          | Property units with all fields      |
| `BuildingTypeFactory`  | Building type lookup data           |
| `UnitTypeFactory`      | Unit type lookup data               |
| `FeatureFactory`       | Feature/amenity lookup data         |
| `ClientFactory`        | CRM clients with preferences        |
| `DealFactory`          | Pipeline deals with stages          |
| `TaskFactory`          | Tasks with priorities & due dates   |
| `ActivityFactory`      | Activity log entries                |
| `CommunicationFactory` | Communication records               |

---

## 3. Module-by-Module Test Plan

### 3.1 🔐 Authentication Module Tests

#### Unit Tests: `auth.service.test.ts`

| #   | Test Case                      | Input                             | Expected                            | Status |
| --- | ------------------------------ | --------------------------------- | ----------------------------------- | ------ |
| 1   | Register new user successfully | Valid email, password, name, role | User created, tokens returned       | ⬜     |
| 2   | Register with duplicate email  | Existing email                    | ConflictError (409)                 | ⬜     |
| 3   | Register with weak password    | "123"                             | ValidationError (400)               | ⬜     |
| 4   | Login with valid credentials   | Correct email + password          | Tokens returned                     | ⬜     |
| 5   | Login with wrong password      | Correct email, wrong password     | UnauthorizedError (401)             | ⬜     |
| 6   | Login with non-existent email  | Unknown email                     | UnauthorizedError (401)             | ⬜     |
| 7   | Login with inactive account    | `isActive: false` user            | ForbiddenError (403)                | ⬜     |
| 8   | Login with locked account      | User locked after 5 failures      | ForbiddenError (403) + lock message | ⬜     |
| 9   | Password hashing               | Any password                      | Stored hash !== plaintext           | ⬜     |
| 10  | Failed login attempt tracking  | 5 wrong passwords                 | Account locked for 30 min           | ⬜     |
| 11  | Refresh token valid            | Valid refresh token               | New access + refresh tokens         | ⬜     |
| 12  | Refresh token expired          | Expired refresh token             | UnauthorizedError (401)             | ⬜     |
| 13  | Refresh token reuse (rotated)  | Old refresh token after rotation  | UnauthorizedError (401)             | ⬜     |
| 14  | Logout                         | Valid access token                | Refresh token invalidated           | ⬜     |
| 15  | Change password successfully   | Correct old + valid new password  | Password updated                    | ⬜     |
| 16  | Change password wrong current  | Wrong old password                | UnauthorizedError (401)             | ⬜     |
| 17  | Get current user profile       | Valid token                       | User profile returned (no password) | ⬜     |

#### Integration Tests: `auth.routes.test.ts`

| #   | Test Case                                     | Method | Endpoint                       | Status Code |
| --- | --------------------------------------------- | ------ | ------------------------------ | ----------- |
| 1   | POST register — valid data                    | POST   | `/api/v1/auth/register`        | 201         |
| 2   | POST register — missing fields                | POST   | `/api/v1/auth/register`        | 400         |
| 3   | POST register — duplicate email               | POST   | `/api/v1/auth/register`        | 409         |
| 4   | POST register — unauthorized (no super_admin) | POST   | `/api/v1/auth/register`        | 403         |
| 5   | POST login — valid                            | POST   | `/api/v1/auth/login`           | 200         |
| 6   | POST login — invalid                          | POST   | `/api/v1/auth/login`           | 401         |
| 7   | POST login — rate limit (6th attempt)         | POST   | `/api/v1/auth/login`           | 429         |
| 8   | POST refresh — valid                          | POST   | `/api/v1/auth/refresh`         | 200         |
| 9   | POST refresh — invalid token                  | POST   | `/api/v1/auth/refresh`         | 401         |
| 10  | POST logout                                   | POST   | `/api/v1/auth/logout`          | 200         |
| 11  | POST change-password                          | POST   | `/api/v1/auth/change-password` | 200         |
| 12  | GET me — authenticated                        | GET    | `/api/v1/auth/me`              | 200         |
| 13  | GET me — no token                             | GET    | `/api/v1/auth/me`              | 401         |
| 14  | GET me — expired token                        | GET    | `/api/v1/auth/me`              | 401         |
| 15  | Response format matches standard              | ALL    | ALL auth endpoints             | ⬜          |

---

### 3.2 🛡️ Roles & Permissions Module Tests

#### Unit Tests: `roles.service.test.ts`

| #   | Test Case                                 | Expected                  |
| --- | ----------------------------------------- | ------------------------- |
| 1   | Create role with valid permissions        | Role created successfully |
| 2   | Create role with duplicate nameEn         | ConflictError (409)       |
| 3   | Update role permissions                   | Permissions updated       |
| 4   | Delete role not in use                    | Role deleted              |
| 5   | Delete role in use by users               | BadRequestError (400)     |
| 6   | Delete system role (super_admin)          | ForbiddenError (403)      |
| 7   | Update system role                        | ForbiddenError (403)      |
| 8   | List roles with pagination                | Paginated result          |
| 9   | Get role by ID with populated permissions | Full permission object    |

#### Integration Tests: `roles.routes.test.ts`

| #   | Test Case                 | Method | Endpoint            | Status Code |
| --- | ------------------------- | ------ | ------------------- | ----------- |
| 1   | GET all roles             | GET    | `/api/v1/roles`     | 200         |
| 2   | GET role by ID            | GET    | `/api/v1/roles/:id` | 200         |
| 3   | POST create role          | POST   | `/api/v1/roles`     | 201         |
| 4   | PATCH update role         | PATCH  | `/api/v1/roles/:id` | 200         |
| 5   | DELETE role (no refs)     | DELETE | `/api/v1/roles/:id` | 204         |
| 6   | DELETE role (has users)   | DELETE | `/api/v1/roles/:id` | 400         |
| 7   | DELETE system role        | DELETE | `/api/v1/roles/:id` | 403         |
| 8   | Access without permission | ALL    | `/api/v1/roles`     | 403         |

#### Permission Middleware Tests: `permission.middleware.test.ts`

| #   | Test Case                                           | Expected                 |
| --- | --------------------------------------------------- | ------------------------ |
| 1   | User with `units.read` → GET /units                 | 200 OK                   |
| 2   | User without `units.read` → GET /units              | 403 Forbidden            |
| 3   | User with `units.create` → POST /units              | 201 Created              |
| 4   | User without `units.create` → POST /units           | 403 Forbidden            |
| 5   | Super admin → any endpoint                          | 200/201 (always allowed) |
| 6   | Inactive role user → any endpoint                   | 403 Forbidden            |
| 7   | Permissions checked for ALL modules (parameterized) | Module-specific check    |

---

### 3.3 👥 Users Module Tests

#### Unit Tests: `users.service.test.ts`

| #   | Test Case                          | Expected                       |
| --- | ---------------------------------- | ------------------------------ |
| 1   | Create user with valid data        | User created, password hashed  |
| 2   | Create user with duplicate email   | ConflictError                  |
| 3   | Get user by ID                     | User returned without password |
| 4   | List users with pagination         | Paginated result               |
| 5   | Update user                        | Updated fields returned        |
| 6   | Soft delete user                   | isDeleted: true, deletedAt set |
| 7   | Activate user                      | isActive: true                 |
| 8   | Deactivate user                    | isActive: false                |
| 9   | Cannot deactivate last super_admin | ForbiddenError                 |

#### Integration Tests: `users.routes.test.ts`

| #   | Test Case                       | Method | Endpoint                               | Status Code |
| --- | ------------------------------- | ------ | -------------------------------------- | ----------- |
| 1   | GET all users (paginated)       | GET    | `/api/v1/users`                        | 200         |
| 2   | GET users with filters          | GET    | `/api/v1/users?isActive=true&role=...` | 200         |
| 3   | GET users with sort             | GET    | `/api/v1/users?sort=-createdAt`        | 200         |
| 4   | GET users with search           | GET    | `/api/v1/users?search=admin`           | 200         |
| 5   | GET user by ID                  | GET    | `/api/v1/users/:id`                    | 200         |
| 6   | GET non-existent user           | GET    | `/api/v1/users/:fakeId`                | 404         |
| 7   | POST create user                | POST   | `/api/v1/users`                        | 201         |
| 8   | POST create user (invalid data) | POST   | `/api/v1/users`                        | 400         |
| 9   | PATCH update user               | PATCH  | `/api/v1/users/:id`                    | 200         |
| 10  | DELETE user (soft)              | DELETE | `/api/v1/users/:id`                    | 204         |
| 11  | POST activate user              | POST   | `/api/v1/users/:id/activate`           | 200         |
| 12  | POST deactivate user            | POST   | `/api/v1/users/:id/deactivate`         | 200         |
| 13  | Invalid MongoDB ID format       | GET    | `/api/v1/users/invalid-id`             | 400         |

---

### 3.4 🏢 Units Module Tests

#### Unit Tests: `units.service.test.ts`

| #   | Test Case                                 | Expected                           |
| --- | ----------------------------------------- | ---------------------------------- |
| 1   | Create unit with valid data               | Unit created, relations populated  |
| 2   | Create unit with invalid buildingType ref | BadRequest (invalid reference)     |
| 3   | Create unit with invalid unitType ref     | BadRequest (invalid reference)     |
| 4   | Get unit by ID                            | Unit returned with populated refs  |
| 5   | Get unit by ID increments viewCount       | viewCount + 1                      |
| 6   | List units with all query options         | Correct pagination, filters, sort  |
| 7   | Search units by text                      | Matching results returned          |
| 8   | Filter units by status                    | Only matching status               |
| 9   | Filter units by price range               | Within min/max                     |
| 10  | Filter units by area range                | Within min/max                     |
| 11  | Filter units by facade                    | Matching facade                    |
| 12  | Filter units by buildingType              | Matching type                      |
| 13  | Filter units by bedrooms                  | Matching count                     |
| 14  | Sort units by price ascending             | Correct order                      |
| 15  | Sort units by price descending            | Correct order                      |
| 16  | Sort units by createdAt                   | Correct order                      |
| 17  | Multi-field sort                          | Correct combined order             |
| 18  | Change status: available → reserved       | Status updated                     |
| 19  | Change status: available → sold           | Status updated                     |
| 20  | Change status: sold → available           | BusinessError (invalid transition) |
| 21  | Publish unit                              | isPublished: true, publishedAt set |
| 22  | Unpublish unit                            | isPublished: false                 |
| 23  | Update unit                               | Fields updated, updatedBy set      |
| 24  | Soft delete unit                          | isDeleted: true                    |
| 25  | Get unit statistics                       | Counts by status, type, etc.       |
| 26  | Get most viewed units                     | Ordered by viewCount desc          |

#### Integration Tests: `units.routes.test.ts`

| #   | Test Case                             | Method | Endpoint                                                      | Status Code          |
| --- | ------------------------------------- | ------ | ------------------------------------------------------------- | -------------------- |
| 1   | GET all units (paginated)             | GET    | `/api/v1/units`                                               | 200                  |
| 2   | GET units with complex filters        | GET    | `/api/v1/units?status=available&price[gte]=300000&bedrooms=4` | 200                  |
| 3   | GET units with text search            | GET    | `/api/v1/units?search=villa`                                  | 200                  |
| 4   | GET units sorted                      | GET    | `/api/v1/units?sort=-price.amount,unitNumber`                 | 200                  |
| 5   | GET unit by ID                        | GET    | `/api/v1/units/:id`                                           | 200                  |
| 6   | GET non-existent unit                 | GET    | `/api/v1/units/:fakeId`                                       | 404                  |
| 7   | POST create unit                      | POST   | `/api/v1/units`                                               | 201                  |
| 8   | POST create unit (invalid)            | POST   | `/api/v1/units`                                               | 400                  |
| 9   | PATCH update unit                     | PATCH  | `/api/v1/units/:id`                                           | 200                  |
| 10  | PATCH change status                   | PATCH  | `/api/v1/units/:id/status`                                    | 200                  |
| 11  | PATCH publish unit                    | PATCH  | `/api/v1/units/:id/publish`                                   | 200                  |
| 12  | DELETE unit (soft)                    | DELETE | `/api/v1/units/:id`                                           | 204                  |
| 13  | POST upload images (mock R2)          | POST   | `/api/v1/units/:id/images`                                    | 200                  |
| 14  | DELETE image                          | DELETE | `/api/v1/units/:id/images/:imageId`                           | 204                  |
| 15  | PATCH reorder images                  | PATCH  | `/api/v1/units/:id/images/reorder`                            | 200                  |
| 16  | POST upload document (mock R2)        | POST   | `/api/v1/units/:id/documents`                                 | 200                  |
| 17  | GET unit statistics                   | GET    | `/api/v1/units/statistics`                                    | 200                  |
| 18  | GET most viewed                       | GET    | `/api/v1/units/most-viewed`                                   | 200                  |
| 19  | Pagination meta correct               | GET    | `/api/v1/units?page=2&limit=5`                                | 200 + correct meta   |
| 20  | Last page hasMore=false               | GET    | `/api/v1/units?page=last`                                     | 200 + hasMore: false |
| 21  | Permission: read without permission   | GET    | `/api/v1/units`                                               | 403                  |
| 22  | Permission: create without permission | POST   | `/api/v1/units`                                               | 403                  |

---

### 3.5 📁 Dynamic Attributes Tests (Building Types, Unit Types, Features)

For **each** of the three dynamic attributes (building_types, unit_types, features):

#### Unit Tests

| #   | Test Case                    | Expected                            |
| --- | ---------------------------- | ----------------------------------- |
| 1   | Create with valid data       | Created successfully                |
| 2   | Create with duplicate nameEn | ConflictError                       |
| 3   | List with pagination         | Paginated, ordered by `order` field |
| 4   | Update                       | Fields updated                      |
| 5   | Delete (no references)       | Deleted                             |
| 6   | Delete (referenced by units) | BadRequestError — cannot delete     |
| 7   | Filter by isActive           | Only active/inactive returned       |

#### Integration Tests

| #   | Test Case         | Method | Endpoint (e.g., building-types) | Status Code |
| --- | ----------------- | ------ | ------------------------------- | ----------- |
| 1   | GET all           | GET    | `/api/v1/building-types`        | 200         |
| 2   | GET by ID         | GET    | `/api/v1/building-types/:id`    | 200         |
| 3   | POST create       | POST   | `/api/v1/building-types`        | 201         |
| 4   | PATCH update      | PATCH  | `/api/v1/building-types/:id`    | 200         |
| 5   | DELETE (no refs)  | DELETE | `/api/v1/building-types/:id`    | 204         |
| 6   | DELETE (has refs) | DELETE | `/api/v1/building-types/:id`    | 400         |
| 7   | Permission denied | POST   | `/api/v1/building-types`        | 403         |

**Repeat for:** `/api/v1/unit-types`, `/api/v1/features`

---

### 3.6 🧑‍💼 Clients (CRM Leads) Module Tests

#### Unit Tests: `clients.service.test.ts`

| #   | Test Case                          | Expected                      |
| --- | ---------------------------------- | ----------------------------- |
| 1   | Create client with valid data      | Client created, status: new   |
| 2   | Create client with duplicate phone | ConflictError                 |
| 3   | List clients with all filters      | Correct filtering             |
| 4   | Search clients by name/email/phone | Matching results              |
| 5   | Filter by status                   | Only matching                 |
| 6   | Filter by rating (hot/warm/cold)   | Only matching                 |
| 7   | Filter by source                   | Only matching                 |
| 8   | Filter by assigned agent           | Only matching                 |
| 9   | Filter by budget range             | Within range                  |
| 10  | Sort by various fields             | Correct order                 |
| 11  | Change status: new → contacted     | Updated                       |
| 12  | Change status: qualified → won     | Updated                       |
| 13  | Change status: qualified → lost    | Updated + lostReason required |
| 14  | Assign client to agent             | assignedTo updated            |
| 15  | Get matching units for client      | Units matching preferences    |
| 16  | Get client timeline                | Aggregated activities         |
| 17  | Get client statistics (funnel)     | Correct counts per stage      |
| 18  | Filter overdue follow-ups          | nextFollowUpDate < now        |
| 19  | Update client preferences          | Preferences saved             |
| 20  | Soft delete client                 | isDeleted: true               |

#### Integration Tests: `clients.routes.test.ts`

| #   | Test Case                   | Method | Endpoint                                                         | Status Code |
| --- | --------------------------- | ------ | ---------------------------------------------------------------- | ----------- |
| 1   | GET all clients (paginated) | GET    | `/api/v1/clients`                                                | 200         |
| 2   | GET with complex filters    | GET    | `/api/v1/clients?status=qualified&rating=hot&budget[gte]=300000` | 200         |
| 3   | GET with text search        | GET    | `/api/v1/clients?search=ahmed`                                   | 200         |
| 4   | GET client by ID            | GET    | `/api/v1/clients/:id`                                            | 200         |
| 5   | POST create client          | POST   | `/api/v1/clients`                                                | 201         |
| 6   | PATCH update client         | PATCH  | `/api/v1/clients/:id`                                            | 200         |
| 7   | PATCH change status         | PATCH  | `/api/v1/clients/:id/status`                                     | 200         |
| 8   | PATCH assign agent          | PATCH  | `/api/v1/clients/:id/assign`                                     | 200         |
| 9   | GET client timeline         | GET    | `/api/v1/clients/:id/timeline`                                   | 200         |
| 10  | GET matching units          | GET    | `/api/v1/clients/:id/matching-units`                             | 200         |
| 11  | GET client statistics       | GET    | `/api/v1/clients/statistics`                                     | 200         |
| 12  | DELETE client (soft)        | DELETE | `/api/v1/clients/:id`                                            | 204         |

---

### 3.7 🔄 Deals (Pipeline) Module Tests

#### Unit Tests: `deals.service.test.ts`

| #   | Test Case                                  | Expected                                                  |
| --- | ------------------------------------------ | --------------------------------------------------------- |
| 1   | Create deal with valid data                | Deal created, auto-probability set                        |
| 2   | Create deal for already-sold unit          | BadRequestError                                           |
| 3   | Create duplicate active deal for same unit | BadRequestError                                           |
| 4   | Move stage: inquiry → viewing              | Updated, probability: 25%                                 |
| 5   | Move stage: viewing → negotiation          | Updated, probability: 50%                                 |
| 6   | Move stage: negotiation → proposal         | Updated, probability: 70%                                 |
| 7   | Move stage: proposal → contract            | Updated, probability: 90%, unit → reserved                |
| 8   | Move stage: contract → closed_won          | Updated, probability: 100%, unit → sold, client → won     |
| 9   | Move stage: any → closed_lost              | Updated, probability: 0%, unit → available, client → lost |
| 10  | Record payment                             | Payment added to deal                                     |
| 11  | Get pipeline summary grouped by stage      | Correct grouping & totals                                 |
| 12  | Get deal statistics                        | Correct metrics                                           |
| 13  | Filter by stage                            | Only matching stage                                       |
| 14  | Filter by assigned agent                   | Only matching agent                                       |
| 15  | Sort by value                              | Correct order                                             |
| 16  | Revenue forecasting                        | Based on probability × value                              |

#### Integration Tests: `deals.routes.test.ts`

| #   | Test Case                                          | Method      | Endpoint                     | Status Code       |
| --- | -------------------------------------------------- | ----------- | ---------------------------- | ----------------- |
| 1   | GET all deals                                      | GET         | `/api/v1/deals`              | 200               |
| 2   | GET deal by ID                                     | GET         | `/api/v1/deals/:id`          | 200               |
| 3   | POST create deal                                   | POST        | `/api/v1/deals`              | 201               |
| 4   | PATCH update deal                                  | PATCH       | `/api/v1/deals/:id`          | 200               |
| 5   | PATCH change stage                                 | PATCH       | `/api/v1/deals/:id/stage`    | 200               |
| 6   | POST record payment                                | POST        | `/api/v1/deals/:id/payments` | 201               |
| 7   | GET pipeline summary                               | GET         | `/api/v1/deals/pipeline`     | 200               |
| 8   | GET deal statistics                                | GET         | `/api/v1/deals/statistics`   | 200               |
| 9   | DELETE deal (soft)                                 | DELETE      | `/api/v1/deals/:id`          | 204               |
| 10  | **Business Rule:** closed_won sets unit=sold       | PATCH stage | `/api/v1/deals/:id/stage`    | 200 + verify unit |
| 11  | **Business Rule:** closed_lost sets unit=available | PATCH stage | `/api/v1/deals/:id/stage`    | 200 + verify unit |
| 12  | **Business Rule:** contract sets unit=reserved     | PATCH stage | `/api/v1/deals/:id/stage`    | 200 + verify unit |

---

### 3.8 📋 Tasks Module Tests

#### Unit Tests: `tasks.service.test.ts`

| #   | Test Case               | Expected                           |
| --- | ----------------------- | ---------------------------------- |
| 1   | Create task             | Task created, status: pending      |
| 2   | List tasks with filters | Correct filtering                  |
| 3   | Filter by assignee      | Only assigned user's tasks         |
| 4   | Filter by priority      | Only matching priority             |
| 5   | Filter by status        | Only matching status               |
| 6   | Get overdue tasks       | dueDate < now & not completed      |
| 7   | Get my tasks            | Only current user's tasks          |
| 8   | Complete task           | status: completed, completedAt set |
| 9   | Update task             | Fields updated                     |
| 10  | Delete task             | Deleted                            |

#### Integration Tests: `tasks.routes.test.ts`

| #   | Test Case           | Method | Endpoint                     | Status Code |
| --- | ------------------- | ------ | ---------------------------- | ----------- |
| 1   | GET all tasks       | GET    | `/api/v1/tasks`              | 200         |
| 2   | GET task by ID      | GET    | `/api/v1/tasks/:id`          | 200         |
| 3   | POST create task    | POST   | `/api/v1/tasks`              | 201         |
| 4   | PATCH update task   | PATCH  | `/api/v1/tasks/:id`          | 200         |
| 5   | PATCH complete task | PATCH  | `/api/v1/tasks/:id/complete` | 200         |
| 6   | DELETE task         | DELETE | `/api/v1/tasks/:id`          | 204         |
| 7   | GET my tasks        | GET    | `/api/v1/tasks/my-tasks`     | 200         |
| 8   | GET overdue tasks   | GET    | `/api/v1/tasks/overdue`      | 200         |

---

### 3.9 📝 Activities Module Tests

| #   | Test Case                        | Method / Trigger                    | Expected                                    |
| --- | -------------------------------- | ----------------------------------- | ------------------------------------------- |
| 1   | Auto-log on client status change | PATCH client status                 | Activity created with type: status_change   |
| 2   | Auto-log on deal stage change    | PATCH deal stage                    | Activity created with type: deal_update     |
| 3   | Auto-log on task completion      | PATCH task complete                 | Activity created                            |
| 4   | Auto-log on document upload      | POST document                       | Activity created with type: document_upload |
| 5   | Auto-log on unit status change   | PATCH unit status                   | Activity created with type: status_change   |
| 6   | Manual activity creation         | POST `/api/v1/activities`           | Activity created                            |
| 7   | List activities for client       | GET `/api/v1/activities/client/:id` | Filtered results                            |
| 8   | List activities for deal         | GET `/api/v1/activities/deal/:id`   | Filtered results                            |

---

### 3.10 📞 Communications Module Tests

| #   | Test Case                     | Method | Endpoint                            | Status Code   |
| --- | ----------------------------- | ------ | ----------------------------------- | ------------- |
| 1   | POST log communication        | POST   | `/api/v1/communications`            | 201           |
| 2   | GET all communications        | GET    | `/api/v1/communications`            | 200           |
| 3   | GET communications for client | GET    | `/api/v1/communications/client/:id` | 200           |
| 4   | GET communication statistics  | GET    | `/api/v1/communications/statistics` | 200           |
| 5   | Validate required fields      | POST   | `/api/v1/communications`            | 400 (missing) |

---

### 3.11 📄 Documents Module Tests

| #   | Test Case                               | Method | Endpoint                              | Status Code |
| --- | --------------------------------------- | ------ | ------------------------------------- | ----------- |
| 1   | POST upload document (mock R2)          | POST   | `/api/v1/documents`                   | 201         |
| 2   | GET all documents                       | GET    | `/api/v1/documents`                   | 200         |
| 3   | GET document by ID                      | GET    | `/api/v1/documents/:id`               | 200         |
| 4   | PATCH update metadata                   | PATCH  | `/api/v1/documents/:id`               | 200         |
| 5   | DELETE document (verify R2 delete mock) | DELETE | `/api/v1/documents/:id`               | 204         |
| 6   | Filter by type                          | GET    | `/api/v1/documents?type=contract`     | 200         |
| 7   | Filter by related entity                | GET    | `/api/v1/documents?relatedClient=...` | 200         |

---

### 3.12 👁️ Interest Tracking Module Tests

| #   | Test Case                                    | Trigger                                                      | Expected                           |
| --- | -------------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| 1   | View event logged on GET /units/:id          | GET `/api/v1/units/:id`                                      | interest_log created, type: view   |
| 2   | Search event logged on GET /units?search=... | GET `/api/v1/units?search=villa`                             | interest_log created, type: search |
| 3   | Search filters captured                      | GET `/api/v1/units?status=available&bedrooms=4`              | searchFilters saved                |
| 4   | GET most-viewed units                        | GET `/api/v1/interest/most-viewed`                           | Units sorted by view count         |
| 5   | GET most-searched terms                      | GET `/api/v1/interest/most-searched`                         | Top search queries                 |
| 6   | GET trending units                           | GET `/api/v1/interest/trending`                              | Rising interest units              |
| 7   | GET interest for specific unit               | GET `/api/v1/interest/unit/:id`                              | History for unit                   |
| 8   | GET search heatmap                           | GET `/api/v1/interest/heatmap`                               | Popular filter criteria            |
| 9   | Date range filters work                      | GET `/api/v1/interest/most-viewed?startDate=...&endDate=...` | Filtered by date                   |

---

### 3.13 📊 Analytics Module Tests

| #   | Test Case                                | Method | Endpoint                                                | Expected                   |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------- | -------------------------- |
| 1   | GET dashboard KPIs                       | GET    | `/api/v1/analytics/dashboard`                           | All KPI fields present     |
| 2   | GET sales analytics                      | GET    | `/api/v1/analytics/sales`                               | Revenue, deals data        |
| 3   | GET pipeline health                      | GET    | `/api/v1/analytics/pipeline`                            | Stage counts, velocity     |
| 4   | GET agent performance                    | GET    | `/api/v1/analytics/agents`                              | Per-agent metrics          |
| 5   | GET client analytics                     | GET    | `/api/v1/analytics/clients`                             | Funnel, conversion         |
| 6   | GET unit analytics                       | GET    | `/api/v1/analytics/units`                               | Status breakdown           |
| 7   | GET revenue forecast                     | GET    | `/api/v1/analytics/revenue-forecast`                    | Forecast based on pipeline |
| 8   | Date range filter                        | GET    | `/api/v1/analytics/dashboard?startDate=...&endDate=...` | Filtered data              |
| 9   | Period grouping                          | GET    | `/api/v1/analytics/trends?period=monthly`               | Grouped data               |
| 10  | Permission: analytics without permission | GET    | `/api/v1/analytics/dashboard`                           | 403                        |
| 11  | Dashboard KPI values correctness         | GET    | `/api/v1/analytics/dashboard`                           | Verified against test data |

---

### 3.14 📝 Audit Log Module Tests

| #   | Test Case                                     | Method / Trigger                            | Expected                            |
| --- | --------------------------------------------- | ------------------------------------------- | ----------------------------------- |
| 1   | Audit log created on unit create              | POST `/api/v1/units`                        | audit_log with action: create       |
| 2   | Audit log created on unit update              | PATCH `/api/v1/units/:id`                   | audit_log with before/after         |
| 3   | Audit log created on unit delete              | DELETE `/api/v1/units/:id`                  | audit_log with action: delete       |
| 4   | Audit log created on client status change     | PATCH client status                         | audit_log recorded                  |
| 5   | Audit log created on deal stage change        | PATCH deal stage                            | audit_log recorded                  |
| 6   | Audit log created on role change              | PATCH role                                  | audit_log with permission diff      |
| 7   | Audit log captures userId and IP              | Any write op                                | userId + ipAddress present          |
| 8   | GET audit logs (paginated)                    | GET `/api/v1/audit-logs`                    | Paginated, sorted by createdAt desc |
| 9   | GET audit logs for resource                   | GET `/api/v1/audit-logs/resource/units/:id` | Filtered by resource                |
| 10  | GET audit logs for user                       | GET `/api/v1/audit-logs/user/:id`           | Filtered by user                    |
| 11  | Audit logs are immutable (no update/delete)   | PUT/PATCH/DELETE `/api/v1/audit-logs/:id`   | 405 or no endpoint                  |
| 12  | Permission: only `audit_logs.read` can access | GET `/api/v1/audit-logs`                    | 403 without permission              |

---

### 3.15 🏥 Health Check Tests

| #   | Test Case                     | Method | Endpoint                  | Expected                |
| --- | ----------------------------- | ------ | ------------------------- | ----------------------- |
| 1   | Basic health check            | GET    | `/api/v1/health`          | 200 + status: healthy   |
| 2   | Detailed health               | GET    | `/api/v1/health/detailed` | 200 + DB, Redis status  |
| 3   | Health when DB down           | GET    | `/api/v1/health`          | 503 + status: unhealthy |
| 4   | Detailed health requires auth | GET    | `/api/v1/health/detailed` | 401 without token       |

---

## 4. Cross-Cutting Test Categories

### 4.1 Pagination Tests (Apply to ALL list endpoints)

| #   | Test Case                                  | Expected                        |
| --- | ------------------------------------------ | ------------------------------- |
| 1   | Default pagination (no params)             | page: 1, limit: 20              |
| 2   | Custom page and limit                      | Correct page/limit              |
| 3   | Page beyond data                           | Empty data array, correct total |
| 4   | Last page: hasMore is false                | hasMore: false                  |
| 5   | limit > 100 capped at 100                  | limit: 100 in response          |
| 6   | Negative page defaults to 1                | page: 1                         |
| 7   | Pagination meta includes total, totalPages | All fields present              |

### 4.2 Search Tests (Apply to ALL searchable endpoints)

| #   | Test Case                    | Expected             |
| --- | ---------------------------- | -------------------- |
| 1   | Search by exact match        | Found                |
| 2   | Search by partial match      | Found                |
| 3   | Search case-insensitive      | Found                |
| 4   | Search with no results       | Empty array          |
| 5   | Search combined with filters | Intersection results |

### 4.3 Filter Tests

| #   | Test Case                    | Expected      |
| --- | ---------------------------- | ------------- |
| 1   | Single field filter          | Only matching |
| 2   | Multiple field filters       | Intersection  |
| 3   | Range filter (gte/lte)       | Within range  |
| 4   | Array filter (in)            | In array      |
| 5   | Invalid filter field ignored | No error      |

### 4.4 Sort Tests

| #   | Test Case                  | Expected               |
| --- | -------------------------- | ---------------------- |
| 1   | Sort ascending             | A-Z or 0-9             |
| 2   | Sort descending (- prefix) | Z-A or 9-0             |
| 3   | Multi-field sort           | Primary then secondary |
| 4   | Default sort (-createdAt)  | Newest first           |

### 4.5 Validation Tests (Apply to ALL create/update endpoints)

| #   | Test Case                     | Expected                       |
| --- | ----------------------------- | ------------------------------ |
| 1   | Missing required fields       | 400 with field-specific errors |
| 2   | Invalid field types           | 400 with type errors           |
| 3   | String too short/long         | 400 with length errors         |
| 4   | Invalid email format          | 400                            |
| 5   | Invalid MongoDB ObjectId      | 400                            |
| 6   | Invalid enum value            | 400                            |
| 7   | Extra unknown fields stripped | Ignored silently               |

### 4.6 Error Response Format Tests

| #   | Test Case                                                    | Expected              |
| --- | ------------------------------------------------------------ | --------------------- |
| 1   | Success response has: success, data, meta                    | ✅                    |
| 2   | Error response has: success=false, error.code, error.message | ✅                    |
| 3   | Paginated response has: pagination meta                      | ✅                    |
| 4   | Error includes requestId                                     | ✅                    |
| 5   | Error includes timestamp                                     | ✅                    |
| 6   | 404 for non-existent route                                   | Standard error format |
| 7   | 500 hides details in production                              | Generic message       |

---

## 5. E2E Workflow Tests

### 5.1 Lead-to-Sale Complete Workflow

```
Test: "Complete real estate sale from lead to closing"

1. Create a building type → 201
2. Create a unit type → 201
3. Create a feature → 201
4. Create a unit (available, 450K SAR) → 201
5. Create a client (source: website, rating: hot) → 201
6. Create a deal (inquiry stage) → 201
   ✓ Verify: deal probability = 10%
7. Move deal to viewing → 200
   ✓ Verify: probability = 25%
   ✓ Verify: activity auto-logged
8. Move deal to negotiation → 200
   ✓ Verify: probability = 50%
9. Move deal to proposal → 200
   ✓ Verify: probability = 70%
10. Move deal to contract → 200
    ✓ Verify: probability = 90%
    ✓ Verify: unit status = reserved
    ✓ Verify: activity auto-logged
11. Record payment (200K) → 201
12. Record payment (250K) → 201
13. Move deal to closed_won → 200
    ✓ Verify: probability = 100%
    ✓ Verify: unit status = sold
    ✓ Verify: client status = won
    ✓ Verify: activity auto-logged
    ✓ Verify: audit log for all changes
14. Check analytics dashboard → 200
    ✓ Verify: revenue includes this sale
    ✓ Verify: unit counts updated
    ✓ Verify: client funnel updated
```

### 5.2 Interest Tracking Workflow

```
Test: "Track unit interest and verify analytics"

1. Create 5 units → 201 each
2. View unit A 10 times → GET /units/A (10 requests)
3. View unit B 5 times → GET /units/B (5 requests)
4. Search "villa" 3 times → GET /units?search=villa (3 requests)
5. Search "apartment" 1 time → GET /units?search=apartment
6. GET most-viewed → 200
   ✓ Verify: unit A is #1, unit B is #2
7. GET most-searched → 200
   ✓ Verify: "villa" has count 3, "apartment" has count 1
8. GET interest for unit A → 200
   ✓ Verify: 10 view events
```

### 5.3 Permission Enforcement Workflow

```
Test: "Verify dynamic RBAC across entire system"

1. Create role "sales_agent" with permissions:
   - clients: { create: true, read: true, update: true, delete: false }
   - deals: { create: true, read: true, update: true, delete: false }
   - units: { read: true }
   - analytics: { read: false }
2. Create user with "sales_agent" role → 201
3. Login as sales_agent → 200 + token
4. GET /units → 200 ✓
5. POST /units → 403 ✗ (no create permission)
6. POST /clients → 201 ✓
7. DELETE /clients/:id → 403 ✗ (no delete permission)
8. GET /analytics/dashboard → 403 ✗ (no analytics permission)
9. PATCH /roles/:id → 403 ✗ (no roles permission)
```

---

## 6. Performance Tests

| #   | Test Case                                      | Target           |
| --- | ---------------------------------------------- | ---------------- |
| 1   | GET /units (100 records) response time         | < 500ms          |
| 2   | GET /clients (500 records) with complex filter | < 800ms          |
| 3   | GET /analytics/dashboard                       | < 1000ms         |
| 4   | 10 concurrent login requests                   | All succeed      |
| 5   | 50 concurrent GET /units requests              | All respond < 1s |
| 6   | File upload (5MB image, mocked R2)             | < 2s             |

---

## 7. Security Tests

| #   | Test Case                           | Expected                 |
| --- | ----------------------------------- | ------------------------ |
| 1   | NoSQL injection in search param     | Sanitized, no injection  |
| 2   | XSS in input fields                 | Sanitized/escaped        |
| 3   | JWT token tampering                 | 401                      |
| 4   | Expired JWT token                   | 401                      |
| 5   | Missing Authorization header        | 401                      |
| 6   | Rate limit on auth endpoints        | 429 after 5 attempts     |
| 7   | Rate limit on general endpoints     | 429 after 100 req/15min  |
| 8   | Password never returned in response | ✅ password field absent |
| 9   | HTTP Parameter Pollution            | Handled by hpp           |
| 10  | Large request body (> 10KB)         | 413 Payload Too Large    |

---

## 8. Test Coverage Requirements

| Module                      | Minimum Coverage        |
| --------------------------- | ----------------------- |
| Auth                        | 90% branches, 90% lines |
| Roles & Permissions         | 90% branches, 90% lines |
| Users                       | 85% branches, 85% lines |
| Units                       | 85% branches, 85% lines |
| Clients                     | 85% branches, 85% lines |
| Deals                       | 90% branches, 90% lines |
| Tasks                       | 80% branches, 80% lines |
| Activities                  | 80% branches, 80% lines |
| Communications              | 80% branches, 80% lines |
| Documents                   | 80% branches, 80% lines |
| Interest Tracking           | 85% branches, 85% lines |
| Analytics                   | 80% branches, 80% lines |
| Audit Logs                  | 85% branches, 85% lines |
| Shared (middlewares, utils) | 90% branches, 90% lines |
| **Global**                  | **≥ 80% all metrics**   |

---

## 9. Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --runInBand",
    "test:unit": "jest --testPathPattern='\\.service\\.test\\.ts$|\\.controller\\.test\\.ts$'",
    "test:integration": "jest --testPathPattern='routes\\.test\\.ts$'",
    "test:e2e": "jest --testPathPattern='e2e\\.test\\.ts$'",
    "test:auth": "jest --testPathPattern='auth.*\\.test\\.ts$'",
    "test:roles": "jest --testPathPattern='role.*\\.test\\.ts$'",
    "test:users": "jest --testPathPattern='user.*\\.test\\.ts$'",
    "test:units": "jest --testPathPattern='unit.*\\.test\\.ts$'",
    "test:clients": "jest --testPathPattern='client.*\\.test\\.ts$'",
    "test:deals": "jest --testPathPattern='deal.*\\.test\\.ts$'",
    "test:tasks": "jest --testPathPattern='task.*\\.test\\.ts$'",
    "test:analytics": "jest --testPathPattern='analytics.*\\.test\\.ts$'",
    "test:audit": "jest --testPathPattern='audit.*\\.test\\.ts$'",
    "test:interest": "jest --testPathPattern='interest.*\\.test\\.ts$'"
  }
}
```

---

## 10. Test Execution Order

```
┌────────────────────────────────────────────────────────────────┐
│                  RECOMMENDED TEST EXECUTION                     │
│                                                                 │
│  1. npm run test:auth        ← Auth first (others depend on it)│
│  2. npm run test:roles       ← Roles & permissions             │
│  3. npm run test:users       ← User management                 │
│  4. npm run test:units       ← Core property module            │
│  5. npm run test:clients     ← CRM leads                       │
│  6. npm run test:deals       ← CRM pipeline                    │
│  7. npm run test:tasks       ← CRM tasks                       │
│  8. npm run test:analytics   ← Analytics & reports             │
│  9. npm run test:audit       ← Audit trail                     │
│  10. npm run test:interest   ← Interest tracking               │
│  11. npm run test:e2e        ← Full workflow tests             │
│  12. npm run test:coverage   ← Final coverage report           │
│                                                                 │
│  OR: npm run test:ci         ← Run everything in CI mode       │
└────────────────────────────────────────────────────────────────┘
```

---

## 11. Total Test Count Summary

| Category                                             | Approximate Count    |
| ---------------------------------------------------- | -------------------- |
| Auth unit tests                                      | 17                   |
| Auth integration tests                               | 15                   |
| Roles unit tests                                     | 9                    |
| Roles integration tests                              | 8                    |
| Permission middleware tests                          | 7                    |
| Users unit tests                                     | 9                    |
| Users integration tests                              | 13                   |
| Units unit tests                                     | 26                   |
| Units integration tests                              | 22                   |
| Dynamic attributes (×3)                              | 21 each = 63         |
| Clients unit tests                                   | 20                   |
| Clients integration tests                            | 12                   |
| Deals unit tests                                     | 16                   |
| Deals integration tests                              | 12                   |
| Tasks unit tests                                     | 10                   |
| Tasks integration tests                              | 8                    |
| Activities tests                                     | 8                    |
| Communications tests                                 | 5                    |
| Documents tests                                      | 7                    |
| Interest tracking tests                              | 9                    |
| Analytics tests                                      | 11                   |
| Audit log tests                                      | 12                   |
| Health check tests                                   | 4                    |
| Cross-cutting (pagination, sort, filter, validation) | 30+                  |
| E2E workflows                                        | 3                    |
| Performance tests                                    | 6                    |
| Security tests                                       | 10                   |
| **TOTAL**                                            | **~350+ test cases** |

---

_Document Version: 1.0.0_
_Last Updated: March 9, 2026_
