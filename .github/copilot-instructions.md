# 🏗️ Awali Real Estate — Chief Backend Engineer Instructions

> **Enterprise-Grade Backend Development Guidelines for the Awali Dashboard Platform**
>
> Node.js 20 LTS · Express.js 4.18 · TypeScript 5.4 · MongoDB Atlas 7.x · Cloudflare R2 · Redis 7.x
>
> Complete instructions for building the Awali CRM & Property Management backend with mandatory pre-flight checks, MongoDB integration, Cloudflare R2 media storage, dynamic RBAC, and professional Postman API documentation.

---

## ⚠️ CRITICAL: PRE-DEVELOPMENT WORKFLOW (MANDATORY)

### 🚨 PHASE 0: MCP Server Connection Verification

> **STOP! Before writing ANY code, the agent MUST complete all pre-flight checks.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRE-DEVELOPMENT CHECKLIST                        │
│                                                                     │
│  ❌ DO NOT START CODING UNTIL ALL CHECKS PASS                       │
│                                                                     │
│  □ Step 1: Verify MongoDB MCP Connection                           │
│  □ Step 2: Verify Postman MCP Connection                           │
│  □ Step 3: Test MongoDB Cluster Connectivity                       │
│  □ Step 4: List Existing Collections (14 expected)                 │
│  □ Step 5: Verify Postman Workspace Access                         │
│  □ Step 6: Verify .env has all required keys                       │
│                                                                     │
│  ⚠️ If ANY connection fails → FIX ISSUES BEFORE PROCEEDING         │
└─────────────────────────────────────────────────────────────────────┘
```

#### 1. MongoDB MCP Server Verification

Before ANY development begins, the agent MUST:

```typescript
// REQUIRED: Test MongoDB connection using MCP
// Use mcp_mongodb tools to verify:

// 1. List available databases
await mcp_mongodb_list_databases();

// 2. List collections in the Awali database
await mcp_mongodb_list_collections({ database: "awali_dashboard" });

// 3. Test a simple query
await mcp_mongodb_find({
  database: "awali_dashboard",
  collection: "users",
  limit: 1,
});
```

**Expected collections (14):**
`users`, `roles`, `units`, `building_types`, `unit_types`, `features`, `clients`, `deals`, `tasks`, `activities`, `communications`, `documents_metadata`, `interest_logs`, `audit_logs`

**If MongoDB connection fails:**

- ✅ Check `MONGODB_URI` in `.env`
- ✅ Verify network access (IP whitelist on Atlas)
- ✅ Confirm credentials are correct
- ✅ Test DNS resolution
- ❌ **NEVER proceed with coding until resolved**

#### 2. Postman MCP Server Verification

```typescript
// REQUIRED: Test Postman connection using MCP
// Use Postman MCP tools to verify:

// 1. List available workspaces
await mcp_postman_get_workspaces();

// 2. List collections in workspace
await mcp_postman_get_collections({ workspaceId: "your_workspace_id" });

// 3. Verify environment access
await mcp_postman_get_environments();
```

**If Postman connection fails:**

- ✅ Check Postman API key
- ✅ Verify workspace permissions
- ✅ Confirm API key has correct scopes
- ❌ **NEVER proceed with coding until resolved**

---

## 📋 Table of Contents

1. [Pre-Development Workflow (MANDATORY)](#-critical-pre-development-workflow-mandatory)
2. [Development Phases](#-development-phases)
3. [Core Philosophy](#-core-philosophy)
4. [Project Architecture](#-project-architecture)
5. [TypeScript & OOP Standards](#-typescript--oop-standards)
6. [SOLID Principles](#-solid-principles)
7. [MongoDB Schema Design](#-mongodb-schema-design)
8. [API Design & REST Standards](#-api-design--rest-standards)
9. [Dynamic RBAC Middleware](#-dynamic-rbac-middleware)
10. [Cloudflare R2 Media Service](#-cloudflare-r2-media-service)
11. [Interest Tracking Middleware](#-interest-tracking-middleware)
12. [Audit Log Middleware](#-audit-log-middleware)
13. [Security Fortress](#-security-fortress)
14. [Environment Configuration](#-environment-configuration)
15. [Postman Integration Standards](#-postman-integration-standards)
16. [Error Handling & Observability](#-error-handling--observability)
17. [Performance & Scalability](#-performance--scalability)
18. [Testing Standards](#-testing-standards)
19. [Production Checklist](#-production-checklist)

---

## 📊 Development Phases

### Mandatory Development Order

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         DEVELOPMENT PHASES                                  │
│                                                                            │
│  PHASE 0 ──► PHASE 1 ──► PHASE 2 ──► PHASE 3 ──► PHASE 4                  │
│                                                                            │
│  MCP         MongoDB      Backend     Postman     Professional             │
│  Verification Collections  Logic       Integration Testing                 │
│                                                                            │
│  ⚠️ EACH PHASE MUST BE COMPLETED BEFORE PROCEEDING TO NEXT                │
└────────────────────────────────────────────────────────────────────────────┘
```

### Phase 0: MCP Connection Verification (BLOCKING)

- ✅ Verify MongoDB MCP server connection
- ✅ Verify Postman MCP server connection
- ✅ Test database connectivity
- ✅ List existing collections/workspaces
- ❌ **DO NOT PROCEED IF ANY CONNECTION FAILS**

### Phase 1: MongoDB Collection Design & Creation

- ✅ Design collection schemas with proper indexes
- ✅ Create collections using MCP tools
- ✅ Set up validation rules
- ✅ Create necessary indexes for queries
- ✅ Seed initial data if required

### Phase 2: Backend Logic Development

- ✅ Set up project structure
- ✅ Configure `.env` file
- ✅ Implement services, controllers, repositories
- ✅ Add authentication & authorization
- ✅ Implement all CRUD operations
- ✅ Add search, filter, sort, pagination

### Phase 3: Postman Integration

- ✅ Create professional Postman collection
- ✅ Add all endpoints with descriptions
- ✅ Set up environment variables
- ✅ Include request/response examples
- ✅ Add search, filter, sort, pagination endpoints
- ✅ Document all query parameters

### Phase 4: Professional Testing

- ✅ Test all endpoints via Postman
- ✅ Verify CRUD operations
- ✅ Test search, filter, sort, pagination
- ✅ Test error handling
- ✅ Test authentication flows
- ✅ Validate response formats

---

## 🧠 Core Philosophy

### The Backend Mindset

- **Statelessness is King**: Never store state in memory. Use MongoDB or Redis. Servers must be disposable.
- **Trust No One**: Treat every request payload as malicious. Validate strictly before processing.
- **Fail Gracefully**: The server must never crash. Catch every exception.
- **Async Everything**: Never block the Event Loop. CPU-intensive tasks go to Worker Threads or Job Queues.
- **Security First**: Every decision must consider security implications.
- **Scalability by Design**: Plan for 100x traffic from day one.

### Non-Negotiables

- ✅ All MCP connections verified before coding
- ✅ MongoDB collections created BEFORE backend logic
- ✅ Zero security vulnerabilities (OWASP Top 10 compliant)
- ✅ 100% TypeScript strict mode (no `any` types)
- ✅ All inputs validated and sanitized
- ✅ Rate limiting on all endpoints
- ✅ Comprehensive error handling
- ✅ Environment-based configuration (`.env` file)
- ✅ Professional Postman documentation
- ✅ All endpoints tested before delivery
- ✅ Dynamic RBAC: permissions checked via middleware, not hardcoded roles
- ✅ Cloudflare R2 for all media uploads (images, videos, PDFs)
- ✅ Audit logs for every write operation (create, update, delete)
- ✅ Interest tracking on unit views and searches
- ✅ Bilingual support: all lookup entities have nameEn + nameAr

---

## 🏗️ Project Architecture

### Clean Architecture Structure

