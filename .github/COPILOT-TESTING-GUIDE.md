# 🧪 Awali Dashboard — Chief Test Engineer Instructions

> **Enterprise-Grade Testing Guidelines for the Awali Real Estate CRM & Property Management Backend**
>
> Node.js 20 LTS · Express.js 4.18 · TypeScript 5.4 · Jest 29 · Supertest · mongodb-memory-server
>
> Complete instructions for building robust, comprehensive test suites that ensure production-ready code quality with full coverage of unit, integration, and end-to-end testing across all 17 Awali modules.

---

## ⚠️ CRITICAL: TESTING PHILOSOPHY

### 🎯 The Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  ← Few, slow, expensive
                    │    (10%)    │
                    ├─────────────┤
                    │ Integration │  ← Medium amount
                    │   Tests     │
                    │   (30%)     │
                    ├─────────────┤
                    │             │
                    │    Unit     │  ← Many, fast, cheap
                    │   Tests     │
                    │   (60%)     │
                    └─────────────┘
```

### 🚨 NON-NEGOTIABLE TESTING RULES

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MANDATORY TESTING REQUIREMENTS                    │
│                                                                     │
│  ✅ Every service method MUST have unit tests                       │
│  ✅ Every API endpoint MUST have integration tests                  │
│  ✅ Every error path MUST be tested                                 │
│  ✅ Authentication & RBAC authorization MUST be thoroughly tested   │
│  ✅ Edge cases and boundary conditions MUST be covered              │
│  ✅ Database operations MUST be tested with in-memory DB            │
│  ✅ All mocks MUST be properly typed                                │
│  ✅ Test coverage MUST be >= 80%                                    │
│  ✅ Cloudflare R2 operations MUST be mocked                        │
│  ✅ Interest tracking & audit log side effects MUST be tested       │
│                                                                     │
│  ❌ NEVER skip error handling tests                                 │
│  ❌ NEVER use `any` type in tests                                   │
│  ❌ NEVER leave console.log in test files                           │
│  ❌ NEVER test implementation details, test behavior                │
│  ❌ NEVER hardcode role names — test dynamic RBAC                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table of Contents

1. [Testing Philosophy](#-critical-testing-philosophy)
2. [Testing Stack](#-testing-stack)
3. [Project Test Structure](#-project-test-structure)
4. [Test Configuration](#-test-configuration)
5. [Writing Unit Tests](#-writing-unit-tests)
6. [Writing Integration Tests](#-writing-integration-tests)
7. [Test Factories & Fixtures](#-test-factories--fixtures)
8. [Mocking Strategies](#-mocking-strategies)
9. [Database Testing](#-database-testing)
10. [API Testing Patterns](#-api-testing-patterns)
11. [Authentication & RBAC Testing](#-authentication--rbac-testing)
12. [Cloudflare R2 Media Testing](#-cloudflare-r2-media-testing)
13. [CRM Pipeline Testing](#-crm-pipeline-testing)
14. [Interest Tracking & Audit Log Testing](#-interest-tracking--audit-log-testing)
15. [Error Handling Tests](#-error-handling-tests)
16. [Performance Testing](#-performance-testing)
17. [Test Coverage Requirements](#-test-coverage-requirements)
18. [CI/CD Integration](#-cicd-integration)

---

## 🛠️ Testing Stack

### Required Dependencies

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",
    "mongodb-memory-server": "^9.1.6",
    "jest-mock-extended": "^3.0.5",
    "@faker-js/faker": "^8.4.1"
  }
}
```

### Why This Stack?

| Tool                      | Purpose                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| **Jest**                  | Full-featured testing framework with assertions, mocking, coverage |
| **ts-jest**               | TypeScript preprocessor for Jest                                   |
| **Supertest**             | HTTP assertions for API integration testing                        |
| **mongodb-memory-server** | In-memory MongoDB for isolated database tests                      |
| **jest-mock-extended**    | Type-safe mocking with TypeScript support                          |
| **@faker-js/faker**       | Generate realistic test data                                       |

---

## 📁 Project Test Structure

```
src/
├── __tests__/                    # Global test utilities
│   ├── setup.ts                  # Global test setup
│   ├── teardown.ts               # Global test teardown
│   ├── helpers/
│   │   ├── test-server.ts        # Test Express app setup
│   │   ├── test-db.ts            # MongoDB memory server setup
│   │   ├── auth-helper.ts        # Authentication & role test helpers
│   │   └── request-helper.ts     # HTTP request helpers
│   ├── factories/
│   │   ├── user.factory.ts       # User test data factory
│   │   ├── role.factory.ts       # Role & permissions factory
│   │   ├── unit.factory.ts       # Unit (property) test data factory
│   │   ├── building-type.factory.ts  # Building type factory
│   │   ├── unit-type.factory.ts  # Unit type factory
│   │   ├── feature.factory.ts    # Feature/amenity factory
│   │   ├── client.factory.ts     # Client (CRM lead) factory
│   │   ├── deal.factory.ts       # Deal (pipeline) factory
│   │   ├── task.factory.ts       # Task factory
│   │   ├── communication.factory.ts  # Communication log factory
│   │   └── index.ts              # Factory exports
│   └── mocks/
│       ├── services.mock.ts      # Service mocks
│       ├── r2.mock.ts            # Cloudflare R2 mocks
│       └── middleware.mock.ts    # Middleware mocks
│
├── modules/
│   ├── auth/
│   │   └── __tests__/
│   │       ├── auth.service.test.ts      # Unit tests
│   │       ├── auth.controller.test.ts   # Unit tests
│   │       └── auth.routes.test.ts       # Integration tests
│   ├── users/
│   │   └── __tests__/
│   │       ├── user.service.test.ts
│   │       ├── user.controller.test.ts
│   │       └── user.routes.test.ts
│   ├── roles/
│   │   └── __tests__/
│   │       ├── role.service.test.ts
│   │       ├── role.controller.test.ts
│   │       └── role.routes.test.ts
│   ├── units/
│   │   └── __tests__/
│   │       ├── unit.service.test.ts
│   │       ├── unit.controller.test.ts
│   │       └── unit.routes.test.ts
│   ├── building-types/
│   │   └── __tests__/
│   │       ├── building-type.service.test.ts
│   │       └── building-type.routes.test.ts
│   ├── unit-types/
│   │   └── __tests__/
│   │       ├── unit-type.service.test.ts
│   │       └── unit-type.routes.test.ts
│   ├── features/
│   │   └── __tests__/
│   │       ├── feature.service.test.ts
│   │       └── feature.routes.test.ts
│   ├── clients/
│   │   └── __tests__/
│   │       ├── client.service.test.ts
│   │       ├── client.controller.test.ts
│   │       └── client.routes.test.ts
│   ├── deals/
│   │   └── __tests__/
│   │       ├── deal.service.test.ts
│   │       ├── deal.controller.test.ts
│   │       └── deal.routes.test.ts
│   ├── tasks/
│   │   └── __tests__/
│   │       ├── task.service.test.ts
│   │       └── task.routes.test.ts
│   ├── activities/
│   │   └── __tests__/
│   │       └── activity.routes.test.ts
│   ├── communications/
│   │   └── __tests__/
│   │       └── communication.routes.test.ts
│   ├── documents/
│   │   └── __tests__/
│   │       └── document.routes.test.ts
│   ├── media/
│   │   └── __tests__/
│   │       ├── media.service.test.ts     # R2 upload/delete tests
│   │       └── media.routes.test.ts
│   ├── interest-tracking/
│   │   └── __tests__/
│   │       ├── interest.service.test.ts
│   │       └── interest.routes.test.ts
│   ├── analytics/
│   │   └── __tests__/
│   │       └── analytics.routes.test.ts
│   └── audit-logs/
│       └── __tests__/
│           ├── audit-log.service.test.ts
│           └── audit-log.routes.test.ts
```

