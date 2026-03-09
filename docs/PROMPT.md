# 🤖 AI Development Prompt — Awali Real Estate Backend

## Complete Prompt for AI Agent to Build the Awali Real Estate Management & CRM Platform

> **Purpose:** This document is the master prompt to give to an AI coding agent (GitHub Copilot, Cursor, etc.) to build the entire backend system. It references the BRD for business requirements, the copilot-instructions.md for implementation standards, and the COPILOT-TESTING-GUIDE.md for testing standards.
>
> **IMPORTANT:** This prompt does NOT contain implementation code. All code patterns, architecture details, and coding standards are in the `.github/copilot-instructions.md` file. This prompt tells the AI **what** to build; the instructions file tells it **how** to build it.

---

## 📌 Pre-Development: ACTIONS REQUIRED FROM YOU

Before giving this prompt to the AI agent, **YOU** must complete these steps:

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com
2. Create a new project called "Awali Real Estate"
3. Create a free/shared cluster (or dedicated for production)
4. Create a database user with read/write permissions
5. Whitelist your IP address (or `0.0.0.0/0` for development)
6. Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/awali_realestate`

### Step 2: Set Up Cloudflare R2

1. Go to https://dash.cloudflare.com → R2 Object Storage
2. Create a bucket named `awali-media`
3. Go to R2 → Manage R2 API Tokens → Create API Token
4. Copy:
   - Account ID (from dashboard URL or overview page)
   - Access Key ID & Secret Access Key
5. (Optional) Set up a custom domain for the bucket: `media.awali.com`
6. The R2 public URL will be: `https://<account-id>.r2.cloudflarestorage.com/awali-media` or your custom domain

### Step 3: Set Up Redis (Optional but Recommended)

- **Option A:** Upstash (free tier) — https://upstash.com → Create Redis Database → Copy URL
- **Option B:** Redis Cloud — https://redis.com/try-free/
- **Option C:** Local Docker — `docker run -d -p 6379:6379 redis:7`

### Step 4: Generate JWT Secrets

Run this command to generate secure secrets:

```bash
node -e "console.log('ACCESS:', require('crypto').randomBytes(32).toString('hex')); console.log('REFRESH:', require('crypto').randomBytes(32).toString('hex'));"
```

### Step 5: Get Postman API Key (for API Documentation)

1. Go to https://www.postman.com → Settings → API Keys
2. Generate a new API key
3. Note your Workspace ID from the workspace URL

### Step 6: Create the `.env` File

Create a `.env` file in the project root with ALL your credentials:

```bash
# ═══════════════════════════════════════════════════════════════════
# AWALI REAL ESTATE BACKEND - Environment Configuration
# ═══════════════════════════════════════════════════════════════════

# SERVER
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
API_VERSION=v1
API_PREFIX=/api
BASE_URL=http://localhost:5000/api/v1

# MONGODB
MONGODB_URI=<paste-your-mongodb-connection-string-here>
MONGODB_DB_NAME=awali_realestate
MONGODB_POOL_SIZE=10

# JWT (paste values generated in Step 4)
JWT_ACCESS_SECRET=<paste-access-secret-here>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<paste-refresh-secret-here>
JWT_REFRESH_EXPIRES_IN=7d

# SECURITY
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CLOUDFLARE R2 (paste values from Step 2)
CLOUDFLARE_ACCOUNT_ID=<paste-your-account-id>
CLOUDFLARE_R2_ACCESS_KEY_ID=<paste-your-r2-access-key>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<paste-your-r2-secret-key>
CLOUDFLARE_R2_BUCKET_NAME=awali-media
CLOUDFLARE_R2_PUBLIC_URL=<paste-your-r2-public-url>

# REDIS (paste from Step 3, or leave empty to skip)
REDIS_URL=redis://localhost:6379

# LOGGING
LOG_LEVEL=debug

# SUPER ADMIN SEED (this will be the first admin account)
SUPER_ADMIN_EMAIL=admin@awali.com
SUPER_ADMIN_PASSWORD=Admin@Awali2026!
SUPER_ADMIN_NAME_EN=Super Admin
SUPER_ADMIN_NAME_AR=المدير العام
```

### Step 7: Verify `.env` is in `.gitignore`