```
src/
├── config/                   # Configuration management
│   ├── index.ts             # Config aggregator
│   ├── database.ts          # MongoDB config
│   ├── env.ts               # Environment validation (Zod)
│   ├── cors.ts              # CORS config
│   └── cloudflare-r2.ts     # R2 S3-compatible client config
├── modules/                  # Feature-based organization (17 modules)
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── users/
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.routes.ts
│   │   ├── user.model.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── roles/               # Dynamic RBAC roles & permissions
│   │   ├── role.controller.ts
│   │   ├── role.service.ts
│   │   ├── role.repository.ts
│   │   ├── role.routes.ts
│   │   ├── role.model.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── units/               # Core property listings
│   │   ├── unit.controller.ts
│   │   ├── unit.service.ts
│   │   ├── unit.repository.ts
│   │   ├── unit.routes.ts
│   │   ├── unit.model.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── building-types/      # Dynamic attribute
│   │   ├── building-type.controller.ts
│   │   ├── building-type.service.ts
│   │   ├── building-type.repository.ts
│   │   ├── building-type.routes.ts
│   │   ├── building-type.model.ts
│   │   └── dtos/
│   ├── unit-types/          # Dynamic attribute
│   │   ├── unit-type.controller.ts
│   │   ├── unit-type.service.ts
│   │   ├── unit-type.repository.ts
│   │   ├── unit-type.routes.ts
│   │   ├── unit-type.model.ts
│   │   └── dtos/
│   ├── features/            # Dynamic attribute (amenities)
│   │   ├── feature.controller.ts
│   │   ├── feature.service.ts
│   │   ├── feature.repository.ts
│   │   ├── feature.routes.ts
│   │   ├── feature.model.ts
│   │   └── dtos/
│   ├── media/               # Cloudflare R2 upload service
│   │   ├── media.controller.ts
│   │   ├── media.service.ts  # R2 upload/delete/presign
│   │   ├── media.routes.ts
│   │   └── interfaces/
│   ├── clients/             # CRM leads & contacts
│   │   ├── client.controller.ts
│   │   ├── client.service.ts
│   │   ├── client.repository.ts
│   │   ├── client.routes.ts
│   │   ├── client.model.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── deals/               # CRM pipeline stages
│   │   ├── deal.controller.ts
│   │   ├── deal.service.ts
│   │   ├── deal.repository.ts
│   │   ├── deal.routes.ts
│   │   ├── deal.model.ts
│   │   ├── dtos/
│   │   └── interfaces/
│   ├── tasks/               # CRM task management
│   │   ├── task.controller.ts
│   │   ├── task.service.ts
│   │   ├── task.repository.ts
│   │   ├── task.routes.ts
│   │   ├── task.model.ts
│   │   └── dtos/
│   ├── activities/          # Auto-logged actions
│   │   ├── activity.controller.ts
│   │   ├── activity.service.ts
│   │   ├── activity.repository.ts
│   │   ├── activity.routes.ts
│   │   ├── activity.model.ts
│   │   └── interfaces/
│   ├── communications/      # Call/email/meeting/WhatsApp logs
│   │   ├── communication.controller.ts
│   │   ├── communication.service.ts
│   │   ├── communication.repository.ts
│   │   ├── communication.routes.ts
│   │   ├── communication.model.ts
│   │   └── dtos/
│   ├── documents/           # File metadata (files stored in R2)
│   │   ├── document.controller.ts
│   │   ├── document.service.ts
│   │   ├── document.repository.ts
│   │   ├── document.routes.ts
│   │   ├── document.model.ts
│   │   └── dtos/
│   ├── interest-tracking/   # Unit view & search analytics
│   │   ├── interest.controller.ts
│   │   ├── interest.service.ts
│   │   ├── interest.repository.ts
│   │   ├── interest.routes.ts
│   │   ├── interest.model.ts
│   │   └── interfaces/
│   ├── analytics/           # Dashboard KPIs & reports
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   ├── analytics.routes.ts
│   │   └── interfaces/
│   └── audit-logs/          # Immutable change history
│       ├── audit-log.controller.ts
│       ├── audit-log.service.ts
│       ├── audit-log.repository.ts
│       ├── audit-log.routes.ts
│       ├── audit-log.model.ts
│       └── interfaces/
├── shared/                   # Shared resources
│   ├── middlewares/
│   │   ├── auth.middleware.ts          # JWT verification
│   │   ├── permission.middleware.ts    # Dynamic RBAC check
│   │   ├── validate.middleware.ts      # Zod validation
│   │   ├── rateLimit.middleware.ts     # Rate limiting
│   │   ├── interest.middleware.ts      # Auto-track unit views
│   │   ├── audit.middleware.ts         # Auto-log write operations
│   │   ├── upload.middleware.ts        # Multer for file uploads
│   │   └── error.middleware.ts         # Global error handler
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── pagination.ts
│   │   ├── query-builder.ts
│   │   └── logger.ts                  # Winston + Morgan
│   ├── errors/              # Custom Error classes
│   │   ├── base.exception.ts
│   │   ├── http.exception.ts
│   │   └── validation.exception.ts
│   └── constants/
│       ├── http-status.ts
│       ├── error-codes.ts
│       └── permissions.ts            # Permission keys enum
├── database/                 # Database setup
│   ├── connection.ts
│   └── seeds/
│       ├── seed-super-admin.ts
│       ├── seed-roles.ts
│       └── seed-lookup-data.ts       # building_types, unit_types, features
├── types/                   # TypeScript definitions
│   └── express.d.ts         # Augment Request with user & permissions
├── app.ts                   # Express app setup
├── server.ts                # Server bootstrap
└── .env                     # Environment variables (see below)
```

### Layer Responsibilities

```typescript
// ✅ GOOD: Clear separation of concerns

// Controller (Presentation Layer) - Handle HTTP only
class UnitController {
  constructor(private unitService: UnitService) {}

  async getUnits(req: Request, res: Response) {
    const { page, limit, sort, search, ...filters } = req.query;
    const result = await this.unitService.findAll({
      page,
      limit,
      sort,
      search,
      filters,
    });
    res.json(ApiResponse.paginated(result));
  }
}

// Service (Business Logic) - Business rules only
class UnitService {
  constructor(
    private unitRepository: UnitRepository,
    private interestService: InterestService,
  ) {}

  async findById(id: string, userId?: string): Promise<Unit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) throw new NotFoundException("Unit not found");
    // Auto-track view interest
    if (userId) await this.interestService.logView(id, userId);
    return unit;
  }
}

// Repository (Data Access) - Database operations only
class UnitRepository {
  async findPaginated(options: QueryOptions): Promise<PaginatedResult<Unit>> {
    const query = this.buildQuery(options.filters, options.search);
    const [units, total] = await Promise.all([
      Unit.find(query)
        .populate("buildingType unitType features")
        .sort(this.buildSort(options.sort))
        .skip((options.page - 1) * options.limit)
        .limit(options.limit),
      Unit.countDocuments(query),
    ]);
    return { data: units, total, page: options.page, limit: options.limit };
  }
}
```

---

## 📘 TypeScript & OOP Standards