---

## ⚙️ Test Configuration

### jest.config.ts

```typescript
import type { Config } from "jest";

const config: Config = {
  // Use ts-jest for TypeScript support
  preset: "ts-jest",
  testEnvironment: "node",

  // Root directory
  rootDir: ".",

  // Test file patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.ts",
    "<rootDir>/src/**/*.test.ts",
  ],

  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Module resolution (match tsconfig paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  globalTeardown: "<rootDir>/src/__tests__/teardown.ts",

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/server.ts",
    "!src/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Performance
  maxWorkers: "50%",
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,
};

export default config;
```

### .env.test

```bash
# Test environment variables
NODE_ENV=test
PORT=5001
BASE_URL=http://localhost:5001/api/v1

MONGODB_URI=mongodb://localhost:27017/awali_test
MONGODB_DB_NAME=awali_test

JWT_SECRET=test-jwt-secret-that-is-at-least-32-characters-long
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=test-refresh-secret-that-is-at-least-32-chars
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_ROUNDS=4

CLOUDFLARE_ACCOUNT_ID=test-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=test-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=test-secret-key
CLOUDFLARE_R2_BUCKET_NAME=awali-media-test
CLOUDFLARE_R2_PUBLIC_URL=https://test.r2.dev

CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

LOG_LEVEL=error
```

---

## 🔬 Writing Unit Tests

### Unit Test Principles

```typescript
// ✅ GOOD: Test one thing, descriptive name, AAA pattern
describe("UnitService", () => {
  describe("findById", () => {
    it("should return a unit with populated building type and features", async () => {
      // Arrange
      const buildingType = await BuildingTypeFactory.create();
      const unit = await UnitFactory.create({ buildingType: buildingType._id });

      // Act
      const result = await unitService.findById(unit._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.unitNumber).toBe(unit.unitNumber);
      expect(result.buildingType).toBeDefined();
    });

    it("should throw NotFoundException when unit does not exist", async () => {
      // Arrange
      const fakeId = new Types.ObjectId().toString();

      // Act & Assert
      await expect(unitService.findById(fakeId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### Service Unit Test Template

```typescript
import { UnitService } from "../unit.service";
import { Unit } from "../unit.model";
import { UnitFactory } from "../../../__tests__/factories/unit.factory";
import { NotFoundException, ConflictException } from "../../../shared/errors";

// Mock dependencies
jest.mock("../unit.model");
jest.mock("../../interest-tracking/interest.service");
jest.mock("../../../shared/utils/logger");