Make sure `.env` is listed in `.gitignore` so credentials are never committed to git.

---

## 🚀 THE PROMPT

Copy everything below this line and give it to the AI agent:

---

### SYSTEM CONTEXT

You are a Chief Backend Engineer building an enterprise-grade real estate management and CRM platform for **Awali Real Estate**, a Saudi Arabian real estate company. You must follow all standards defined in the `.github/copilot-instructions.md` file for architecture, coding patterns, security, and API design. You must follow all standards defined in `.github/COPILOT-TESTING-GUIDE.md` for testing.

**Read these files FIRST before writing any code:**

1. `.github/copilot-instructions.md` — Complete development instructions
2. `.github/COPILOT-TESTING-GUIDE.md` — Complete testing instructions
3. `docs/BRD.md` — Full business requirements with all schemas and endpoints
4. This file (`docs/PROMPT.md`) — This development prompt

### BASE URL CONFIGURATION

**All API endpoints MUST use the `BASE_URL` from the `.env` file.**

- Development: `http://localhost:5000/api/v1`
- Production: Will be updated to the production domain (e.g., `https://api.awali.com/api/v1`)
- The `BASE_URL` environment variable is used in Postman documentation and any self-referencing URLs in responses
- Route definitions in code use relative paths (e.g., `/auth/login`) and the Express app mounts them under `/api/v1`

### PROJECT OVERVIEW

Build a complete Node.js + Express.js + TypeScript + MongoDB backend with:

- **14 database collections** (see BRD Section 8 for full list)
- **13 modules** with full CRUD, search, filter, sort, pagination
- **Dynamic RBAC** — roles are stored in database, permissions checked via middleware
- **Full CRM** — clients, deals pipeline, tasks, activities, communication logs
- **Interest tracking** — auto-log unit views and search patterns
- **Analytics dashboard** — KPIs, sales metrics, pipeline health, agent performance
- **Media management** — Cloudflare R2 for images, videos, PDFs
- **Bilingual** — Arabic & English content fields
- **Audit trail** — immutable log of all write operations

### MANDATORY DEVELOPMENT PHASES

Follow this exact order. DO NOT skip phases.

#### PHASE 0: Pre-Flight Checks (BLOCKING)

1. Verify the `.env` file exists and has all required variables
2. Test MongoDB connection using MCP tools
3. Test Postman MCP connection
4. List existing collections to avoid conflicts
5. **STOP if any connection fails**

#### PHASE 1: Database Setup

1. Create all 14 MongoDB collections with validation rules (see BRD Section 8)
2. Create all indexes for each collection (see BRD Section 8 for index list)
3. Create text indexes for search fields
4. Run the seed script to create:
   - Super Admin role (with ALL permissions, `isSystem: true`)
   - Super Admin user (from `.env` credentials)
   - Default building types, unit types, and features

#### PHASE 2: Core Infrastructure

1. Initialize Node.js project with TypeScript strict mode
2. Install all dependencies (see technology stack in BRD Section 3.2)
3. Set up project folder structure following `.github/copilot-instructions.md`
4. Configure environment validation with Zod (all `.env` vars)
5. Set up MongoDB connection with Mongoose
6. Set up Redis connection (optional, graceful fallback if not available)
7. Configure Express with all security middleware (helmet, cors, rate limiting, mongo-sanitize, hpp)
8. Set up Cloudflare R2 client (using `@aws-sdk/client-s3` with R2 endpoint)
9. Implement base classes: `ApiResponse`, `BaseException` classes, `QueryBuilder`
10. Implement global error handler middleware
11. Set up Winston logger + Morgan HTTP logging

#### PHASE 3: Authentication & Authorization

1. Implement Auth module (register, login, refresh, logout, change-password, me)
2. Implement JWT middleware (access token verification)
3. Implement Permission middleware (check `role.permissions[module][action]`)
4. Implement auth rate limiting (5 attempts/15min on login/register)
5. Implement failed login tracking & account locking

#### PHASE 4: User & Role Management

1. Implement Roles module with full dynamic permissions CRUD
2. Implement Users module with role assignment
3. Protect super_admin role from modification/deletion
4. Ensure role deletion is blocked if users reference it

#### PHASE 5: Dynamic Attributes