### Strict Type Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@config/*": ["./config/*"],
      "@modules/*": ["./modules/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

### Interface Design

```typescript
// ✅ GOOD: Well-defined interfaces
interface IUser {
  readonly _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserCreateDTO {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface IUserResponseDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

// Generic repository interface
interface IRepository<T, CreateDTO, UpdateDTO> {
  findAll(options?: QueryOptions): Promise<PaginatedResult<T>>;
  findById(id: string): Promise<T | null>;
  findOne(conditions: Partial<T>): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
  count(conditions?: Partial<T>): Promise<number>;
}

// Query options interface
interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  filters?: Record<string, unknown>;
}

// Paginated result interface
interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
```

---

## 🔷 SOLID Principles

### S - Single Responsibility Principle

```typescript
// ❌ BAD: Controller doing everything
class UserController {
  async register(req, res) {
    const user = req.body;
    if (!user.email) throw new Error("Email required"); // Validation
    const exists = await db.query("..."); // DB Logic
    await sendEmail(user.email); // Notification
  }
}

// ✅ GOOD: Separation of Concerns
class UserController {
  constructor(private userService: UserService) {}

  async register(req: Request, res: Response) {
    const output = await this.userService.registerUser(req.body);
    return res.status(201).json(ApiResponse.success(output));
  }
}

class UserService {
  constructor(
    private userRepository: UserRepository,
    private eventEmitter: EventEmitter,
  ) {}

  async registerUser(data: CreateUserDTO): Promise<User> {
    const user = await this.userRepository.create(data);
    this.eventEmitter.emit("user.created", user);
    return user;
  }
}
```

### D - Dependency Injection

```typescript
// ✅ GOOD: Dependency Injection
class OrderService {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly repo: OrderRepository,
  ) {}

  async checkout(orderId: string) {
    // Use injected dependencies
  }
}
```

---

## 🗄️ MongoDB Schema Design

### Phase 1: Create Collections BEFORE Backend Logic

> **CRITICAL: Always create MongoDB collections and indexes BEFORE writing backend code**

#### Using MCP to Create Collections

```typescript
// Step 1: Design the schema — Example for Units collection
const unitSchema = {
  unitNumber: { type: String, required: true, unique: true },
  buildingType: { type: "ObjectId", ref: "BuildingType", required: true },
  unitType: { type: "ObjectId", ref: "UnitType", required: true },
  features: [{ type: "ObjectId", ref: "Feature" }],
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: "SAR" },
  },
  area: {
    totalArea: Number,
    livingArea: Number,
    unit: { type: String, default: "sqm" },
  },
  bedrooms: Number,
  bathrooms: Number,
  floor: Number,
  facade: {
    type: String,
    enum: [
      "north",
      "south",
      "east",
      "west",
      "north-east",
      "north-west",
      "south-east",
      "south-west",
    ],
  },
  description: { en: String, ar: String },
  images: [{ url: String, key: String, order: Number, isPrimary: Boolean }],
  documents: [{ url: String, key: String, name: String, type: String }],
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: "ObjectId", ref: "User" },
  updatedBy: { type: "ObjectId", ref: "User" },
};

// Step 2: Create collection with validation using MCP
await mcp_mongodb_create_collection({
  database: "awali_dashboard",
  collection: "units",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["unitNumber", "buildingType", "unitType", "price"],
      properties: {
        unitNumber: { bsonType: "string" },
        status: { enum: ["available", "reserved", "sold"] },
        isPublished: { bsonType: "bool" },
        isDeleted: { bsonType: "bool" },
      },
    },
  },
});

// Step 3: Create indexes for performance
await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: { unitNumber: 1 },
  options: { unique: true },
});

await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: { status: 1, isPublished: 1, isDeleted: 1 },
});

await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: { buildingType: 1, unitType: 1 },
});

await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: { "price.amount": 1 },
});

await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: { createdAt: -1 },
});

// Step 4: Create text index for search
await mcp_mongodb_create_index({
  database: "awali_dashboard",
  collection: "units",
  keys: {
    unitNumber: "text",
    "description.en": "text",
    "description.ar": "text",
  },
});
```

### Mongoose Model Design

```typescript
// modules/units/unit.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
  _id: mongoose.Types.ObjectId;
  unitNumber: string;
  buildingType: mongoose.Types.ObjectId;
  unitType: mongoose.Types.ObjectId;
  features: mongoose.Types.ObjectId[];
  status: "available" | "reserved" | "sold";
  price: { amount: number; currency: string };
  area: { totalArea: number; livingArea?: number; unit: string };
  bedrooms: number;
  bathrooms: number;
  floor: number;
  facade: string;
  description: { en: string; ar: string };
  images: Array<{
    url: string;
    key: string;
    order: number;
    isPrimary: boolean;
  }>;
  documents: Array<{ url: string; key: string; name: string; type: string }>;
  isPublished: boolean;
  isDeleted: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const unitSchema = new Schema<IUnit>(
  {
    unitNumber: {
      type: String,
      required: [true, "Unit number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    buildingType: {
      type: Schema.Types.ObjectId,
      ref: "BuildingType",
      required: [true, "Building type is required"],
    },
    unitType: {
      type: Schema.Types.ObjectId,
      ref: "UnitType",
      required: [true, "Unit type is required"],
    },
    features: [{ type: Schema.Types.ObjectId, ref: "Feature" }],
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
    price: {
      amount: { type: Number, required: [true, "Price is required"] },
      currency: { type: String, default: "SAR" },
    },
    area: {
      totalArea: Number,
      livingArea: Number,
      unit: { type: String, default: "sqm" },
    },
    bedrooms: Number,
    bathrooms: Number,
    floor: Number,
    facade: {
      type: String,
      enum: [
        "north",
        "south",
        "east",
        "west",
        "north-east",
        "north-west",
        "south-east",
        "south-west",
      ],
    },
    description: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    images: [
      {
        url: String,
        key: String, // R2 object key for deletion
        order: { type: Number, default: 0 },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    documents: [
      {
        url: String,
        key: String,
        name: String,
        type: String,
      },
    ],
    isPublished: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for search, filter, sort
unitSchema.index({ status: 1, isPublished: 1, isDeleted: 1 });
unitSchema.index({ buildingType: 1, unitType: 1 });
unitSchema.index({ "price.amount": 1 });
unitSchema.index({ createdAt: -1 });
unitSchema.index({
  unitNumber: "text",
  "description.en": "text",
  "description.ar": "text",
});

// Default query: exclude soft-deleted
unitSchema.pre(/^find/, function () {
  this.where({ isDeleted: { $ne: true } });
});

export const Unit = mongoose.model<IUnit>("Unit", unitSchema);
```

### Bilingual Lookup Model Pattern

```typescript
// modules/building-types/building-type.model.ts
// This same pattern applies to unit_types and features

export interface IBuildingType extends Document {
  nameEn: string;
  nameAr: string;
  description?: { en: string; ar: string };
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const buildingTypeSchema = new Schema<IBuildingType>(
  {
    nameEn: { type: String, required: true, unique: true, trim: true },
    nameAr: { type: String, required: true, unique: true, trim: true },
    description: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
    icon: String,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

buildingTypeSchema.index({ nameEn: 1 }, { unique: true });
buildingTypeSchema.index({ nameAr: 1 }, { unique: true });
buildingTypeSchema.index({ order: 1 });
```

### Roles & Permissions Model

```typescript
// modules/roles/role.model.ts
export interface IPermissions {
  [module: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

export interface IRole extends Document {
  nameEn: string;
  nameAr: string;
  description?: string;
  permissions: IPermissions;
  isSystem: boolean; // true for super_admin — cannot edit/delete
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    nameEn: { type: String, required: true, unique: true, trim: true },
    nameAr: { type: String, required: true, unique: true, trim: true },
    description: String,
    permissions: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
      // Structure: { units: { create: true, read: true, update: false, delete: false }, ... }
    },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);
```

---

## 🌐 API Design & REST Standards

### RESTful Endpoint Design

```typescript
// ✅ GOOD: Proper REST endpoints with full CRUD + Search/Filter/Sort/Pagination
// BASE_URL = http://localhost:5000/api/v1 (configurable via .env)

// ── Authentication ──
POST   /api/v1/auth/register            # Register new user (super_admin only)
POST   /api/v1/auth/login               # Login → access + refresh tokens
POST   /api/v1/auth/refresh             # Refresh access token
POST   /api/v1/auth/logout              # Invalidate refresh token
POST   /api/v1/auth/change-password     # Change password
GET    /api/v1/auth/me                  # Get current user profile

// ── Users ──
GET    /api/v1/users                    # List all users (paginated)
GET    /api/v1/users/:id                # Get single user
POST   /api/v1/users                    # Create user
PATCH  /api/v1/users/:id                # Partial update user
DELETE /api/v1/users/:id                # Soft delete user
POST   /api/v1/users/:id/activate      # Activate user
POST   /api/v1/users/:id/deactivate    # Deactivate user

// ── Roles & Permissions ──
GET    /api/v1/roles                    # List roles
GET    /api/v1/roles/:id                # Get role with permissions
POST   /api/v1/roles                    # Create role
PATCH  /api/v1/roles/:id                # Update role permissions
DELETE /api/v1/roles/:id                # Delete role (if no users)

// ── Units (Core Property Module) ──
GET    /api/v1/units                    # List units (search, filter, sort, paginate)
GET    /api/v1/units/:id                # Get unit (auto-tracks view interest)
POST   /api/v1/units                    # Create unit
PATCH  /api/v1/units/:id                # Update unit
DELETE /api/v1/units/:id                # Soft delete
PATCH  /api/v1/units/:id/status        # Change unit status
PATCH  /api/v1/units/:id/publish       # Publish/unpublish
POST   /api/v1/units/:id/images        # Upload images → Cloudflare R2
DELETE /api/v1/units/:id/images/:imgId  # Delete image from R2
PATCH  /api/v1/units/:id/images/reorder# Reorder images
POST   /api/v1/units/:id/documents     # Upload document → R2
GET    /api/v1/units/statistics         # Unit stats (counts by status)
GET    /api/v1/units/most-viewed        # Most viewed units

// ── Dynamic Attributes (building-types, unit-types, features) ──
GET    /api/v1/building-types           # List building types
POST   /api/v1/building-types           # Create
PATCH  /api/v1/building-types/:id       # Update
DELETE /api/v1/building-types/:id       # Delete (if no units reference it)
// Same pattern for /api/v1/unit-types and /api/v1/features

// ── Clients (CRM Leads) ──
GET    /api/v1/clients                  # List + search + filter + sort
GET    /api/v1/clients/:id              # Get client
POST   /api/v1/clients                  # Create client
PATCH  /api/v1/clients/:id              # Update client
DELETE /api/v1/clients/:id              # Soft delete
PATCH  /api/v1/clients/:id/status      # Change status (new→contacted→qualified→won/lost)
PATCH  /api/v1/clients/:id/assign      # Assign to agent
GET    /api/v1/clients/:id/timeline    # Full activity timeline
GET    /api/v1/clients/:id/matching-units # Units matching preferences
GET    /api/v1/clients/statistics       # Client funnel stats

// ── Deals (Pipeline) ──
GET    /api/v1/deals                    # List deals
GET    /api/v1/deals/:id                # Get deal
POST   /api/v1/deals                    # Create deal
PATCH  /api/v1/deals/:id                # Update deal
DELETE /api/v1/deals/:id                # Soft delete
PATCH  /api/v1/deals/:id/stage         # Move pipeline stage (auto-syncs unit status)
POST   /api/v1/deals/:id/payments      # Record payment
GET    /api/v1/deals/pipeline           # Pipeline summary grouped by stage
GET    /api/v1/deals/statistics         # Deal stats

// ── Tasks ──
GET    /api/v1/tasks                    # List tasks
POST   /api/v1/tasks                    # Create task
PATCH  /api/v1/tasks/:id                # Update task
PATCH  /api/v1/tasks/:id/complete      # Mark complete
DELETE /api/v1/tasks/:id                # Delete
GET    /api/v1/tasks/my-tasks           # Current user's tasks
GET    /api/v1/tasks/overdue            # Overdue tasks

// ── Communications ──
GET    /api/v1/communications           # List
POST   /api/v1/communications           # Log call/email/meeting/whatsapp
GET    /api/v1/communications/client/:id # Communications for client

// ── Documents ──
GET    /api/v1/documents                # List
POST   /api/v1/documents                # Upload document metadata (file → R2)
DELETE /api/v1/documents/:id            # Delete doc + R2 object

// ── Interest Tracking ──
GET    /api/v1/interest/most-viewed     # Most viewed units
GET    /api/v1/interest/most-searched   # Top search terms
GET    /api/v1/interest/trending        # Trending units
GET    /api/v1/interest/unit/:id        # Interest for specific unit
GET    /api/v1/interest/heatmap         # Search filter heatmap

// ── Analytics ──
GET    /api/v1/analytics/dashboard      # KPI dashboard
GET    /api/v1/analytics/sales          # Sales analytics
GET    /api/v1/analytics/pipeline       # Pipeline health
GET    /api/v1/analytics/agents         # Agent performance
GET    /api/v1/analytics/clients        # Client funnel analytics
GET    /api/v1/analytics/units          # Unit status analytics

// ── Audit Logs (read-only) ──
GET    /api/v1/audit-logs               # List audit logs (paginated)
GET    /api/v1/audit-logs/resource/:type/:id # Logs for a resource
GET    /api/v1/audit-logs/user/:id      # Logs by user

// ── Health ──
GET    /api/v1/health                   # Basic health
GET    /api/v1/health/detailed          # DB + Redis health (auth required)

// ── Query Parameter Examples ──
GET    /api/v1/units?page=1&limit=20                           # Pagination
GET    /api/v1/units?sort=-price.amount                        # Sort (- for desc)
GET    /api/v1/units?sort=unitNumber,-createdAt                # Multi-field sort
GET    /api/v1/units?search=villa                              # Text search
GET    /api/v1/units?status=available&bedrooms=4               # Filter by fields
GET    /api/v1/units?price.amount[gte]=300000&price.amount[lte]=500000  # Range filter
GET    /api/v1/units?search=villa&status=available&sort=-price.amount&page=1&limit=10  # Combined
```

### Response Standards

```typescript
// shared/utils/api-response.ts

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

class ApiResponse {
  static success<T>(data: T, meta?: object): SuccessResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): SuccessResponse<T[]> {
    const totalPages = Math.ceil(total / limit);
    return {
      success: true,
      data: items,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        },
        timestamp: new Date().toISOString(),
      },
    };
  }

  static error(
    code: string,
    message: string,
    details?: Record<string, string[]>,
  ): ErrorResponse {
    return {
      success: false,
      error: { code, message, details },
      meta: { timestamp: new Date().toISOString(), requestId: "" },
    };
  }
}
```

### Query Builder Utility

```typescript
// shared/utils/query-builder.ts
import { FilterQuery, SortOrder } from "mongoose";

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  fields?: string;
  [key: string]: string | undefined;
}

class QueryBuilder<T> {
  private query: FilterQuery<T> = {};
  private sortOptions: Record<string, SortOrder> = {};
  private selectFields: string[] = [];
  private pagination = { page: 1, limit: 20 };

  constructor(private params: QueryParams) {}

  // Build filter conditions
  filter(allowedFields: string[]): this {
    const operators: Record<string, string> = {
      gte: "$gte",
      gt: "$gt",
      lte: "$lte",
      lt: "$lt",
      in: "$in",
      ne: "$ne",
    };

    for (const [key, value] of Object.entries(this.params)) {
      if (
        !value ||
        ["page", "limit", "sort", "search", "fields"].includes(key)
      ) {
        continue;
      }

      // Handle operators: field[gte]=value
      const match = key.match(/^(.+)\[(.+)\]$/);
      if (match) {
        const [, field, op] = match;
        if (allowedFields.includes(field) && operators[op]) {
          this.query[field] = { ...this.query[field], [operators[op]]: value };
        }
      } else if (allowedFields.includes(key)) {
        // Handle array values: field=val1,val2
        this.query[key] = value.includes(",")
          ? { $in: value.split(",") }
          : value;
      }
    }

    return this;
  }

  // Build text search
  search(searchFields: string[]): this {
    if (this.params.search) {
      this.query.$text = { $search: this.params.search };
    }
    return this;
  }

  // Build sort options: sort=field,-field2
  sort(defaultSort = "-createdAt"): this {
    const sortParam = this.params.sort || defaultSort;
    for (const field of sortParam.split(",")) {
      const order: SortOrder = field.startsWith("-") ? -1 : 1;
      const fieldName = field.replace(/^-/, "");
      this.sortOptions[fieldName] = order;
    }
    return this;
  }

  // Build field selection
  select(defaultFields?: string[]): this {
    if (this.params.fields) {
      this.selectFields = this.params.fields.split(",");
    } else if (defaultFields) {
      this.selectFields = defaultFields;
    }
    return this;
  }

  // Build pagination
  paginate(maxLimit = 100): this {
    this.pagination.page = Math.max(1, parseInt(this.params.page || "1", 10));
    this.pagination.limit = Math.min(
      maxLimit,
      Math.max(1, parseInt(this.params.limit || "20", 10)),
    );
    return this;
  }

  // Get built query options
  build() {
    return {
      filter: this.query,
      sort: this.sortOptions,
      select: this.selectFields.join(" "),
      skip: (this.pagination.page - 1) * this.pagination.limit,
      limit: this.pagination.limit,
      page: this.pagination.page,
    };
  }
}

export { QueryBuilder };
```

---

## 🛡️ Dynamic RBAC Middleware

### Permission Middleware Pattern

```typescript
// shared/middlewares/permission.middleware.ts
// Checks user's role permissions dynamically — NEVER hardcode role names

import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../errors/http.exception";

type Action = "create" | "read" | "update" | "delete";

export const requirePermission = (module: string, action: Action) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user; // Set by auth middleware
    if (!user) throw new ForbiddenException("Authentication required");

    // Super admin bypass — identified by isSystem flag on role
    if (user.role?.isSystem) return next();

    const permissions = user.role?.permissions;
    if (!permissions || !permissions[module] || !permissions[module][action]) {
      throw new ForbiddenException(
        `You do not have ${action} permission on ${module}`,
      );
    }

    next();
  };
};

// Usage in routes:
// router.get("/", auth, requirePermission("units", "read"), unitController.list);
// router.post("/", auth, requirePermission("units", "create"), unitController.create);
// router.patch("/:id", auth, requirePermission("units", "update"), unitController.update);
// router.delete("/:id", auth, requirePermission("units", "delete"), unitController.delete);
```

### Permission Modules Enum

```typescript
// shared/constants/permissions.ts
export const PERMISSION_MODULES = [
  "users",
  "roles",
  "units",
  "building_types",
  "unit_types",
  "features",
  "clients",
  "deals",
  "tasks",
  "activities",
  "communications",
  "documents",
  "interest_tracking",
  "analytics",
  "audit_logs",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
```

---

## ☁️ Cloudflare R2 Media Service

### R2 Configuration

```typescript
// config/cloudflare-r2.ts
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME;
export const R2_PUBLIC_URL = env.CLOUDFLARE_R2_PUBLIC_URL;
```

### Media Service Pattern

```typescript
// modules/media/media.service.ts
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from "../../config/cloudflare-r2";
import { v4 as uuidv4 } from "uuid";

class MediaService {
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_PDF_SIZE = 25 * 1024 * 1024; // 25MB

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; key: string }> {
    const key = `${folder}/${uuidv4()}-${file.originalname}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      url: `${R2_PUBLIC_URL}/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string) {
    return Promise.all(files.map((file) => this.upload(file, folder)));
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({ Bucket: R2_BUCKET, Key: key });
    return getSignedUrl(r2Client, command, { expiresIn });
  }
}
```

### Upload Middleware (Multer)

```typescript
// shared/middlewares/upload.middleware.ts
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files (JPEG, PNG, WebP, AVIF) are allowed"));
  },
}).array("images", 20); // Max 20 images per upload

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per video
  fileFilter: (_, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only video files (MP4, WebM, MOV) are allowed"));
  },
}).single("video");

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per document
  fileFilter: (_, file, cb) => {
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed. Accepted: PDF, JPEG, PNG, WebP"));
  },
}).single("document");
```

---

## 👁️ Interest Tracking Middleware

### Auto-Track Unit Views & Searches

```typescript
// shared/middlewares/interest.middleware.ts
// Automatically logs an interest event when a unit is viewed or searched
// This is NON-BLOCKING — failures are silently ignored to avoid affecting the main request

import { Request, Response, NextFunction } from "express";
import { InterestService } from "../../modules/interest-tracking/interest.service";

export const trackUnitView = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const unitId = req.params.id;
    const userId = req.user?._id;
    if (unitId && userId) {
      // Fire and forget — non-blocking
      InterestService.logView(unitId, userId, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      }).catch(() => {}); // Silent fail
    }
  } catch {
    // Never block the request
  }
  next();
};

export const trackUnitSearch = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;
    const searchQuery = req.query.search as string;
    const filters = { ...req.query };
    delete filters.page;
    delete filters.limit;
    delete filters.sort;
    delete filters.fields;

    if (userId && (searchQuery || Object.keys(filters).length > 0)) {
      InterestService.logSearch(userId, searchQuery || "", filters).catch(
        () => {},
      );
    }
  } catch {
    // Never block the request
  }
  next();
};

// Usage in routes:
// router.get("/", auth, requirePermission("units", "read"), trackUnitSearch, unitController.list);
// router.get("/:id", auth, requirePermission("units", "read"), trackUnitView, unitController.getById);
```

### Interest Log Model

```typescript
// modules/interest-tracking/interest.model.ts
const interestLogSchema = new Schema(
  {
    type: { type: String, enum: ["view", "search"], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    unitId: { type: Schema.Types.ObjectId, ref: "Unit" }, // Only for "view" type
    searchQuery: String, // Only for "search" type
    searchFilters: Schema.Types.Mixed,
    metadata: {
      ip: String,
      userAgent: String,
    },
  },
  { timestamps: true },
);

interestLogSchema.index({ type: 1, createdAt: -1 });
interestLogSchema.index({ unitId: 1, createdAt: -1 });
interestLogSchema.index({ userId: 1, createdAt: -1 });
interestLogSchema.index({ searchQuery: "text" });
```

---

## 📝 Audit Log Middleware

### Auto-Log Write Operations

```typescript
// shared/middlewares/audit.middleware.ts
// Automatically creates an audit log entry for every create, update, delete
// Captures before/after snapshots for change tracking

import { Request, Response, NextFunction } from "express";
import { AuditLogService } from "../../modules/audit-logs/audit-log.service";

type AuditAction = "create" | "update" | "delete";

export const auditLog = (resourceType: string, action: AuditAction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Intercept response to capture the result
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // Only log on successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditLogService.create({
          action,
          resourceType,
          resourceId: req.params.id || body?.data?.id,
          userId: req.user?._id,
          before: (req as any)._auditBefore || null, // Set by service layer before update/delete
          after: action === "delete" ? null : body?.data || null,
          changes: action === "update" ? req.body : null,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "",
        }).catch(() => {}); // Silent fail — audit must never break the request
      }

      return originalJson(body);
    };

    next();
  };
};

// Usage in routes:
// router.post("/", auth, requirePermission("units", "create"), auditLog("units", "create"), controller.create);
// router.patch("/:id", auth, requirePermission("units", "update"), auditLog("units", "update"), controller.update);
// router.delete("/:id", auth, requirePermission("units", "delete"), auditLog("units", "delete"), controller.delete);
```

### Audit Log Model

```typescript
// modules/audit-logs/audit-log.model.ts
const auditLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },
    resourceType: { type: String, required: true }, // "units", "clients", "deals", etc.
    resourceId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    before: Schema.Types.Mixed, // Snapshot before change (null for create)
    after: Schema.Types.Mixed, // Snapshot after change (null for delete)
    changes: Schema.Types.Mixed, // Only the changed fields (for update)
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
    // Audit logs are IMMUTABLE — no updates or deletes
    strict: true,
  },
);

// Compound indexes for efficient querying
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });
```

---

## 🛡️ Security Fortress

### Input Validation with Zod

```typescript
import { z } from "zod";

// User validation schemas
const createUserSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .max(255)
      .transform((e) => e.toLowerCase().trim()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100)
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters"),
    role: z.enum(["user", "admin"]).default("user"),
  }),
});

const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().optional(),
    search: z.string().max(100).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ID format"),
  }),
});

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = error.errors.reduce(
          (acc, err) => {
            const path = err.path.join(".");
            acc[path] = acc[path] || [];
            acc[path].push(err.message);
            return acc;
          },
          {} as Record<string, string[]>,
        );

        return res
          .status(400)
          .json(
            ApiResponse.error(
              "VALIDATION_ERROR",
              "Invalid request data",
              details,
            ),
          );
      }
      next(error);
    }
  };
};
```

### Security Middleware Setup

```typescript
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

export function setupSecurityMiddleware(app: Express) {
  // Helmet - Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") || "*",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
      standardHeaders: true,
      legacyHeaders: false,
      message: ApiResponse.error("RATE_LIMIT_EXCEEDED", "Too many requests"),
    }),
  );

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: ApiResponse.error("AUTH_RATE_LIMIT", "Too many attempts"),
  });
  app.use("/api/v1/auth/login", authLimiter);
  app.use("/api/v1/auth/register", authLimiter);

  // NoSQL injection prevention
  app.use(mongoSanitize());

  // HTTP Parameter Pollution prevention
  app.use(hpp());

  // Request size limiting
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
}
```

---

## ⚙️ Environment Configuration

### .env File Structure (MANDATORY)

> **CRITICAL: All configuration MUST come from .env file. NEVER hardcode values.**

```bash
# .env - Awali Dashboard Environment Configuration

# ═══════════════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════════════════
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
API_VERSION=v1
API_PREFIX=/api
BASE_URL=http://localhost:5000/api/v1

# ═══════════════════════════════════════════════════════════════════
# MONGODB CONFIGURATION
# ═══════════════════════════════════════════════════════════════════
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/awali_dashboard
MONGODB_DB_NAME=awali_dashboard
MONGODB_POOL_SIZE=10

# ═══════════════════════════════════════════════════════════════════
# JWT AUTHENTICATION
# ═══════════════════════════════════════════════════════════════════
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ═══════════════════════════════════════════════════════════════════
# SECURITY CONFIGURATION
# ═══════════════════════════════════════════════════════════════════
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ═══════════════════════════════════════════════════════════════════
# CLOUDFLARE R2 STORAGE
# ═══════════════════════════════════════════════════════════════════
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=awali-media
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# ═══════════════════════════════════════════════════════════════════
# REDIS CONFIGURATION (Optional - for caching)
# ═══════════════════════════════════════════════════════════════════
REDIS_URL=redis://localhost:6379

# ═══════════════════════════════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════════════════════════════
LOG_LEVEL=debug
```

### Environment Validation with Zod

```typescript
// config/env.ts
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "test", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default("0.0.0.0"),
  API_VERSION: z.string().default("v1"),
  API_PREFIX: z.string().default("/api"),
  BASE_URL: z.string().url().default("http://localhost:5000/api/v1"),

  // MongoDB
  MONGODB_URI: z.string().url("Invalid MongoDB URI"),
  MONGODB_DB_NAME: z.string().min(1).default("awali_dashboard"),
  MONGODB_POOL_SIZE: z.coerce.number().default(10),

  // JWT
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT refresh secret must be at least 32 characters"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(14).default(12),
  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, "Cloudflare Account ID is required"),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1, "R2 Access Key is required"),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z
    .string()
    .min(1, "R2 Secret Key is required"),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1).default("awali-media"),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url("Invalid R2 Public URL"),

  // Redis (optional)
  REDIS_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

// Validate environment variables on startup
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error("❌ Environment validation failed:");
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// ❌ NEVER do this
const API_KEY = "sk_live_xxxx"; // Hardcoded secrets = SECURITY BREACH
```

---

## 📬 Postman Integration Standards

### Phase 3: Professional Postman Documentation

> **CRITICAL: All endpoints MUST be documented in Postman with professional standards**

#### Postman Collection Structure

> **تنظيم أفضل**: كل Resource بيتقسم لـ folders منفصلة - واحدة للـ CRUD وواحدة للـ Query Operations

```
📁 Awali Dashboard API
│
├── 📁 🔐 Authentication
│   ├── 🟢 POST Register - Create New Account
│   ├── 🟢 POST Login - Authenticate User
│   ├── 🟢 POST Refresh Token - Get New Access Token
│   ├── 🟢 POST Logout - End Session
│   ├── 🟢 POST Change Password
│   └── 🔵 GET Me - Get Current User Profile
│
├── 📁 👥 Users
│   ├── 📁 CRUD Operations
│   │   ├── 🔵 GET Get All Users - List with Pagination
│   │   ├── 🔵 GET Get User by ID
│   │   ├── 🟢 POST Create User
│   │   ├── 🟠 PATCH Update User
│   │   ├── 🔴 DELETE Delete User (Soft)
│   │   ├── 🟢 POST Activate User
│   │   └── 🟢 POST Deactivate User
│   └── 📁 Query Operations
│       ├── 🔵 GET Search Users (name, email)
│       ├── 🔵 GET Filter by Role
│       ├── 🔵 GET Filter by Status
│       └── 🔵 GET Advanced Query
│
├── 📁 🛡️ Roles & Permissions
│   ├── 📁 CRUD Operations
│   │   ├── 🔵 GET List Roles
│   │   ├── 🔵 GET Get Role by ID (with permissions)
│   │   ├── 🟢 POST Create Role
│   │   ├── 🟠 PATCH Update Role Permissions
│   │   └── 🔴 DELETE Delete Role
│   └── 📁 Query Operations
│       └── 🔵 GET Filter Active Roles
│
├── 📁 🏢 Units (Properties)
│   ├── 📁 CRUD Operations
│   │   ├── 🔵 GET List Units (Paginated)
│   │   ├── 🔵 GET Get Unit by ID (auto-tracks interest)
│   │   ├── 🟢 POST Create Unit
│   │   ├── 🟠 PATCH Update Unit
│   │   ├── 🔴 DELETE Delete Unit (Soft)
│   │   ├── 🟠 PATCH Change Unit Status
│   │   └── 🟠 PATCH Publish/Unpublish Unit
│   ├── 📁 Media Operations
│   │   ├── 🟢 POST Upload Images → R2
│   │   ├── 🔴 DELETE Delete Image from R2
│   │   ├── 🟠 PATCH Reorder Images
│   │   └── 🟢 POST Upload Document → R2
│   ├── 📁 Query Operations
│   │   ├── 🔵 GET Search Units (unitNumber, description)
│   │   ├── 🔵 GET Filter by Status (available/reserved/sold)
│   │   ├── 🔵 GET Filter by Building Type
│   │   ├── 🔵 GET Filter by Unit Type
│   │   ├── 🔵 GET Filter by Price Range
│   │   ├── 🔵 GET Filter by Bedrooms/Bathrooms
│   │   ├── 🔵 GET Sort by Price (Low-High)
│   │   ├── 🔵 GET Sort by Newest
│   │   └── 🔵 GET Advanced Query (Search+Filter+Sort)
│   └── 📁 Statistics
│       ├── 🔵 GET Unit Statistics (by status)
│       └── 🔵 GET Most Viewed Units
│
├── 📁 🏗️ Building Types
│   ├── 🔵 GET List Building Types
│   ├── 🟢 POST Create Building Type
│   ├── 🟠 PATCH Update Building Type
│   └── 🔴 DELETE Delete Building Type
│
├── 📁 🏠 Unit Types
│   ├── 🔵 GET List Unit Types
│   ├── 🟢 POST Create Unit Type
│   ├── 🟠 PATCH Update Unit Type
│   └── 🔴 DELETE Delete Unit Type
│
├── 📁 ✨ Features (Amenities)
│   ├── 🔵 GET List Features
│   ├── 🟢 POST Create Feature
│   ├── 🟠 PATCH Update Feature
│   └── 🔴 DELETE Delete Feature
│
├── 📁 👤 Clients (CRM Leads)
│   ├── 📁 CRUD Operations
│   │   ├── 🔵 GET List Clients
│   │   ├── 🔵 GET Get Client by ID
│   │   ├── 🟢 POST Create Client
│   │   ├── 🟠 PATCH Update Client
│   │   ├── 🔴 DELETE Delete Client (Soft)
│   │   ├── 🟠 PATCH Change Client Status
│   │   └── 🟠 PATCH Assign Client to Agent
│   ├── 📁 Query Operations
│   │   ├── 🔵 GET Search Clients (name, phone, email)
│   │   ├── 🔵 GET Filter by Status (new/contacted/qualified/won/lost)
│   │   ├── 🔵 GET Filter by Assigned Agent
│   │   └── 🔵 GET Advanced Query
│   └── 📁 Client Intelligence
│       ├── 🔵 GET Client Timeline
│       ├── 🔵 GET Matching Units
│       └── 🔵 GET Client Statistics (funnel)
│
├── 📁 💰 Deals (Pipeline)
│   ├── 📁 CRUD Operations
│   │   ├── 🔵 GET List Deals
│   │   ├── 🔵 GET Get Deal by ID
│   │   ├── 🟢 POST Create Deal
│   │   ├── 🟠 PATCH Update Deal
│   │   ├── 🔴 DELETE Delete Deal (Soft)
│   │   ├── 🟠 PATCH Move Pipeline Stage
│   │   └── 🟢 POST Record Payment
│   ├── 📁 Query Operations
│   │   ├── 🔵 GET Filter by Stage
│   │   ├── 🔵 GET Filter by Value Range
│   │   └── 🔵 GET Advanced Query
│   └── 📁 Pipeline
│       ├── 🔵 GET Pipeline Summary (grouped by stage)
│       └── 🔵 GET Deal Statistics
│
├── 📁 📋 Tasks
│   ├── 🔵 GET List Tasks
│   ├── 🟢 POST Create Task
│   ├── 🟠 PATCH Update Task
│   ├── 🟠 PATCH Mark Complete
│   ├── 🔴 DELETE Delete Task
│   ├── 🔵 GET My Tasks
│   └── 🔵 GET Overdue Tasks
│
├── 📁 📞 Communications
│   ├── 🔵 GET List Communications
│   ├── 🟢 POST Log Communication (call/email/meeting/WhatsApp)
│   └── 🔵 GET Communications by Client
│
├── 📁 📄 Documents
│   ├── 🔵 GET List Documents
│   ├── 🟢 POST Upload Document (metadata + R2)
│   └── 🔴 DELETE Delete Document + R2 Object
│
├── 📁 👁️ Interest Tracking
│   ├── 🔵 GET Most Viewed Units
│   ├── 🔵 GET Most Searched Terms
│   ├── 🔵 GET Trending Units
│   ├── 🔵 GET Interest for Unit
│   └── 🔵 GET Search Filter Heatmap
│
├── 📁 📊 Analytics & Reports
│   ├── 🔵 GET Dashboard KPIs
│   ├── 🔵 GET Sales Analytics
│   ├── 🔵 GET Pipeline Health
│   ├── 🔵 GET Agent Performance
│   ├── 🔵 GET Client Funnel Analytics
│   └── 🔵 GET Unit Status Analytics
│
├── 📁 📝 Audit Logs (Read-Only)
│   ├── 🔵 GET List Audit Logs
│   ├── 🔵 GET Logs for Resource
│   └── 🔵 GET Logs by User
│
└── 📁 🏥 System Health
    ├── 🔵 GET Health Check
    └── 🔵 GET Detailed Health (DB + Redis)
```

#### Folder Naming Convention

| Folder Type      | Icon | Purpose                                |
| ---------------- | ---- | -------------------------------------- |
| CRUD Operations  | 📁   | Create, Read, Update, Delete endpoints |
| Query Operations | 📁   | Search, Filter, Sort, Pagination       |
| Authentication   | 🔐   | Login, Register, Token management      |
| System Health    | 🏥   | Health checks, monitoring              |
| Statistics       | 📊   | Analytics, reports, dashboards         |

#### Creating Collection via MCP

```typescript
// Create Postman collection using MCP
await mcp_postman_create_collection({
  workspaceId: "{{WORKSPACE_ID}}",
  name: "Awali Dashboard API - Complete Documentation",
  description: `
# Awali Dashboard API Documentation

## Overview
Complete REST API for Awali Real Estate CRM & Property Management Dashboard with full CRUD operations, authentication, dynamic RBAC, search, filtering, sorting, and pagination.

## Authentication
All protected endpoints require Bearer token authentication.
Include the token in the Authorization header:
\`Authorization: Bearer {{access_token}}\`

## Base URL
- Development: \`{{base_url}}\` (http://localhost:5000/api/v1)
- Production: \`{{prod_url}}\`

## Response Format
All responses follow a consistent structure:
- Success: \`{ success: true, data: {...}, meta: {...} }\`
- Error: \`{ success: false, error: { code, message, details } }\`

## Pagination
Use query parameters: \`?page=1&limit=20\`

## Sorting
Use sort parameter: \`?sort=-createdAt,unitNumber\` (- prefix for descending)

## Filtering
Use field names as query params: \`?status=available&bedrooms=3\`

## Search
Use search parameter: \`?search=villa\`
  `,
  schema:
    "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
});
```

#### Creating Environment Variables via MCP

```typescript
// Create Postman environment using MCP
await mcp_postman_create_environment({
  workspaceId: "{{WORKSPACE_ID}}",
  name: "Awali Dashboard - Development",
  values: [
    {
      key: "base_url",
      value: "http://localhost:5000/api/v1",
      type: "default",
      enabled: true,
    },
    {
      key: "access_token",
      value: "",
      type: "secret",
      enabled: true,
    },
    {
      key: "refresh_token",
      value: "",
      type: "secret",
      enabled: true,
    },
    {
      key: "user_id",
      value: "",
      type: "default",
      enabled: true,
    },
    {
      key: "admin_token",
      value: "",
      type: "secret",
      enabled: true,
    },
  ],
});
```

#### Professional Endpoint Documentation

Each endpoint MUST include:

```typescript
// Example: List Users endpoint
await mcp_postman_add_request({
  collectionId: "{{COLLECTION_ID}}",
  folderId: "{{USERS_FOLDER_ID}}",
  request: {
    name: "📋 List Users (Paginated)",
    description: `
## Description
Retrieves a paginated list of all users with optional filtering, sorting, and search capabilities.

## Authentication
🔒 **Required**: Bearer Token (Admin or User role)

## Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (starts from 1) |
| limit | number | 20 | Items per page (max: 100) |
| sort | string | -createdAt | Sort fields (prefix with - for desc) |
| search | string | - | Search in name and email fields |
| role | string | - | Filter by role (user/admin) |
| isActive | boolean | - | Filter by active status |

## Example Requests
- Basic: \`GET /users\`
- Paginated: \`GET /users?page=2&limit=10\`
- Sorted: \`GET /users?sort=-createdAt,name\`
- Filtered: \`GET /users?role=admin&isActive=true\`
- Search: \`GET /users?search=john\`
- Combined: \`GET /users?search=john&role=admin&sort=-createdAt&page=1&limit=10\`

## Success Response (200 OK)
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasMore": true
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
\`\`\`

## Error Responses
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
    `,
    method: "GET",
    url: "{{base_url}}/users",
    query: [
      { key: "page", value: "1", description: "Page number" },
      { key: "limit", value: "20", description: "Items per page" },
      { key: "sort", value: "-createdAt", description: "Sort field(s)" },
      {
        key: "search",
        value: "",
        description: "Search keyword",
        disabled: true,
      },
      { key: "role", value: "", description: "Filter by role", disabled: true },
      {
        key: "isActive",
        value: "",
        description: "Filter by status",
        disabled: true,
      },
    ],
    header: [
      { key: "Authorization", value: "Bearer {{access_token}}" },
      { key: "Content-Type", value: "application/json" },
    ],
  },
});
```

#### Required Endpoints for Each Resource

For EACH resource (Units, Clients, Deals, Tasks, etc.), create ALL these endpoints organized in TWO folders:

```
📁 [Resource Name]
│
├── 📁 CRUD Operations (العمليات الأساسية)
│   ├── 🔵 GET List [Resources]              - Get all with basic pagination
│   ├── 🔵 GET Get [Resource] by ID          - Single item by ID
│   ├── 🟢 POST Create [Resource]            - Create new item
│   ├── 🟠 PATCH Update [Resource]           - Partial update (specific fields)
│   └── 🔴 DELETE Delete [Resource]          - Remove item (soft delete)
│
└── 📁 Query Operations (البحث والفلترة والترتيب)
    ├── 🔎 GET Search [Resources]            - Text search (name, description, etc.)
    ├── 🏷️ GET Filter by [Field1]           - Filter by specific field
    ├── 🏷️ GET Filter by [Field2]           - Another filter example
    ├── 🏷️ GET Filter by Date Range         - Filter between dates
    ├── 📊 GET Sort Ascending                - Sort A-Z or oldest first
    ├── 📊 GET Sort Descending               - Sort Z-A or newest first
    ├── 📊 GET Multi-field Sort              - Combined sorting
    └── 🔍 GET Advanced Query                - Search + Filter + Sort + Pagination