describe("UnitService", () => {
  let unitService: UnitService;

  beforeEach(() => {
    jest.clearAllMocks();
    unitService = new UnitService();
  });

  describe("create", () => {
    const validInput = {
      unitNumber: "A-101",
      buildingType: new Types.ObjectId().toString(),
      unitType: new Types.ObjectId().toString(),
      status: "available" as const,
      price: { amount: 500000, currency: "SAR" },
      bedrooms: 3,
      bathrooms: 2,
      floor: 1,
    };

    it("should successfully create a new unit", async () => {
      // Arrange
      (Unit.findOne as jest.Mock).mockResolvedValue(null);
      (Unit.create as jest.Mock).mockResolvedValue(
        UnitFactory.build(validInput),
      );

      // Act
      const result = await unitService.create(validInput, "userId");

      // Assert
      expect(result.unitNumber).toBe(validInput.unitNumber);
      expect(result.status).toBe("available");
    });

    it("should throw ConflictException if unitNumber already exists", async () => {
      // Arrange
      (Unit.findOne as jest.Mock).mockResolvedValue(UnitFactory.build());

      // Act & Assert
      await expect(unitService.create(validInput, "userId")).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("updateStatus", () => {
    it("should update unit status from available to reserved", async () => {
      // Arrange
      const unit = UnitFactory.build({ status: "available" });
      (Unit.findById as jest.Mock).mockResolvedValue(unit);

      // Act
      const result = await unitService.updateStatus(
        unit._id.toString(),
        "reserved",
        "userId",
      );

      // Assert
      expect(result.status).toBe("reserved");
    });

    it("should throw error when trying to sell a unit that is not reserved", async () => {
      // Arrange
      const unit = UnitFactory.build({ status: "available" });
      (Unit.findById as jest.Mock).mockResolvedValue(unit);

      // Act & Assert
      await expect(
        unitService.updateStatus(unit._id.toString(), "sold", "userId"),
      ).rejects.toThrow();
    });
  });
});
```

---

## 🔗 Writing Integration Tests

### API Integration Test Template

```typescript
import request from "supertest";
import { createApp } from "../../../app";
import { TestDatabase } from "../../__tests__/helpers/test-db";
import { UserFactory } from "../../__tests__/factories/user.factory";
import { RoleFactory } from "../../__tests__/factories/role.factory";
import { UnitFactory } from "../../__tests__/factories/unit.factory";
import { BuildingTypeFactory } from "../../__tests__/factories/building-type.factory";
import { UnitTypeFactory } from "../../__tests__/factories/unit-type.factory";
import { createAuthToken } from "../../__tests__/helpers/auth-helper";

describe("Unit Routes Integration", () => {
  let app: Express.Application;
  let adminToken: string;
  let agentToken: string;

  beforeAll(async () => {
    await TestDatabase.connect();
    app = createApp();
  });

  afterAll(async () => {
    await TestDatabase.disconnect();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase();

    // Setup roles
    const adminRole = await RoleFactory.createSuperAdmin();
    const agentRole = await RoleFactory.createAgent();

    // Setup users
    const admin = await UserFactory.create({ role: adminRole._id });
    const agent = await UserFactory.create({ role: agentRole._id });

    adminToken = createAuthToken(admin, adminRole);
    agentToken = createAuthToken(agent, agentRole);
  });

  describe("GET /api/v1/units", () => {
    it("should return paginated units list", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.createMany(25, {
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .get("/api/v1/units?page=1&limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(10);
      expect(response.body.meta.pagination.total).toBe(25);
      expect(response.body.meta.pagination.hasMore).toBe(true);
    });

    it("should filter units by status", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.createMany(5, {
        status: "available",
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.createMany(3, {
        status: "sold",
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .get("/api/v1/units?status=available")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      response.body.data.forEach((unit: any) => {
        expect(unit.status).toBe("available");
      });
    });

    it("should search units by unitNumber", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.create({
        unitNumber: "VILLA-001",
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.create({
        unitNumber: "APT-002",
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .get("/api/v1/units?search=VILLA")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should sort units by price descending", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.create({
        price: { amount: 100000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.create({
        price: { amount: 500000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.create({
        price: { amount: 300000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .get("/api/v1/units?sort=-price.amount")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const prices = response.body.data.map((u: any) => u.price.amount);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it("should filter units by price range", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.create({
        price: { amount: 200000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.create({
        price: { amount: 400000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });
      await UnitFactory.create({
        price: { amount: 600000, currency: "SAR" },
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .get("/api/v1/units?price.amount[gte]=300000&price.amount[lte]=500000")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].price.amount).toBe(400000);
    });

    it("should return 401 without authentication", async () => {
      await request(app).get("/api/v1/units").expect(401);
    });
  });

  describe("POST /api/v1/units", () => {
    it("should create a new unit", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();

      const payload = {
        unitNumber: "A-101",
        buildingType: buildingType._id.toString(),
        unitType: unitType._id.toString(),
        price: { amount: 500000, currency: "SAR" },
        bedrooms: 3,
        bathrooms: 2,
        floor: 1,
        facade: "north",
        area: { totalArea: 200, unit: "sqm" },
        description: { en: "Luxury apartment", ar: "شقة فاخرة" },
      };

      const response = await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unitNumber).toBe("A-101");
      expect(response.body.data.status).toBe("available");
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ unitNumber: "A-101" }) // Missing buildingType, unitType, price
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should return 409 for duplicate unitNumber", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      await UnitFactory.create({
        unitNumber: "A-101",
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      const response = await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          unitNumber: "A-101",
          buildingType: buildingType._id.toString(),
          unitType: unitType._id.toString(),
          price: { amount: 500000, currency: "SAR" },
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/v1/units/:id", () => {
    it("should soft-delete a unit", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      const unit = await UnitFactory.create({
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      await request(app)
        .delete(`/api/v1/units/${unit._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);

      // Verify the unit is soft-deleted (not returned in list)
      const listResponse = await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(
        listResponse.body.data.find((u: any) => u.id === unit._id.toString()),
      ).toBeUndefined();
    });
  });
});
```

---

## 🏭 Test Factories & Fixtures

### User Factory

```typescript
// __tests__/factories/user.factory.ts
import { faker } from "@faker-js/faker";
import { User, type IUser } from "../../modules/users/user.model";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

interface IUserOverrides {
  email?: string;
  password?: string;
  name?: string;
  role?: Types.ObjectId;
  isActive?: boolean;
}

export class UserFactory {
  static build(overrides: IUserOverrides = {}): Partial<IUser> {
    return {
      _id: new Types.ObjectId(),
      email: overrides.email ?? faker.internet.email().toLowerCase(),
      password: overrides.password ?? "SecurePassword123!",
      name: overrides.name ?? faker.person.fullName(),
      role: overrides.role ?? new Types.ObjectId(),
      isActive: overrides.isActive ?? true,
    };
  }

  static async create(overrides: IUserOverrides = {}): Promise<IUser> {
    const userData = this.build(overrides);
    const hashedPassword = await bcrypt.hash(userData.password!, 4); // Low rounds for tests
    return User.create({ ...userData, password: hashedPassword });
  }

  static async createMany(
    count: number,
    overrides: IUserOverrides = {},
  ): Promise<IUser[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides)),
    );
  }
}
```

### Role Factory

```typescript
// __tests__/factories/role.factory.ts
import { Role, type IRole } from "../../modules/roles/role.model";
import { PERMISSION_MODULES } from "../../shared/constants/permissions";

export class RoleFactory {
  /**
   * Create a super admin role with ALL permissions
   */
  static async createSuperAdmin(): Promise<IRole> {
    const permissions: Record<
      string,
      { create: boolean; read: boolean; update: boolean; delete: boolean }
    > = {};
    PERMISSION_MODULES.forEach((mod) => {
      permissions[mod] = {
        create: true,
        read: true,
        update: true,
        delete: true,
      };
    });

    return Role.create({
      nameEn: "Super Admin",
      nameAr: "مدير عام",
      permissions,
      isSystem: true,
      isActive: true,
    });
  }

  /**
   * Create an agent role with limited permissions
   */
  static async createAgent(): Promise<IRole> {
    return Role.create({
      nameEn: "Sales Agent",
      nameAr: "وكيل مبيعات",
      permissions: {
        units: { create: false, read: true, update: false, delete: false },
        clients: { create: true, read: true, update: true, delete: false },
        deals: { create: true, read: true, update: true, delete: false },
        tasks: { create: true, read: true, update: true, delete: true },
        communications: {
          create: true,
          read: true,
          update: false,
          delete: false,
        },
      },
      isSystem: false,
      isActive: true,
    });
  }

  /**
   * Create a viewer role with read-only permissions
   */
  static async createViewer(): Promise<IRole> {
    const permissions: Record<
      string,
      { create: boolean; read: boolean; update: boolean; delete: boolean }
    > = {};
    PERMISSION_MODULES.forEach((mod) => {
      permissions[mod] = {
        create: false,
        read: true,
        update: false,
        delete: false,
      };
    });

    return Role.create({
      nameEn: "Viewer",
      nameAr: "مشاهد",
      permissions,
      isSystem: false,
      isActive: true,
    });
  }

  /**
   * Create a custom role with specific permissions
   */
  static async createCustom(
    nameEn: string,
    permissions: Record<
      string,
      { create: boolean; read: boolean; update: boolean; delete: boolean }
    >,
  ): Promise<IRole> {
    return Role.create({
      nameEn,
      nameAr: nameEn,
      permissions,
      isSystem: false,
      isActive: true,
    });
  }
}
```

### Unit Factory

```typescript
// __tests__/factories/unit.factory.ts
import { faker } from "@faker-js/faker";
import { Unit, type IUnit } from "../../modules/units/unit.model";
import { Types } from "mongoose";

interface IUnitOverrides {
  unitNumber?: string;
  buildingType?: Types.ObjectId;
  unitType?: Types.ObjectId;
  features?: Types.ObjectId[];
  status?: "available" | "reserved" | "sold";
  price?: { amount: number; currency: string };
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  facade?: string;
  isPublished?: boolean;
  isDeleted?: boolean;
  createdBy?: Types.ObjectId;
}

export class UnitFactory {
  static build(overrides: IUnitOverrides = {}): Partial<IUnit> {
    return {
      _id: new Types.ObjectId(),
      unitNumber:
        overrides.unitNumber ??
        `UNIT-${faker.number.int({ min: 100, max: 999 })}`,
      buildingType: overrides.buildingType ?? new Types.ObjectId(),
      unitType: overrides.unitType ?? new Types.ObjectId(),
      features: overrides.features ?? [],
      status: overrides.status ?? "available",
      price: overrides.price ?? {
        amount: faker.number.int({ min: 100000, max: 2000000 }),
        currency: "SAR",
      },
      area: {
        totalArea: faker.number.int({ min: 80, max: 500 }),
        unit: "sqm",
      },
      bedrooms: overrides.bedrooms ?? faker.number.int({ min: 1, max: 6 }),
      bathrooms: overrides.bathrooms ?? faker.number.int({ min: 1, max: 4 }),
      floor: overrides.floor ?? faker.number.int({ min: 0, max: 30 }),
      facade:
        overrides.facade ??
        faker.helpers.arrayElement(["north", "south", "east", "west"]),
      description: {
        en: faker.lorem.paragraph(),
        ar: "وصف عربي تجريبي",
      },
      images: [],
      documents: [],
      isPublished: overrides.isPublished ?? true,
      isDeleted: overrides.isDeleted ?? false,
      createdBy: overrides.createdBy ?? new Types.ObjectId(),
    };
  }

  static async create(overrides: IUnitOverrides = {}): Promise<IUnit> {
    return Unit.create(this.build(overrides));
  }

  static async createMany(
    count: number,
    overrides: IUnitOverrides = {},
  ): Promise<IUnit[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides)),
    );
  }
}
```

### Client Factory

```typescript
// __tests__/factories/client.factory.ts
import { faker } from "@faker-js/faker";
import { Client, type IClient } from "../../modules/clients/client.model";
import { Types } from "mongoose";

interface IClientOverrides {
  name?: string;
  email?: string;
  phone?: string;
  status?: "new" | "contacted" | "qualified" | "negotiation" | "won" | "lost";
  source?: string;
  assignedTo?: Types.ObjectId;
  budget?: { min: number; max: number; currency: string };
}

export class ClientFactory {
  static build(overrides: IClientOverrides = {}): Partial<IClient> {
    return {
      _id: new Types.ObjectId(),
      name: overrides.name ?? faker.person.fullName(),
      email: overrides.email ?? faker.internet.email().toLowerCase(),
      phone: overrides.phone ?? faker.phone.number("+966#########"),
      status: overrides.status ?? "new",
      source:
        overrides.source ??
        faker.helpers.arrayElement([
          "website",
          "referral",
          "walk-in",
          "social_media",
        ]),
      assignedTo: overrides.assignedTo ?? new Types.ObjectId(),
      budget: overrides.budget ?? {
        min: 200000,
        max: 500000,
        currency: "SAR",
      },
      preferences: {
        bedrooms: faker.number.int({ min: 1, max: 5 }),
        bathrooms: faker.number.int({ min: 1, max: 3 }),
      },
      isDeleted: false,
    };
  }

  static async create(overrides: IClientOverrides = {}): Promise<IClient> {
    return Client.create(this.build(overrides));
  }

  static async createMany(
    count: number,
    overrides: IClientOverrides = {},
  ): Promise<IClient[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides)),
    );
  }
}
```

### Deal Factory

```typescript
// __tests__/factories/deal.factory.ts
import { faker } from "@faker-js/faker";
import { Deal, type IDeal } from "../../modules/deals/deal.model";
import { Types } from "mongoose";

interface IDealOverrides {
  client?: Types.ObjectId;
  unit?: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  stage?:
    | "lead"
    | "meeting"
    | "proposal"
    | "negotiation"
    | "contract"
    | "closed_won"
    | "closed_lost";
  value?: number;
}

export class DealFactory {
  static build(overrides: IDealOverrides = {}): Partial<IDeal> {
    return {
      _id: new Types.ObjectId(),
      client: overrides.client ?? new Types.ObjectId(),
      unit: overrides.unit ?? new Types.ObjectId(),
      assignedTo: overrides.assignedTo ?? new Types.ObjectId(),
      stage: overrides.stage ?? "lead",
      value: overrides.value ?? faker.number.int({ min: 100000, max: 2000000 }),
      currency: "SAR",
      probability: 10,
      expectedCloseDate: faker.date.future(),
      isDeleted: false,
    };
  }

  static async create(overrides: IDealOverrides = {}): Promise<IDeal> {
    return Deal.create(this.build(overrides));
  }

  static async createMany(
    count: number,
    overrides: IDealOverrides = {},
  ): Promise<IDeal[]> {
    return Promise.all(
      Array.from({ length: count }, () => this.create(overrides)),
    );
  }
}
```

### Building Type, Unit Type & Feature Factories

```typescript
// __tests__/factories/building-type.factory.ts
import {
  BuildingType,
  type IBuildingType,
} from "../../modules/building-types/building-type.model";
import { faker } from "@faker-js/faker";

export class BuildingTypeFactory {
  static async create(
    overrides: Partial<IBuildingType> = {},
  ): Promise<IBuildingType> {
    return BuildingType.create({
      nameEn:
        overrides.nameEn ??
        faker.helpers.arrayElement([
          "Residential Tower",
          "Villa Compound",
          "Commercial Complex",
        ]) + ` ${faker.number.int(99)}`,
      nameAr: overrides.nameAr ?? `نوع مبنى ${faker.number.int(99)}`,
      isActive: overrides.isActive ?? true,
      order: overrides.order ?? 0,
    });
  }
}

// __tests__/factories/unit-type.factory.ts
import {
  UnitType,
  type IUnitType,
} from "../../modules/unit-types/unit-type.model";
import { faker } from "@faker-js/faker";

export class UnitTypeFactory {
  static async create(overrides: Partial<IUnitType> = {}): Promise<IUnitType> {
    return UnitType.create({
      nameEn:
        overrides.nameEn ??
        faker.helpers.arrayElement([
          "Apartment",
          "Villa",
          "Penthouse",
          "Studio",
        ]) + ` ${faker.number.int(99)}`,
      nameAr: overrides.nameAr ?? `نوع وحدة ${faker.number.int(99)}`,
      isActive: overrides.isActive ?? true,
      order: overrides.order ?? 0,
    });
  }
}

// __tests__/factories/feature.factory.ts
import { Feature, type IFeature } from "../../modules/features/feature.model";
import { faker } from "@faker-js/faker";

export class FeatureFactory {
  static async create(overrides: Partial<IFeature> = {}): Promise<IFeature> {
    return Feature.create({
      nameEn:
        overrides.nameEn ??
        faker.helpers.arrayElement([
          "Swimming Pool",
          "Gym",
          "Parking",
          "Garden",
        ]) + ` ${faker.number.int(99)}`,
      nameAr: overrides.nameAr ?? `ميزة ${faker.number.int(99)}`,
      isActive: overrides.isActive ?? true,
      order: overrides.order ?? 0,
    });
  }
}
```

---

## 🎭 Mocking Strategies

### Type-Safe Mocking with jest-mock-extended

```typescript
import { mock, mockDeep, mockReset } from "jest-mock-extended";
import type { IUnit } from "../unit.model";

// Create type-safe mock
const mockUnit = mock<IUnit>();
mockUnit.unitNumber = "A-101";
mockUnit.status = "available";

// Deep mock for nested objects
const mockUnitDeep = mockDeep<IUnit>();
```

### Mocking Cloudflare R2

```typescript
// __tests__/mocks/r2.mock.ts
export const mockR2Client = {
  send: jest.fn().mockResolvedValue({}),
};

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: jest.fn(() => mockR2Client),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest
    .fn()
    .mockResolvedValue("https://signed-url.example.com/file"),
}));
```

### Mocking Mongoose Models

```typescript
// Proper mongoose model mocking for Awali
jest.mock("../unit.model", () => ({
  Unit: {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  },
}));
```

### Mocking Interest Service (Non-Blocking)

```typescript
// Interest tracking is fire-and-forget — mock to verify it's called
jest.mock("../../modules/interest-tracking/interest.service", () => ({
  InterestService: {
    logView: jest.fn().mockResolvedValue(undefined),
    logSearch: jest.fn().mockResolvedValue(undefined),
  },
}));
```

### Mocking Audit Log Service

```typescript
jest.mock("../../modules/audit-logs/audit-log.service", () => ({
  AuditLogService: {
    create: jest.fn().mockResolvedValue(undefined),
  },
}));
```

---

## 💾 Database Testing

### MongoDB Memory Server Setup

```typescript
// __tests__/helpers/test-db.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

export class TestDatabase {
  private static mongod: MongoMemoryServer;

  static async connect(): Promise<void> {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    await mongoose.connect(uri, { maxPoolSize: 10 });
  }

  static async disconnect(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongod.stop();
  }

  static async clearDatabase(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  static async clearCollection(collectionName: string): Promise<void> {
    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
  }
}
```

### Test Setup File

```typescript
// __tests__/setup.ts
import { TestDatabase } from "./helpers/test-db";

jest.setTimeout(30000);

// Mock environment variables for Awali
process.env.NODE_ENV = "test";
process.env.PORT = "5001";
process.env.BASE_URL = "http://localhost:5001/api/v1";
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-refresh-secret-that-is-at-least-32-chars";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.BCRYPT_ROUNDS = "4"; // Low rounds for faster tests
process.env.CLOUDFLARE_ACCOUNT_ID = "test-account-id";
process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = "test-access-key";
process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.CLOUDFLARE_R2_BUCKET_NAME = "awali-media-test";
process.env.CLOUDFLARE_R2_PUBLIC_URL = "https://test.r2.dev";

// Suppress console during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

beforeAll(async () => {
  await TestDatabase.connect();
});

afterAll(async () => {
  await TestDatabase.disconnect();
});

afterEach(async () => {
  await TestDatabase.clearDatabase();
});
```

---

## 🌐 API Testing Patterns

### Testing Pagination

```typescript
describe("Pagination", () => {
  beforeEach(async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    await UnitFactory.createMany(25, {
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
  });

  it("should return paginated results with default limit", async () => {
    const response = await request(app)
      .get("/api/v1/units")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(20); // default limit
    expect(response.body.meta.pagination.total).toBe(25);
    expect(response.body.meta.pagination.page).toBe(1);
    expect(response.body.meta.pagination.hasMore).toBe(true);
  });

  it("should return correct page with custom limit", async () => {
    const response = await request(app)
      .get("/api/v1/units?page=2&limit=10")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(10);
    expect(response.body.meta.pagination.page).toBe(2);
  });

  it("should return empty data for page beyond total", async () => {
    const response = await request(app)
      .get("/api/v1/units?page=100&limit=10")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data).toHaveLength(0);
    expect(response.body.meta.pagination.hasMore).toBe(false);
  });
});
```

### Testing Input Validation

```typescript
describe("Unit Input Validation", () => {
  const validPayload = {
    unitNumber: "A-101",
    buildingType: new Types.ObjectId().toString(),
    unitType: new Types.ObjectId().toString(),
    price: { amount: 500000, currency: "SAR" },
    bedrooms: 3,
    bathrooms: 2,
  };

  it.each([
    ["missing unitNumber", { ...validPayload, unitNumber: undefined }],
    ["missing buildingType", { ...validPayload, buildingType: undefined }],
    ["missing price", { ...validPayload, price: undefined }],
    [
      "invalid buildingType ID",
      { ...validPayload, buildingType: "invalid-id" },
    ],
    [
      "negative price",
      {
        ...validPayload,
        price: { amount: -100, currency: "SAR" },
      },
    ],
    ["invalid status", { ...validPayload, status: "unknown" }],
  ])("should return 400 for %s", async (_, payload) => {
    const response = await request(app)
      .post("/api/v1/units")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(payload)
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

### Testing Bilingual Lookup CRUD

```typescript
describe("Building Types CRUD", () => {
  it("should create a building type with bilingual names", async () => {
    const response = await request(app)
      .post("/api/v1/building-types")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nameEn: "Residential Tower", nameAr: "برج سكني" })
      .expect(201);

    expect(response.body.data.nameEn).toBe("Residential Tower");
    expect(response.body.data.nameAr).toBe("برج سكني");
  });

  it("should return 409 for duplicate nameEn", async () => {
    await BuildingTypeFactory.create({ nameEn: "Villa" });

    await request(app)
      .post("/api/v1/building-types")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nameEn: "Villa", nameAr: "فيلا جديدة" })
      .expect(409);
  });

  it("should prevent deletion when referenced by units", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    await request(app)
      .delete(`/api/v1/building-types/${buildingType._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(409); // Conflict — has references
  });
});
```

---

## 🔐 Authentication & RBAC Testing

### Auth Helper

```typescript
// __tests__/helpers/auth-helper.ts
import jwt from "jsonwebtoken";
import type { IUser } from "../../modules/users/user.model";
import type { IRole } from "../../modules/roles/role.model";

export function createAuthToken(user: IUser, role: IRole): string {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: {
      _id: role._id.toString(),
      nameEn: role.nameEn,
      permissions: role.permissions,
      isSystem: role.isSystem,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
}

export function createExpiredToken(user: IUser, role: IRole): string {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: {
      _id: role._id.toString(),
      permissions: role.permissions,
      isSystem: role.isSystem,
    },
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "-1h",
  });
}

export function createInvalidToken(): string {
  return "invalid.token.here";
}
```

### Dynamic RBAC Permission Tests

```typescript
describe("Dynamic RBAC Authorization", () => {
  let app: Express.Application;
  let adminToken: string;
  let agentToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    await TestDatabase.clearDatabase();

    const adminRole = await RoleFactory.createSuperAdmin();
    const agentRole = await RoleFactory.createAgent();
    const viewerRole = await RoleFactory.createViewer();

    const admin = await UserFactory.create({
      role: adminRole._id,
    });
    const agent = await UserFactory.create({
      role: agentRole._id,
    });
    const viewer = await UserFactory.create({
      role: viewerRole._id,
    });

    adminToken = createAuthToken(admin, adminRole);
    agentToken = createAuthToken(agent, agentRole);
    viewerToken = createAuthToken(viewer, viewerRole);
  });

  describe("Unit Permissions", () => {
    it("should allow admin to create units (admin has units.create)", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();

      await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          unitNumber: "A-101",
          buildingType: buildingType._id.toString(),
          unitType: unitType._id.toString(),
          price: { amount: 500000, currency: "SAR" },
        })
        .expect(201);
    });

    it("should deny agent from creating units (agent lacks units.create)", async () => {
      await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ unitNumber: "A-101" })
        .expect(403);
    });

    it("should allow agent to read units (agent has units.read)", async () => {
      await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${agentToken}`)
        .expect(200);
    });

    it("should allow viewer to read units (viewer has units.read)", async () => {
      await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${viewerToken}`)
        .expect(200);
    });

    it("should deny viewer from updating units (viewer lacks units.update)", async () => {
      const buildingType = await BuildingTypeFactory.create();
      const unitType = await UnitTypeFactory.create();
      const unit = await UnitFactory.create({
        buildingType: buildingType._id,
        unitType: unitType._id,
      });

      await request(app)
        .patch(`/api/v1/units/${unit._id}`)
        .set("Authorization", `Bearer ${viewerToken}`)
        .send({ bedrooms: 5 })
        .expect(403);
    });
  });

  describe("Client Permissions", () => {
    it("should allow agent to create clients (agent has clients.create)", async () => {
      await request(app)
        .post("/api/v1/clients")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          name: "Ahmed Ali",
          email: "ahmed@example.com",
          phone: "+966501234567",
        })
        .expect(201);
    });

    it("should deny agent from deleting clients (agent lacks clients.delete)", async () => {
      const client = await ClientFactory.create();

      await request(app)
        .delete(`/api/v1/clients/${client._id}`)
        .set("Authorization", `Bearer ${agentToken}`)
        .expect(403);
    });
  });

  describe("Custom Role Permissions", () => {
    it("should respect dynamically created role permissions", async () => {
      // Create a custom role that can only read units and manage tasks
      const customRole = await RoleFactory.createCustom("Task Manager", {
        units: {
          create: false,
          read: true,
          update: false,
          delete: false,
        },
        tasks: {
          create: true,
          read: true,
          update: true,
          delete: true,
        },
      });

      const customUser = await UserFactory.create({
        role: customRole._id,
      });
      const customToken = createAuthToken(customUser, customRole);

      // Can read units
      await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${customToken}`)
        .expect(200);

      // Cannot create units
      await request(app)
        .post("/api/v1/units")
        .set("Authorization", `Bearer ${customToken}`)
        .send({ unitNumber: "A-101" })
        .expect(403);

      // Can create tasks
      await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${customToken}`)
        .send({
          title: "Follow up",
          dueDate: new Date(),
        })
        .expect(201);
    });
  });
});

describe("Authentication Flow", () => {
  describe("Token Refresh Flow", () => {
    it("should refresh tokens with valid refresh token", async () => {
      const role = await RoleFactory.createAgent();
      const user = await UserFactory.create({
        role: role._id,
        password: "Password123!",
      });

      // Login first
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "Password123!",
      });

      const { refreshToken } = loginRes.body.data.tokens;

      // Use refresh token
      const refreshRes = await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      expect(refreshRes.body.data.tokens.refreshToken).toBeDefined();
    });

    it("should reject expired refresh token", async () => {
      await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "expired-token" })
        .expect(401);
    });
  });

  describe("Logout Flow", () => {
    it("should invalidate refresh token on logout", async () => {
      const role = await RoleFactory.createAgent();
      const user = await UserFactory.create({
        role: role._id,
        password: "Password123!",
      });

      // Login
      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "Password123!",
      });

      const { accessToken, refreshToken } = loginRes.body.data.tokens;

      // Logout
      await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // Try to use refresh token again — should fail
      await request(app)
        .post("/api/v1/auth/refresh")
        .send({ refreshToken })
        .expect(401);
    });
  });
});
```

---

## ☁️ Cloudflare R2 Media Testing

### Testing Image Upload to R2

```typescript
import { mockR2Client } from "../../__tests__/mocks/r2.mock";

describe("Unit Image Upload", () => {
  beforeEach(() => {
    mockR2Client.send.mockClear();
  });

  it("should upload images to R2 and return URLs", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    const response = await request(app)
      .post(`/api/v1/units/${unit._id}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("images", Buffer.from("fake-image-data"), {
        filename: "test.jpg",
        contentType: "image/jpeg",
      })
      .expect(200);

    expect(response.body.data.images).toHaveLength(1);
    expect(response.body.data.images[0].url).toContain("https://");
    expect(response.body.data.images[0].key).toBeDefined();
    expect(mockR2Client.send).toHaveBeenCalledTimes(1);
  });

  it("should reject non-image files", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    await request(app)
      .post(`/api/v1/units/${unit._id}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("images", Buffer.from("fake-exe"), {
        filename: "virus.exe",
        contentType: "application/x-msdownload",
      })
      .expect(400);
  });

  it("should reject images exceeding 10MB", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

    await request(app)
      .post(`/api/v1/units/${unit._id}/images`)
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("images", largeBuffer, {
        filename: "large.jpg",
        contentType: "image/jpeg",
      })
      .expect(400);
  });

  it("should delete image from R2 when removed from unit", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    // Add an image first
    unit.images.push({
      url: "https://test.r2.dev/img.jpg",
      key: "units/img.jpg",
      order: 0,
      isPrimary: true,
    });
    await unit.save();

    await request(app)
      .delete(`/api/v1/units/${unit._id}/images/${unit.images[0]._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Verify R2 delete was called
    expect(mockR2Client.send).toHaveBeenCalled();
  });
});
```

---

## 💼 CRM Pipeline Testing

### Deal Pipeline Stage Transitions

```typescript
describe("Deal Pipeline", () => {
  it("should move deal through pipeline stages with auto-probability", async () => {
    const client = await ClientFactory.create();
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
    const deal = await DealFactory.create({
      client: client._id,
      unit: unit._id,
      stage: "lead",
    });

    // Move to meeting stage
    const res1 = await request(app)
      .patch(`/api/v1/deals/${deal._id}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "meeting" })
      .expect(200);

    expect(res1.body.data.stage).toBe("meeting");
    expect(res1.body.data.probability).toBe(30); // Auto-set by stage

    // Move to negotiation
    const res2 = await request(app)
      .patch(`/api/v1/deals/${deal._id}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "negotiation" })
      .expect(200);

    expect(res2.body.data.probability).toBe(60);
  });

  it("should auto-update unit status to 'reserved' when deal reaches contract stage", async () => {
    const client = await ClientFactory.create();
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      status: "available",
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
    const deal = await DealFactory.create({
      client: client._id,
      unit: unit._id,
      stage: "negotiation",
    });

    await request(app)
      .patch(`/api/v1/deals/${deal._id}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "contract" })
      .expect(200);

    // Verify unit status was auto-updated
    const unitResponse = await request(app)
      .get(`/api/v1/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(unitResponse.body.data.status).toBe("reserved");
  });

  it("should auto-update unit status to 'sold' when deal is closed-won", async () => {
    const client = await ClientFactory.create();
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      status: "reserved",
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
    const deal = await DealFactory.create({
      client: client._id,
      unit: unit._id,
      stage: "contract",
    });

    await request(app)
      .patch(`/api/v1/deals/${deal._id}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "closed_won" })
      .expect(200);

    const unitResponse = await request(app)
      .get(`/api/v1/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(unitResponse.body.data.status).toBe("sold");
  });

  it("should return pipeline summary grouped by stage", async () => {
    await DealFactory.createMany(3, { stage: "lead" });
    await DealFactory.createMany(2, { stage: "meeting" });
    await DealFactory.createMany(1, { stage: "contract" });

    const response = await request(app)
      .get("/api/v1/deals/pipeline")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data.lead.count).toBe(3);
    expect(response.body.data.meeting.count).toBe(2);
    expect(response.body.data.contract.count).toBe(1);
  });
});

describe("Client Status Transitions", () => {
  it("should transition client status through funnel", async () => {
    const client = await ClientFactory.create({ status: "new" });

    // new → contacted
    await request(app)
      .patch(`/api/v1/clients/${client._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "contacted" })
      .expect(200);

    // contacted → qualified
    await request(app)
      .patch(`/api/v1/clients/${client._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "qualified" })
      .expect(200);
  });

  it("should auto-log activity when client status changes", async () => {
    const client = await ClientFactory.create({ status: "new" });

    await request(app)
      .patch(`/api/v1/clients/${client._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "contacted" })
      .expect(200);

    // Verify an activity was logged
    const activities = await request(app)
      .get(`/api/v1/clients/${client._id}/timeline`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(activities.body.data.length).toBeGreaterThan(0);
  });
});
```

---

## 👁️ Interest Tracking & Audit Log Testing

### Interest Tracking Tests

```typescript
describe("Interest Tracking", () => {
  it("should auto-track unit view when GET /units/:id is called", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    await request(app)
      .get(`/api/v1/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Wait for non-blocking interest log
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify interest was logged
    const interestResponse = await request(app)
      .get(`/api/v1/interest/unit/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(interestResponse.body.data.viewCount).toBeGreaterThanOrEqual(1);
  });

  it("should auto-track search queries on GET /units?search=", async () => {
    await request(app)
      .get("/api/v1/units?search=villa")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const searchResponse = await request(app)
      .get("/api/v1/interest/most-searched")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(searchResponse.body.data.length).toBeGreaterThanOrEqual(0);
  });

  it("should return most viewed units", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit1 = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });
    const unit2 = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    // View unit1 multiple times
    for (let i = 0; i < 5; i++) {
      await request(app)
        .get(`/api/v1/units/${unit1._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    }

    // View unit2 once
    await request(app)
      .get(`/api/v1/units/${unit2._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const response = await request(app)
      .get("/api/v1/interest/most-viewed")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // unit1 should have more views
    if (response.body.data.length >= 2) {
      expect(response.body.data[0].viewCount).toBeGreaterThanOrEqual(
        response.body.data[1].viewCount,
      );
    }
  });
});
```

### Audit Log Tests

```typescript
describe("Audit Logging", () => {
  it("should create audit log on unit creation", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();

    await request(app)
      .post("/api/v1/units")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        unitNumber: "AUDIT-001",
        buildingType: buildingType._id.toString(),
        unitType: unitType._id.toString(),
        price: { amount: 500000, currency: "SAR" },
      })
      .expect(201);

    // Check audit log
    const auditResponse = await request(app)
      .get("/api/v1/audit-logs?resourceType=units&action=create")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(auditResponse.body.data.length).toBeGreaterThanOrEqual(1);
    const log = auditResponse.body.data[0];
    expect(log.action).toBe("create");
    expect(log.resourceType).toBe("units");
    expect(log.after).toBeDefined();
    expect(log.before).toBeNull();
  });

  it("should capture before/after snapshot on unit update", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
      bedrooms: 2,
    });

    await request(app)
      .patch(`/api/v1/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ bedrooms: 4 })
      .expect(200);

    const auditResponse = await request(app)
      .get(`/api/v1/audit-logs/resource/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const updateLog = auditResponse.body.data.find(
      (l: any) => l.action === "update",
    );
    expect(updateLog).toBeDefined();
    expect(updateLog.before.bedrooms).toBe(2);
    expect(updateLog.after.bedrooms).toBe(4);
  });

  it("should record audit log on soft delete", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const unit = await UnitFactory.create({
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    await request(app)
      .delete(`/api/v1/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(204);

    const auditResponse = await request(app)
      .get(`/api/v1/audit-logs/resource/units/${unit._id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const deleteLog = auditResponse.body.data.find(
      (l: any) => l.action === "delete",
    );
    expect(deleteLog).toBeDefined();
    expect(deleteLog.before).toBeDefined();
  });

  it("should be immutable — audit logs cannot be updated or deleted", async () => {
    const auditResponse = await request(app)
      .get("/api/v1/audit-logs")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    if (auditResponse.body.data.length > 0) {
      const logId = auditResponse.body.data[0].id;

      // Attempt to delete — should be 405 or 404
      await request(app)
        .delete(`/api/v1/audit-logs/${logId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect((res) => {
          expect([404, 405]).toContain(res.status);
        });
    }
  });
});
```

---

## ❌ Error Handling Tests

### Testing Error Scenarios

```typescript
describe("Error Handling", () => {
  describe("404 Not Found", () => {
    it("should return 404 for non-existent route", async () => {
      const response = await request(app)
        .get("/api/v1/non-existent-route")
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent unit", async () => {
      const fakeId = new Types.ObjectId();

      await request(app)
        .get(`/api/v1/units/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("400 Bad Request", () => {
    it("should return 400 for invalid MongoDB ID format", async () => {
      await request(app)
        .get("/api/v1/units/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);
    });

    it("should return detailed validation errors", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "invalid", password: "123" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
    });
  });

  describe("Response Format Consistency", () => {
    it("should always return success: true for 2xx responses", async () => {
      const response = await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.meta).toBeDefined();
    });

    it("should always return success: false for error responses", async () => {
      const response = await request(app)
        .get("/api/v1/units/invalid-id")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBeDefined();
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe("Rate Limiting", () => {
    it("should enforce rate limits on auth endpoints", async () => {
      const requests = Array.from({ length: 15 }, () =>
        request(app).post("/api/v1/auth/login").send({}),
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe("Database Errors", () => {
    it("should handle database connection errors gracefully", async () => {
      await mongoose.connection.close();

      const response = await request(app)
        .get("/api/v1/units")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);

      // Reconnect for other tests
      await TestDatabase.connect();
    });
  });
});
```

---

## ⚡ Performance Testing

### Basic Performance Tests

```typescript
describe("Performance", () => {
  it("should respond within 1 second for units list with 100 records", async () => {
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    await UnitFactory.createMany(100, {
      buildingType: buildingType._id,
      unitType: unitType._id,
    });

    const startTime = Date.now();

    await request(app)
      .get("/api/v1/units")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  it("should handle concurrent requests", async () => {
    const role = await RoleFactory.createAgent();
    const user = await UserFactory.create({
      role: role._id,
      password: "Password123!",
    });

    const requests = Array.from({ length: 10 }, () =>
      request(app).post("/api/v1/auth/login").send({
        email: user.email,
        password: "Password123!",
      }),
    );

    const responses = await Promise.all(requests);
    const successful = responses.filter((r) => r.status === 200);

    expect(successful.length).toBe(10);
  });

  it("should respond within 500ms for analytics dashboard", async () => {
    const startTime = Date.now();

    await request(app)
      .get("/api/v1/analytics/dashboard")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## 📊 Test Coverage Requirements

### Coverage Thresholds

```typescript
// jest.config.ts
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  // Per-module thresholds for critical modules
  './src/modules/auth/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
  },
  './src/modules/units/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
  },
  './src/modules/deals/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
  },
  './src/modules/clients/**/*.ts': {
    branches: 85,
    functions: 85,
    lines: 85,
  },
  './src/shared/middlewares/**/*.ts': {
    branches: 90,
    functions: 90,
    lines: 90,
  },
},
```

### Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage

# Generate HTML report
npm run test:coverage -- --coverageReporters=html
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Awali Dashboard Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests
        run: npm run test:ci
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/awali_test
          JWT_SECRET: ci-jwt-secret-that-is-at-least-32-characters-long
          JWT_REFRESH_SECRET: ci-refresh-secret-that-is-at-least-32-chars
          CLOUDFLARE_ACCOUNT_ID: ci-test-account
          CLOUDFLARE_R2_ACCESS_KEY_ID: ci-test-key
          CLOUDFLARE_R2_SECRET_ACCESS_KEY: ci-test-secret
          CLOUDFLARE_R2_BUCKET_NAME: awali-media-ci
          CLOUDFLARE_R2_PUBLIC_URL: https://ci-test.r2.dev

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true
```

---

## 📝 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --runInBand",
    "test:unit": "jest --testPathPattern='\\.test\\.ts$' --testPathIgnorePatterns='routes'",
    "test:integration": "jest --testPathPattern='routes\\.test\\.ts$'",
    "test:auth": "jest --testPathPattern='auth.*\\.test\\.ts$'",
    "test:users": "jest --testPathPattern='user.*\\.test\\.ts$'",
    "test:roles": "jest --testPathPattern='role.*\\.test\\.ts$'",
    "test:units": "jest --testPathPattern='unit.*\\.test\\.ts$'",
    "test:clients": "jest --testPathPattern='client.*\\.test\\.ts$'",
    "test:deals": "jest --testPathPattern='deal.*\\.test\\.ts$'",
    "test:tasks": "jest --testPathPattern='task.*\\.test\\.ts$'",
    "test:media": "jest --testPathPattern='media.*\\.test\\.ts$'",
    "test:interest": "jest --testPathPattern='interest.*\\.test\\.ts$'",
    "test:analytics": "jest --testPathPattern='analytics.*\\.test\\.ts$'",
    "test:audit": "jest --testPathPattern='audit.*\\.test\\.ts$'"
  }
}
```

---

## ✅ Test Quality Checklist

Before committing tests, verify:

- [ ] All tests have descriptive names
- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] No hardcoded values that should be configurable
- [ ] Mocks are properly reset between tests
- [ ] Database is cleaned after each test
- [ ] Error scenarios are tested
- [ ] Edge cases are covered (empty arrays, null values, max limits)
- [ ] No console.log statements in test files
- [ ] Tests are not dependent on execution order
- [ ] Async operations are properly awaited
- [ ] Coverage meets minimum thresholds
- [ ] R2 operations are properly mocked (never call real API in tests)
- [ ] RBAC permissions are tested for each role type
- [ ] Interest tracking side effects are verified
- [ ] Audit log entries are verified for write operations
- [ ] Bilingual fields (nameEn/nameAr) are tested

---

## 🔄 E2E Test Workflows

### Full Lead-to-Sale Workflow

```typescript
describe("E2E: Lead to Sale", () => {
  it("should complete full lead-to-sale lifecycle", async () => {
    // 1. Create lookup data
    const buildingType = await BuildingTypeFactory.create();
    const unitType = await UnitTypeFactory.create();
    const feature = await FeatureFactory.create();

    // 2. Create a unit
    const unitRes = await request(app)
      .post("/api/v1/units")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        unitNumber: "E2E-001",
        buildingType: buildingType._id.toString(),
        unitType: unitType._id.toString(),
        features: [feature._id.toString()],
        price: { amount: 750000, currency: "SAR" },
        bedrooms: 3,
        bathrooms: 2,
        floor: 5,
        facade: "north",
      })
      .expect(201);

    const unitId = unitRes.body.data.id;

    // 3. Create a client (lead)
    const clientRes = await request(app)
      .post("/api/v1/clients")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Mohammed Ahmed",
        email: "mohammed@example.com",
        phone: "+966501234567",
        source: "website",
        budget: {
          min: 500000,
          max: 1000000,
          currency: "SAR",
        },
      })
      .expect(201);

    const clientId = clientRes.body.data.id;

    // 4. Create a deal linking client and unit
    const dealRes = await request(app)
      .post("/api/v1/deals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        client: clientId,
        unit: unitId,
        value: 750000,
        stage: "lead",
      })
      .expect(201);

    const dealId = dealRes.body.data.id;

    // 5. Progress through pipeline stages
    for (const stage of [
      "meeting",
      "proposal",
      "negotiation",
      "contract",
      "closed_won",
    ]) {
      await request(app)
        .patch(`/api/v1/deals/${dealId}/stage`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ stage })
        .expect(200);
    }

    // 6. Verify unit is now sold
    const finalUnit = await request(app)
      .get(`/api/v1/units/${unitId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(finalUnit.body.data.status).toBe("sold");

    // 7. Verify audit trail exists
    const auditLogs = await request(app)
      .get(`/api/v1/audit-logs/resource/deals/${dealId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(auditLogs.body.data.length).toBeGreaterThanOrEqual(5); // Multiple stage changes
  });
});
```

---

> **Remember:** Good tests document expected behavior, catch regressions early, and give confidence to refactor. Write tests as if the next developer to read them has no context about the Awali system. Test CRM business rules (pipeline stages, client funnel, interest tracking) just as thoroughly as CRUD operations.

---

_Document Version: 2.0.0 — Awali Real Estate Dashboard_
_Last Updated: January 2026_