1. Implement Building Types module (CRUD + prevent deletion if referenced by units)
2. Implement Unit Types module (CRUD + prevent deletion if referenced by units)
3. Implement Features module (CRUD + prevent deletion if referenced by units)

#### PHASE 6: Units (Buildings) Management

1. Implement Units module with full CRUD
2. Implement status lifecycle transitions with business rules
3. Implement image upload/reorder/delete (Cloudflare R2)
4. Implement document upload/delete (Cloudflare R2)
5. Implement publish/unpublish functionality
6. Implement advanced search, filter, sort, pagination (see BRD Section 5.4 query params)
7. Integrate interest tracking on view and search operations

#### PHASE 7: CRM — Clients & Leads

1. Implement Clients module with full lifecycle management
2. Implement lead source tracking
3. Implement client assignment to sales agents
4. Implement client-unit matching (based on preferences)
5. Implement client timeline (aggregated activities)
6. Implement client statistics (funnel, conversion rates)

#### PHASE 8: CRM — Pipeline & Deals

1. Implement Deals module with pipeline stages
2. Implement auto-probability calculation based on stage
3. Implement deal-stage transitions with business rules:
   - `contract` stage → unit status becomes `reserved`
   - `closed_won` → unit status becomes `sold`, client status → `won`
   - `closed_lost` → unit status reverts to `available`, client status → `lost`
4. Implement payment recording
5. Implement pipeline summary view (grouped by stage)
6. Implement deal statistics & revenue forecasting

#### PHASE 9: CRM — Tasks & Activities

1. Implement Tasks module with assignment, priorities, due dates
2. Implement task status transitions (auto-mark overdue)
3. Implement "My Tasks" endpoint
4. Implement Activities module (auto-logged + manual)
5. Set up auto-logging triggers:
   - Client status change → activity
   - Deal stage change → activity
   - Task completion → activity
   - Document upload → activity
   - Unit status change → activity

#### PHASE 10: CRM — Communications & Documents

1. Implement Communication Log module
2. Implement Document Management module (metadata + R2 storage)

#### PHASE 11: Interest Tracking & Analytics

1. Implement Interest Tracking module with auto-logging (see BRD Section 5.12)
2. Implement most-viewed, most-searched, trending endpoints
3. Implement search heatmap (popular filter criteria)
4. Implement Analytics module with all dashboard KPIs (see BRD Section 5.13)
5. Implement date range filters and period grouping
6. Implement agent performance metrics
7. Implement revenue forecasting

#### PHASE 12: Audit Log & System Health

1. Implement Audit Log module (immutable, auto-capture before/after state)
2. Implement audit middleware that auto-logs on create/update/delete
3. Implement Health Check endpoints

#### PHASE 13: Postman Documentation

1. Create Postman collection with all endpoints organized by module
2. Each module has two folders: "CRUD Operations" + "Query Operations"
3. Include request/response examples for every endpoint
4. Set up Postman environment variables (BASE_URL, tokens, etc.)
5. Add test scripts to verify response structure
6. Follow the Postman standards in `.github/copilot-instructions.md`

#### PHASE 14: Testing

1. Follow ALL testing standards in `.github/COPILOT-TESTING-GUIDE.md`
2. Write unit tests for all services
3. Write integration tests for all routes
4. Test all authentication and permission scenarios
5. Test all CRUD operations for every module
6. Test search, filter, sort, pagination
7. Test business rules (deal stage transitions, status lifecycle)
8. Test error handling and edge cases
9. Achieve ≥ 80% code coverage
10. Follow the detailed testing plan in `docs/TESTING-PLAN.md`

### CRITICAL RULES

1. **NEVER hardcode secrets** — everything comes from `.env`
2. **NEVER use `any` type** — strict TypeScript only
3. **EVERY endpoint** must have auth + permission middleware (except public ones)
4. **EVERY list endpoint** must support pagination, search, filter, sort
5. **EVERY write operation** must be audit-logged
6. **EVERY input** must be validated with Zod
7. **EVERY error** must be caught and returned in standard format
8. **EVERY collection** must have proper indexes
9. **ALL media** goes through Cloudflare R2 (never local file storage)
10. **ALL routes** are relative paths mounted under `BASE_URL` (`/api/v1`)
11. Follow the architecture in `.github/copilot-instructions.md` exactly
12. Follow the testing standards in `.github/COPILOT-TESTING-GUIDE.md` exactly