```

---

## ⚠️ Error Handling & Observability

### Custom Exception Classes

```typescript
// shared/errors/http.exception.ts
export abstract class BaseException extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

export class BadRequestException extends BaseException {
  readonly statusCode = 400;
  readonly code = "BAD_REQUEST";
}

export class UnauthorizedException extends BaseException {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

export class ForbiddenException extends BaseException {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

export class NotFoundException extends BaseException {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictException extends BaseException {
  readonly statusCode = 409;
  readonly code = "CONFLICT";
}

export class ValidationException extends BaseException {
  readonly statusCode = 422;
  readonly code = "VALIDATION_ERROR";
}

export class RateLimitException extends BaseException {
  readonly statusCode = 429;
  readonly code = "RATE_LIMIT_EXCEEDED";
}

export class InternalServerException extends BaseException {
  readonly statusCode = 500;
  readonly code = "INTERNAL_ERROR";
}
```

### Global Error Handler

```typescript
// shared/middlewares/error.middleware.ts
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const requestId = req.headers["x-request-id"] as string;

  // Known application errors
  if (error instanceof BaseException) {
    logger.warn("Application error", {
      requestId,
      code: error.code,
      message: error.message,
      path: req.path,
    });

    res.status(error.statusCode).json({
      success: false,
      error: error.toJSON(),
      meta: { requestId, timestamp: new Date().toISOString() },
    });
    return;
  }