### FOLDER STRUCTURE

Follow the structure defined in `.github/copilot-instructions.md` with these Awali-specific modules:

```
src/
├── config/
│   ├── index.ts
│   ├── database.ts
│   ├── env.ts
│   ├── cors.ts
│   ├── cloudflare-r2.ts
│   └── redis.ts
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── units/
│   ├── building-types/
│   ├── unit-types/
│   ├── features/
│   ├── clients/
│   ├── deals/
│   ├── tasks/
│   ├── activities/
│   ├── communications/
│   ├── documents/
│   ├── interest-tracking/
│   ├── analytics/
│   ├── audit-logs/
│   └── health/
├── shared/
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── audit.middleware.ts
│   │   ├── interest-tracker.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── pagination.ts
│   │   ├── query-builder.ts
│   │   ├── cloudflare-r2.util.ts
│   │   └── logger.ts
│   ├── errors/
│   └── constants/
├── database/
│   ├── connection.ts
│   ├── seeds/
│   │   ├── super-admin.seed.ts
│   │   ├── roles.seed.ts
│   │   ├── building-types.seed.ts
│   │   ├── unit-types.seed.ts
│   │   └── features.seed.ts
│   └── models/
├── types/
├── app.ts
├── server.ts
└── .env
```

Each module follows this pattern:

```
modules/[module-name]/
├── [module].controller.ts
├── [module].service.ts
├── [module].repository.ts
├── [module].routes.ts
├── [module].model.ts
├── dtos/
│   ├── create-[module].dto.ts
│   ├── update-[module].dto.ts
│   └── query-[module].dto.ts
├── interfaces/
│   └── [module].interface.ts
└── __tests__/
    ├── [module].service.test.ts
    ├── [module].controller.test.ts
    └── [module].routes.test.ts
```

### RESPONSE FORMAT

All endpoints must return responses in this exact format:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-09T10:00:00.000Z",
    "requestId": "uuid"
  }
}
```

**Paginated Success:**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasMore": true
    },
    "timestamp": "2026-03-09T10:00:00.000Z"
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-03-09T10:00:00.000Z",
    "requestId": "uuid"
  }
}
```

### DATABASE SCHEMAS

All collection schemas, relationships, and indexes are defined in `docs/BRD.md` Sections 5.1 through 5.14 and Section 8. Reference that document for the complete schema definitions.

### PERMISSION MIDDLEWARE SPECIFICATION

The authorization flow must work as follows:

```
1. Request arrives
2. auth.middleware.ts → Verify JWT, extract userId
3. Load user from DB (with populated role)
4. permission.middleware.ts → Check role.permissions[module][action]
5. If permission granted → next()
6. If permission denied → 403 Forbidden
7. super_admin role bypasses all permission checks (all permissions = true)
```

Usage in routes:

```
router.get('/units', auth(), permission('units', 'read'), controller.list);
router.post('/units', auth(), permission('units', 'create'), controller.create);
```

### BUSINESS RULES SUMMARY

1. **Deal → Unit Status Sync:**

   - Deal at `contract` stage → Unit becomes `reserved`
   - Deal `closed_won` → Unit becomes `sold`
   - Deal `closed_lost` → Unit reverts to `available`
2. **Cannot delete referenced records:**

   - Cannot delete building type if any unit uses it
   - Cannot delete unit type if any unit uses it
   - Cannot delete feature if any unit uses it
   - Cannot delete role if any user has it
3. **Super Admin protection:**

   - Cannot edit/delete the super_admin role
   - Cannot deactivate the last super_admin user
4. **Interest Tracking (automatic):**

   - Every `GET /units/:id` → logs a `view` event
   - Every `GET /units?search=...` → logs a `search` event with query
5. **Activity Auto-logging:**

   - Every model status/stage change → creates an activity record
   - Every task completion → activity
   - Every document upload → activity
6. **Audit Trail (automatic):**

   - Every `create`, `update`, `delete` operation → captured with before/after state

Now proceed to build the system following the phases above. Start with Phase 0 (Pre-Flight Checks).

---

_Document Version: 1.0.0_
_Last Updated: March 9, 2026_