  // MongoDB errors
  if (error.name === "MongoServerError") {
    const mongoError = error as MongoServerError;
    if (mongoError.code === 11000) {
      res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_KEY", message: "Resource already exists" },
        meta: { requestId, timestamp: new Date().toISOString() },
      });
      return;
    }
  }

  // Unknown errors
  logger.error("Unexpected error", {
    requestId,
    error: error.message,
    stack: error.stack,
  });

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : error.message,
    },
    meta: { requestId, timestamp: new Date().toISOString() },
  });
};
```

---

## 🚀 Performance & Scalability

### Caching with Redis

```typescript
class CacheService {
  private readonly defaultTTL = 3600;

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  }
}
```

### Database Indexing Strategy

```typescript
// ALWAYS create indexes for:
// 1. Fields used in WHERE clauses
// 2. Fields used in ORDER BY
// 3. Fields used in JOIN operations
// 4. Text search fields

// Example: User collection indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ name: "text", email: "text" });
```

---

## 🧪 Testing Standards

### Phase 4: Professional Testing

> **CRITICAL: All endpoints MUST be tested before delivery**

#### Testing Checklist

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         TESTING CHECKLIST                                   │
│                                                                            │
│  □ Authentication Tests                                                    │
│    □ Register with valid data → 201 Created                               │
│    □ Register with duplicate email → 409 Conflict                         │
│    □ Login with valid credentials → 200 OK + tokens                       │
│    □ Login with invalid credentials → 401 Unauthorized                    │
│    □ Access protected route without token → 401 Unauthorized              │
│    □ Access protected route with expired token → 401 Unauthorized         │
│    □ Refresh token → 200 OK + new tokens                                  │
│                                                                            │
│  □ CRUD Tests (for each resource)                                         │
│    □ Create with valid data → 201 Created                                 │
│    □ Create with invalid data → 400 Bad Request                           │
│    □ Get all (paginated) → 200 OK + pagination meta                       │
│    □ Get by ID (exists) → 200 OK                                          │
│    □ Get by ID (not exists) → 404 Not Found                               │
│    □ Update (exists) → 200 OK                                             │
│    □ Update (not exists) → 404 Not Found                                  │
│    □ Delete (exists) → 204 No Content                                     │
│    □ Delete (not exists) → 404 Not Found                                  │
│                                                                            │
│  □ Search, Filter, Sort, Pagination Tests                                 │
│    □ Pagination: ?page=1&limit=10 → Correct page/limit                    │
│    □ Pagination: Last page → hasMore: false                               │
│    □ Sort ascending: ?sort=name → A-Z order                               │
│    □ Sort descending: ?sort=-createdAt → Newest first                     │
│    □ Multi-sort: ?sort=-createdAt,name → Combined sort                    │
│    □ Filter single: ?role=admin → Only admins                             │
│    □ Filter multiple: ?role=admin&isActive=true → Combined                │
│    □ Search: ?search=john → Matching results                              │
│    □ Combined: All params together → Correct results                      │
│                                                                            │
│  □ Error Handling Tests                                                    │
│    □ Invalid MongoDB ID format → 400 Bad Request                          │
│    □ Missing required fields → 400 Bad Request                            │
│    □ Rate limit exceeded → 429 Too Many Requests                          │
│                                                                            │
│  □ Response Format Tests                                                   │
│    □ Success response has: success, data, meta                            │
│    □ Error response has: success, error.code, error.message               │
│    □ Paginated response has: pagination meta                              │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Automated Testing via Postman

```typescript
// Add test scripts to Postman requests
// Example: List Users test script

pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
  const response = pm.response.json();
  pm.expect(response.success).to.be.true;
  pm.expect(response.data).to.be.an("array");
  pm.expect(response.meta.pagination).to.exist;
});

pm.test("Pagination meta is correct", function () {
  const { pagination } = pm.response.json().meta;
  pm.expect(pagination.page).to.be.a("number");
  pm.expect(pagination.limit).to.be.a("number");
  pm.expect(pagination.total).to.be.a("number");
  pm.expect(pagination.totalPages).to.be.a("number");
  pm.expect(pagination.hasMore).to.be.a("boolean");
});

pm.test("Response time is acceptable", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## 🏭 Production Checklist

### Pre-Deployment Verification

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION READINESS CHECKLIST                        │
│                                                                            │
│  □ Environment Configuration                                               │
│    □ All .env variables configured for production                         │
│    □ Secrets are not hardcoded anywhere                                   │
│    □ NODE_ENV=production                                                  │
│    □ CORS origins properly configured                                     │
│                                                                            │
│  □ Security                                                                │
│    □ Helmet middleware enabled                                            │
│    □ Rate limiting configured                                             │
│    □ Input validation on all endpoints                                    │
│    □ NoSQL injection prevention enabled                                   │
│    □ JWT secrets are strong (32+ chars)                                   │
│    □ HTTPS enforced                                                       │
│                                                                            │
│  □ Database                                                                │
│    □ Connection pooling configured                                        │
│    □ Indexes created for all query fields                                 │
│    □ Compound indexes for common queries                                  │
│    □ Text indexes for search fields                                       │
│                                                                            │
│  □ Performance                                                             │
│    □ Response compression enabled                                         │
│    □ Caching strategy implemented                                         │
│    □ Query optimization reviewed                                          │
│                                                                            │
│  □ Monitoring                                                              │
│    □ Health check endpoint (/health)                                      │
│    □ Structured logging configured                                        │
│    □ Error tracking enabled                                               │
│    □ Request logging middleware                                           │
│                                                                            │
│  □ Documentation                                                           │
│    □ Postman collection complete                                          │
│    □ All endpoints documented                                             │
│    □ Environment variables documented                                     │
│    □ API versioning implemented                                           │
│                                                                            │
│  □ Testing                                                                 │
│    □ All endpoints tested successfully                                    │
│    □ Error scenarios tested                                               │
│    □ Edge cases covered                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

### Health Check Endpoint

```typescript
// Always implement a health check
router.get("/health", async (req, res) => {
  try {
    // Check MongoDB
    await mongoose.connection.db.admin().ping();

    // Check Redis (if used)
    if (redis) await redis.ping();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

### Graceful Shutdown

```typescript
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");

  server.close(async () => {
    await mongoose.connection.close();
    if (redis) await redis.quit();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error("Forced shutdown");
    process.exit(1);
  }, 30000);
});
```

---

## 🎯 Quick Reference

### HTTP Status Codes

| Code | Name              | Usage                      |
| ---- | ----------------- | -------------------------- |
| 200  | OK                | Successful GET, PUT, PATCH |
| 201  | Created           | Successful POST            |
| 204  | No Content        | Successful DELETE          |
| 400  | Bad Request       | Validation failed          |
| 401  | Unauthorized      | Not authenticated          |
| 403  | Forbidden         | No permission              |
| 404  | Not Found         | Resource doesn't exist     |
| 409  | Conflict          | Duplicate resource         |
| 422  | Unprocessable     | Business logic error       |
| 429  | Too Many Requests | Rate limit exceeded        |
| 500  | Internal Error    | Server error               |

### Common Query Parameters

| Parameter   | Example                 | Description     |
| ----------- | ----------------------- | --------------- |
| page        | `?page=2`               | Page number     |
| limit       | `?limit=20`             | Items per page  |
| sort        | `?sort=-createdAt,name` | Sort fields     |
| search      | `?search=john`          | Text search     |
| fields      | `?fields=id,name,email` | Field selection |
| [field]     | `?role=admin`           | Filter by field |
| [field][op] | `?price[gte]=100`       | Operator filter |

---

> **Final Note**: The Awali Dashboard backend must be enterprise-grade — built to survive failure, scale with traffic, protect user data at all costs, and be professionally documented for seamless team collaboration. Every module follows Clean Architecture, Dynamic RBAC, and full audit trail compliance.

---

_Document Version: 2.0.0 — Awali Real Estate Dashboard_
_Last Updated: January 2026_
