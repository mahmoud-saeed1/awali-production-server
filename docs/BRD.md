# 📋 Business Requirements Document (BRD)

## Awali Real Estate Management & CRM Platform

> **Version:** 1.0.0
> **Date:** March 9, 2026
> **Company:** Awali Real Estate
> **Document Type:** Business Requirements Document
> **Classification:** Confidential

---

## 1. Executive Summary

Awali Real Estate requires a comprehensive, enterprise-grade backend platform to manage its real estate portfolio, customer relationships, and business analytics. The system will serve as the central hub for managing property units (buildings), client interactions, sales pipelines, and operational analytics. The platform must support bilingual operations (Arabic & English), dynamic role-based access control, media management via Cloudflare R2, and a fully-featured CRM system tailored to the Saudi real estate market.

---

## 2. Business Objectives

| #   | Objective                                                    | Priority | Success Metric                          |
| --- | ------------------------------------------------------------ | -------- | --------------------------------------- |
| 1   | Centralized property management with full lifecycle tracking | Critical | 100% of units tracked digitally         |
| 2   | Professional CRM with lead-to-sale pipeline                  | Critical | Measurable conversion funnel            |
| 3   | Dynamic role-based access with granular permissions          | Critical | Zero unauthorized access incidents      |
| 4   | Real-time analytics & interest tracking                      | High     | Dashboard with actionable insights      |
| 5   | Bilingual support (AR/EN) for all content                    | High     | All content available in both languages |
| 6   | Media management (images, videos, PDFs, virtual tours)       | High     | Cloudflare R2 integrated for all assets |
| 7   | Scalable architecture for multi-project expansion            | Medium   | Handle 100x traffic increase            |
| 8   | Audit trail for all critical operations                      | Medium   | Complete action history                 |

---

## 3. System Overview & Architecture

### 3.1 Technology Decision: Express.js (Not NestJS)

After careful evaluation for a **real estate management system** with the following priorities:

| Factor                   | Express.js                              | NestJS                                   |
| ------------------------ | --------------------------------------- | ---------------------------------------- |
| **Performance**          | ✅ Lighter overhead, faster cold starts | ❌ Heavier due to decorators/DI          |
| **Flexibility**          | ✅ Full control over architecture       | ❌ Opinionated structure                 |
| **Ecosystem maturity**   | ✅ 10+ years, battle-tested             | ⚠️ Newer, smaller plugins                |
| **Team ramp-up**         | ✅ Lower learning curve                 | ❌ Requires Angular-like patterns        |
| **Production stability** | ✅ Used by Netflix, Uber, PayPal        | ⚠️ Growing but less proven at mega-scale |
| **Custom CRM needs**     | ✅ Easier to architect custom patterns  | ❌ DI overhead for simple CRUD-heavy ops |

**Decision:** Express.js with a clean, layered architecture (Controller → Service → Repository) providing NestJS-like organization without the framework overhead.

### 3.2 Technology Stack

| Component       | Technology             | Version | Purpose                                       |
| --------------- | ---------------------- | ------- | --------------------------------------------- |
| Runtime         | Node.js                | 20 LTS  | Server runtime                                |
| Framework       | Express.js             | ^4.18   | HTTP framework                                |
| Language        | TypeScript             | ^5.4    | Type safety, strict mode                      |
| Database        | MongoDB Atlas          | 7.x     | Primary data store                            |
| ODM             | Mongoose               | ^8.x    | Schema modeling & validation                  |
| Caching         | Redis                  | ^7.x    | Session cache, rate limiting, analytics cache |
| Media Storage   | Cloudflare R2          | -       | Images, videos, PDFs, documents               |
| Authentication  | JWT (access + refresh) | -       | Stateless auth with token rotation            |
| Validation      | Zod                    | ^3.x    | Runtime schema validation                     |
| Logging         | Winston + Morgan       | -       | Structured logging                            |
| Testing         | Jest + Supertest       | ^29.x   | Unit & integration testing                    |
| API Docs        | Postman (MCP)          | -       | Professional API documentation                |
| Process Manager | PM2                    | -       | Production process management                 |

### 3.3 Base URL Configuration

All API endpoints are served under a configurable base URL:

```
BASE_URL = http://localhost:5000/api/v1    ← Development
BASE_URL = https://api.awali.com/api/v1   ← Production (will be updated)
```

**All endpoints in this document and across the codebase use `{{BASE_URL}}` as a variable.** The actual value is set in the `.env` file and can be changed per environment without code modifications.

---

## 4. Module Breakdown

### 4.1 Module Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AWALI REAL ESTATE PLATFORM                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  🔐 Auth     │  │  👥 Users    │  │  🛡️ Roles &  │                  │
│  │  Module      │  │  Module      │  │  Permissions │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                 │                  │                          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐                 │
│  │              CORE PLATFORM LAYER                   │                 │
│  └──────┬─────────────────┬──────────────────┬───────┘                 │
│         │                 │                  │                          │
│  ┌──────┴───────┐  ┌─────┴────────┐  ┌─────┴────────┐                 │
│  │  🏢 Units    │  │  📁 Dynamic  │  │  📸 Media    │                 │
│  │  (Buildings) │  │  Attributes  │  │  Management  │                 │
│  │  Module      │  │  Module      │  │  Module      │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                  │                          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐                 │
│  │              CRM SYSTEM LAYER                      │                 │
│  └──────┬─────────────────┬──────────────────┬───────┘                 │
│         │                 │                  │                          │
│  ┌──────┴───────┐  ┌─────┴────────┐  ┌─────┴────────┐                 │
│  │  🧑‍💼 Clients │  │  🔄 Pipeline │  │  📋 Tasks &  │                 │
│  │  (Leads)     │  │  & Deals     │  │  Activities  │                 │
│  │  Module      │  │  Module      │  │  Module      │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                  │                          │
│  ┌──────┴───────┐  ┌─────┴────────┐  ┌─────┴────────┐                 │
│  │  📊 Analytics│  │  👁️ Interest │  │  📝 Audit    │                 │
│  │  & Reports  │  │  Tracking    │  │  Log         │                 │
│  │  Module      │  │  Module      │  │  Module      │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐                                    │
│  │  📞 Communi- │  │  📄 Document │                                    │
│  │  cation Log  │  │  Management  │                                    │
│  │  Module      │  │  Module      │                                    │
│  └──────────────┘  └──────────────┘                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Module Specifications

### 5.1 🔐 Authentication Module

**Purpose:** Secure user authentication with JWT access/refresh token rotation.

**Endpoints:**

| Method | Endpoint                            | Description                                | Auth                            |
| ------ | ----------------------------------- | ------------------------------------------ | ------------------------------- |
| POST   | `{{BASE_URL}}/auth/register`        | Register new admin user (super_admin only) | 🔒 Super Admin                  |
| POST   | `{{BASE_URL}}/auth/login`           | Login with email & password                | 🌐 Public                       |
| POST   | `{{BASE_URL}}/auth/refresh`         | Refresh access token                       | 🌐 Public (valid refresh token) |
| POST   | `{{BASE_URL}}/auth/logout`          | Invalidate refresh token                   | 🔒 Authenticated                |
| POST   | `{{BASE_URL}}/auth/change-password` | Change own password                        | 🔒 Authenticated                |
| GET    | `{{BASE_URL}}/auth/me`              | Get current user profile                   | 🔒 Authenticated                |

**Business Rules:**

- Only super_admin can register new users
- Passwords must be min 8 chars with uppercase, lowercase, number, special char
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Failed login attempts tracked (lock after 5 consecutive failures for 30 min)
- All auth events logged to audit trail

---

### 5.2 👥 Users Module

**Purpose:** Manage system users (admins) who operate the platform.

**Collection Schema: `users`**

```json
{
  "_id": "ObjectId",
  "email": "string (unique, lowercase)",
  "password": "string (hashed, never returned)",
  "name": {
    "en": "string",
    "ar": "string"
  },
  "phone": "string",
  "avatar": "string (Cloudflare R2 URL)",
  "role": "ObjectId (ref: roles)",
  "isActive": "boolean (default: true)",
  "lastLoginAt": "Date",
  "failedLoginAttempts": "number (default: 0)",
  "lockedUntil": "Date | null",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                            | Description                            | Permission     |
| ------ | ----------------------------------- | -------------------------------------- | -------------- |
| GET    | `{{BASE_URL}}/users`                | List all users (paginated, filterable) | `users.read`   |
| GET    | `{{BASE_URL}}/users/:id`            | Get user by ID                         | `users.read`   |
| POST   | `{{BASE_URL}}/users`                | Create new user                        | `users.create` |
| PATCH  | `{{BASE_URL}}/users/:id`            | Update user                            | `users.update` |
| DELETE | `{{BASE_URL}}/users/:id`            | Soft delete user                       | `users.delete` |
| POST   | `{{BASE_URL}}/users/:id/activate`   | Activate user                          | `users.update` |
| POST   | `{{BASE_URL}}/users/:id/deactivate` | Deactivate user                        | `users.update` |

---

### 5.3 🛡️ Roles & Permissions Module

**Purpose:** Dynamic role-based access control. Roles are NOT hardcoded — they are fully dynamic and managed via CRUD operations. The `super_admin` role is the only system-protected role.

**Collection Schema: `roles`**

```json
{
  "_id": "ObjectId",
  "nameEn": "string (unique)",
  "nameAr": "string",
  "description": {
    "en": "string",
    "ar": "string"
  },
  "permissions": {
    "users": { "create": true, "read": true, "update": true, "delete": false },
    "roles": {
      "create": false,
      "read": true,
      "update": false,
      "delete": false
    },
    "units": { "create": true, "read": true, "update": true, "delete": false },
    "building_types": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "unit_types": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "features": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "clients": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "deals": { "create": true, "read": true, "update": true, "delete": false },
    "tasks": { "create": true, "read": true, "update": true, "delete": false },
    "activities": {
      "create": true,
      "read": true,
      "update": false,
      "delete": false
    },
    "communications": {
      "create": true,
      "read": true,
      "update": false,
      "delete": false
    },
    "documents": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "analytics": { "read": true },
    "settings": { "read": false, "update": false },
    "audit_logs": { "read": false },
    "media": { "create": true, "read": true, "delete": false }
  },
  "isSystem": "boolean (default: false, true only for super_admin)",
  "isActive": "boolean (default: true)",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Permission Structure:**

- Each module has CRUD flags: `{ create, read, update, delete }`
- Some modules have subset flags (e.g., analytics only has `read`)
- `super_admin` role has ALL permissions and CANNOT be edited or deleted (`isSystem: true`)
- New custom roles can have any combination of permissions

**Endpoints:**

| Method | Endpoint                 | Description                              | Permission     |
| ------ | ------------------------ | ---------------------------------------- | -------------- |
| GET    | `{{BASE_URL}}/roles`     | List all roles                           | `roles.read`   |
| GET    | `{{BASE_URL}}/roles/:id` | Get role by ID with permissions          | `roles.read`   |
| POST   | `{{BASE_URL}}/roles`     | Create new role                          | `roles.create` |
| PATCH  | `{{BASE_URL}}/roles/:id` | Update role & permissions                | `roles.update` |
| DELETE | `{{BASE_URL}}/roles/:id` | Delete role (if not system & not in use) | `roles.delete` |

**Authorization Middleware Flow:**

```
Request → Auth Middleware (JWT verify) → Permission Middleware (check role.permissions[module][action]) → Controller
```

---

### 5.4 🏢 Units (Buildings) Module

**Purpose:** Core module for managing real estate property units with full lifecycle tracking.

**Collection Schema: `units`**

```json
{
  "_id": "ObjectId",
  "unitNumber": "string (unique within project context)",
  "buildingType": "ObjectId (ref: building_types)",
  "unitType": "ObjectId (ref: unit_types)",
  "description": {
    "en": "string",
    "ar": "string"
  },
  "status": "enum: available | reserved | sold | unavailable | maintenance",
  "price": {
    "amount": "number",
    "currency": "string (default: SAR)"
  },
  "area": {
    "plot": "number",
    "built": "number",
    "unit": "enum: sqm | sqft"
  },
  "specifications": {
    "bedrooms": "number",
    "bathrooms": "number",
    "floors": "number"
  },
  "facade": "enum: north | south | east | west | north_east | north_west | south_east | south_west",
  "images": [
    {
      "url": "string (Cloudflare R2 URL)",
      "alt": { "en": "string", "ar": "string" },
      "isPrimary": "boolean",
      "order": "number"
    }
  ],
  "documents": [
    {
      "url": "string (Cloudflare R2 URL)",
      "name": { "en": "string", "ar": "string" },
      "type": "enum: floor_plan | deed | contract | brochure | other",
      "order": "number"
    }
  ],
  "hasVirtualTour": "boolean (default: false)",
  "virtualTourUrl": "string (optional)",
  "publication": {
    "isPublished": "boolean (default: false)",
    "publishedAt": "Date | null"
  },
  "features": [
    {
      "featureId": "ObjectId (ref: features)",
      "value": "boolean | string | number",
      "order": "number"
    }
  ],
  "map": {
    "svgElementId": "string (for interactive map integration)"
  },
  "viewCount": "number (default: 0)",
  "searchCount": "number (default: 0)",
  "createdBy": "ObjectId (ref: users)",
  "updatedBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Status Lifecycle:**

```
available → reserved → sold
    ↓          ↓
unavailable  available (if reservation expires/cancelled)
    ↓
maintenance → available
```

**Endpoints:**

| Method | Endpoint                                  | Description                                    | Permission       |
| ------ | ----------------------------------------- | ---------------------------------------------- | ---------------- |
| GET    | `{{BASE_URL}}/units`                      | List units (paginated, filterable, sortable)   | `units.read`     |
| GET    | `{{BASE_URL}}/units/:id`                  | Get unit by ID (tracks view interest)          | `units.read`     |
| POST   | `{{BASE_URL}}/units`                      | Create new unit                                | `units.create`   |
| PATCH  | `{{BASE_URL}}/units/:id`                  | Update unit                                    | `units.update`   |
| DELETE | `{{BASE_URL}}/units/:id`                  | Soft delete unit                               | `units.delete`   |
| PATCH  | `{{BASE_URL}}/units/:id/status`           | Change unit status                             | `units.update`   |
| PATCH  | `{{BASE_URL}}/units/:id/publish`          | Publish/unpublish unit                         | `units.update`   |
| POST   | `{{BASE_URL}}/units/:id/images`           | Upload images (Cloudflare R2)                  | `units.update`   |
| DELETE | `{{BASE_URL}}/units/:id/images/:imageId`  | Remove image                                   | `units.update`   |
| PATCH  | `{{BASE_URL}}/units/:id/images/reorder`   | Reorder images                                 | `units.update`   |
| POST   | `{{BASE_URL}}/units/:id/documents`        | Upload documents (Cloudflare R2)               | `units.update`   |
| DELETE | `{{BASE_URL}}/units/:id/documents/:docId` | Remove document                                | `units.update`   |
| GET    | `{{BASE_URL}}/units/statistics`           | Unit statistics (counts by status, type, etc.) | `analytics.read` |
| GET    | `{{BASE_URL}}/units/most-viewed`          | Most viewed/searched units                     | `analytics.read` |

**Query Parameters for GET /units:**

| Parameter        | Type     | Example                           | Description                            |
| ---------------- | -------- | --------------------------------- | -------------------------------------- |
| `page`           | number   | `?page=2`                         | Page number (default: 1)               |
| `limit`          | number   | `?limit=20`                       | Items per page (default: 20, max: 100) |
| `sort`           | string   | `?sort=-price.amount`             | Sort field(s), `-` prefix for desc     |
| `search`         | string   | `?search=villa`                   | Text search in description, unitNumber |
| `status`         | string   | `?status=available`               | Filter by status                       |
| `buildingType`   | ObjectId | `?buildingType=65f...`            | Filter by building type                |
| `unitType`       | ObjectId | `?unitType=65f...`                | Filter by unit type                    |
| `facade`         | string   | `?facade=north`                   | Filter by facade direction             |
| `price[gte]`     | number   | `?price[gte]=300000`              | Min price                              |
| `price[lte]`     | number   | `?price[lte]=500000`              | Max price                              |
| `area.plot[gte]` | number   | `?area.plot[gte]=200`             | Min plot area                          |
| `area.plot[lte]` | number   | `?area.plot[lte]=500`             | Max plot area                          |
| `bedrooms`       | number   | `?bedrooms=4`                     | Filter by bedrooms                     |
| `bathrooms`      | number   | `?bathrooms=3`                    | Filter by bathrooms                    |
| `isPublished`    | boolean  | `?isPublished=true`               | Filter published only                  |
| `fields`         | string   | `?fields=unitNumber,price,status` | Field selection                        |

---

### 5.5 📁 Dynamic Attributes Module

**Purpose:** Manage configurable lookup data that units reference. Each attribute type has its own collection with separate CRUD operations.

#### 5.5.1 Building Types

**Collection Schema: `building_types`**

```json
{
  "_id": "ObjectId",
  "nameEn": "string",
  "nameAr": "string",
  "description": { "en": "string", "ar": "string" },
  "icon": "string (optional, Cloudflare R2 URL)",
  "isActive": "boolean (default: true)",
  "order": "number (for display ordering)",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                          | Description                       | Permission              |
| ------ | --------------------------------- | --------------------------------- | ----------------------- |
| GET    | `{{BASE_URL}}/building-types`     | List all building types           | `building_types.read`   |
| GET    | `{{BASE_URL}}/building-types/:id` | Get by ID                         | `building_types.read`   |
| POST   | `{{BASE_URL}}/building-types`     | Create building type              | `building_types.create` |
| PATCH  | `{{BASE_URL}}/building-types/:id` | Update building type              | `building_types.update` |
| DELETE | `{{BASE_URL}}/building-types/:id` | Delete (if no units reference it) | `building_types.delete` |

#### 5.5.2 Unit Types

**Collection Schema: `unit_types`**

```json
{
  "_id": "ObjectId",
  "nameEn": "string",
  "nameAr": "string",
  "description": { "en": "string", "ar": "string" },
  "icon": "string (optional, Cloudflare R2 URL)",
  "isActive": "boolean (default: true)",
  "order": "number",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                      | Description                       | Permission          |
| ------ | ----------------------------- | --------------------------------- | ------------------- |
| GET    | `{{BASE_URL}}/unit-types`     | List all unit types               | `unit_types.read`   |
| GET    | `{{BASE_URL}}/unit-types/:id` | Get by ID                         | `unit_types.read`   |
| POST   | `{{BASE_URL}}/unit-types`     | Create unit type                  | `unit_types.create` |
| PATCH  | `{{BASE_URL}}/unit-types/:id` | Update unit type                  | `unit_types.update` |
| DELETE | `{{BASE_URL}}/unit-types/:id` | Delete (if no units reference it) | `unit_types.delete` |

#### 5.5.3 Features (Amenities/Characteristics)

**Collection Schema: `features`**

```json
{
  "_id": "ObjectId",
  "nameEn": "string",
  "nameAr": "string",
  "category": "enum: amenity | characteristic | facility | service",
  "valueType": "enum: boolean | string | number",
  "icon": "string (optional)",
  "isActive": "boolean (default: true)",
  "order": "number",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                    | Description                       | Permission        |
| ------ | --------------------------- | --------------------------------- | ----------------- |
| GET    | `{{BASE_URL}}/features`     | List all features                 | `features.read`   |
| GET    | `{{BASE_URL}}/features/:id` | Get by ID                         | `features.read`   |
| POST   | `{{BASE_URL}}/features`     | Create feature                    | `features.create` |
| PATCH  | `{{BASE_URL}}/features/:id` | Update feature                    | `features.update` |
| DELETE | `{{BASE_URL}}/features/:id` | Delete (if no units reference it) | `features.delete` |

---

### 5.6 📸 Media Management Module

**Purpose:** Handle all file uploads and management via Cloudflare R2 storage.

**Supported Media:**

- Images: JPEG, PNG, WebP (max 10MB)
- Videos: MP4, MOV (max 100MB)
- Documents: PDF (max 25MB)
- Icons: SVG, PNG (max 2MB)

**Endpoints:**

| Method | Endpoint                             | Description                    | Permission     |
| ------ | ------------------------------------ | ------------------------------ | -------------- |
| POST   | `{{BASE_URL}}/media/upload`          | Upload single file             | `media.create` |
| POST   | `{{BASE_URL}}/media/upload-multiple` | Upload multiple files (max 10) | `media.create` |
| GET    | `{{BASE_URL}}/media/:id`             | Get media metadata             | `media.read`   |
| DELETE | `{{BASE_URL}}/media/:id`             | Delete media from R2           | `media.delete` |

**Upload Response:**

```json
{
  "success": true,
  "data": {
    "id": "ObjectId",
    "url": "https://r2.awali.com/media/units/image-uuid.webp",
    "originalName": "villa-front.jpg",
    "mimeType": "image/webp",
    "size": 245678,
    "folder": "units",
    "uploadedBy": "ObjectId",
    "createdAt": "2026-03-09T10:00:00.000Z"
  }
}
```

---

### 5.7 🧑‍💼 Clients (Leads) Module — CRM Core

**Purpose:** Manage all client/lead data with complete contact history, source tracking, and lifecycle management.

**Collection Schema: `clients`**

```json
{
  "_id": "ObjectId",
  "name": {
    "en": "string",
    "ar": "string"
  },
  "email": "string (optional, unique if provided)",
  "phone": "string (required)",
  "secondaryPhone": "string (optional)",
  "nationalId": "string (optional)",
  "type": "enum: individual | company",
  "companyName": "string (optional, if type is company)",
  "source": "enum: website | phone | walk_in | referral | social_media | advertising | exhibition | other",
  "status": "enum: new | contacted | qualified | negotiation | won | lost | inactive",
  "rating": "enum: hot | warm | cold",
  "assignedTo": "ObjectId (ref: users, the sales agent)",
  "interestedIn": ["ObjectId (ref: units)"],
  "budget": {
    "min": "number",
    "max": "number",
    "currency": "string (default: SAR)"
  },
  "preferences": {
    "buildingTypes": ["ObjectId (ref: building_types)"],
    "unitTypes": ["ObjectId (ref: unit_types)"],
    "minBedrooms": "number",
    "minArea": "number",
    "facades": ["string"],
    "features": ["ObjectId (ref: features)"]
  },
  "notes": "string",
  "tags": ["string"],
  "lastContactDate": "Date",
  "nextFollowUpDate": "Date",
  "lostReason": "string (if status is lost)",
  "createdBy": "ObjectId (ref: users)",
  "updatedBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Client Lifecycle:**

```
new → contacted → qualified → negotiation → won (deal closed)
                                          → lost (with reason)
Any status → inactive
```

**Endpoints:**

| Method | Endpoint                                  | Description                          | Permission       |
| ------ | ----------------------------------------- | ------------------------------------ | ---------------- |
| GET    | `{{BASE_URL}}/clients`                    | List clients (paginated, filterable) | `clients.read`   |
| GET    | `{{BASE_URL}}/clients/:id`                | Get client with full history         | `clients.read`   |
| POST   | `{{BASE_URL}}/clients`                    | Create new client/lead               | `clients.create` |
| PATCH  | `{{BASE_URL}}/clients/:id`                | Update client info                   | `clients.update` |
| DELETE | `{{BASE_URL}}/clients/:id`                | Soft delete client                   | `clients.delete` |
| PATCH  | `{{BASE_URL}}/clients/:id/status`         | Change client status                 | `clients.update` |
| PATCH  | `{{BASE_URL}}/clients/:id/assign`         | Assign to sales agent                | `clients.update` |
| GET    | `{{BASE_URL}}/clients/:id/timeline`       | Full activity timeline               | `clients.read`   |
| GET    | `{{BASE_URL}}/clients/:id/matching-units` | Units matching preferences           | `clients.read`   |
| GET    | `{{BASE_URL}}/clients/statistics`         | Client statistics & funnel           | `analytics.read` |

**Query Parameters for GET /clients:**

| Parameter               | Type     | Example                             | Description               |
| ----------------------- | -------- | ----------------------------------- | ------------------------- |
| `search`                | string   | `?search=Ahmed`                     | Search name, email, phone |
| `status`                | string   | `?status=qualified`                 | Filter by status          |
| `rating`                | string   | `?rating=hot`                       | Filter by rating          |
| `source`                | string   | `?source=website`                   | Filter by lead source     |
| `assignedTo`            | ObjectId | `?assignedTo=65f...`                | Filter by assigned agent  |
| `type`                  | string   | `?type=individual`                  | Filter by client type     |
| `budget[gte]`           | number   | `?budget[gte]=300000`               | Min budget                |
| `budget[lte]`           | number   | `?budget[lte]=500000`               | Max budget                |
| `nextFollowUpDate[lte]` | date     | `?nextFollowUpDate[lte]=2026-03-15` | Overdue follow-ups        |
| `tags`                  | string   | `?tags=vip,returning`               | Filter by tags            |
| `sort`                  | string   | `?sort=-createdAt`                  | Sort field(s)             |

---

### 5.8 🔄 Pipeline & Deals Module — CRM Sales

**Purpose:** Track sales deals from initial interest to closing, with full pipeline management.

**Collection Schema: `deals`**

```json
{
  "_id": "ObjectId",
  "title": "string",
  "client": "ObjectId (ref: clients)",
  "unit": "ObjectId (ref: units)",
  "stage": "enum: inquiry | viewing | negotiation | proposal | contract | closed_won | closed_lost",
  "value": {
    "amount": "number",
    "currency": "string (default: SAR)"
  },
  "probability": "number (0-100, auto-calculated based on stage)",
  "expectedCloseDate": "Date",
  "actualCloseDate": "Date (set when closed)",
  "assignedTo": "ObjectId (ref: users)",
  "notes": "string",
  "lostReason": "string (if closed_lost)",
  "payments": [
    {
      "amount": "number",
      "date": "Date",
      "method": "enum: cash | bank_transfer | cheque | credit_card",
      "reference": "string",
      "notes": "string"
    }
  ],
  "documents": ["ObjectId (ref: media)"],
  "createdBy": "ObjectId (ref: users)",
  "updatedBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Deal Pipeline Stages & Auto-Probability:**

| Stage       | Probability | Description                          |
| ----------- | ----------- | ------------------------------------ |
| inquiry     | 10%         | Initial interest expressed           |
| viewing     | 25%         | Property viewing scheduled/completed |
| negotiation | 50%         | Active price/terms negotiation       |
| proposal    | 70%         | Formal offer submitted               |
| contract    | 90%         | Contract being drafted/signed        |
| closed_won  | 100%        | Deal completed, unit sold            |
| closed_lost | 0%          | Deal lost                            |

**Endpoints:**

| Method | Endpoint                          | Description                         | Permission       |
| ------ | --------------------------------- | ----------------------------------- | ---------------- |
| GET    | `{{BASE_URL}}/deals`              | List deals (pipeline view)          | `deals.read`     |
| GET    | `{{BASE_URL}}/deals/:id`          | Get deal details                    | `deals.read`     |
| POST   | `{{BASE_URL}}/deals`              | Create new deal                     | `deals.create`   |
| PATCH  | `{{BASE_URL}}/deals/:id`          | Update deal                         | `deals.update`   |
| DELETE | `{{BASE_URL}}/deals/:id`          | Soft delete deal                    | `deals.delete`   |
| PATCH  | `{{BASE_URL}}/deals/:id/stage`    | Move deal to new stage              | `deals.update`   |
| POST   | `{{BASE_URL}}/deals/:id/payments` | Record payment                      | `deals.update`   |
| GET    | `{{BASE_URL}}/deals/pipeline`     | Pipeline summary (grouped by stage) | `deals.read`     |
| GET    | `{{BASE_URL}}/deals/statistics`   | Deal statistics & forecasting       | `analytics.read` |

**Business Rules:**

- When deal moves to `closed_won`: unit status → `sold`, client status → `won`
- When deal moves to `closed_lost`: unit status → `available` (if was reserved), client status → `lost`
- Moving to `contract` stage: unit status → `reserved`
- Only one active deal per unit (non-closed)

---

### 5.9 📋 Tasks & Activities Module — CRM Operations

**Purpose:** Track all tasks, follow-ups, and activities related to clients and deals.

#### 5.9.1 Tasks

**Collection Schema: `tasks`**

```json
{
  "_id": "ObjectId",
  "title": { "en": "string", "ar": "string" },
  "description": "string",
  "type": "enum: follow_up | meeting | call | viewing | document_request | other",
  "priority": "enum: low | medium | high | urgent",
  "status": "enum: pending | in_progress | completed | cancelled | overdue",
  "dueDate": "Date",
  "completedAt": "Date (optional)",
  "assignedTo": "ObjectId (ref: users)",
  "relatedClient": "ObjectId (ref: clients, optional)",
  "relatedDeal": "ObjectId (ref: deals, optional)",
  "relatedUnit": "ObjectId (ref: units, optional)",
  "reminderDate": "Date (optional)",
  "notes": "string",
  "createdBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                          | Description                                           | Permission     |
| ------ | --------------------------------- | ----------------------------------------------------- | -------------- |
| GET    | `{{BASE_URL}}/tasks`              | List tasks (filterable by assignee, status, priority) | `tasks.read`   |
| GET    | `{{BASE_URL}}/tasks/:id`          | Get task details                                      | `tasks.read`   |
| POST   | `{{BASE_URL}}/tasks`              | Create task                                           | `tasks.create` |
| PATCH  | `{{BASE_URL}}/tasks/:id`          | Update task                                           | `tasks.update` |
| DELETE | `{{BASE_URL}}/tasks/:id`          | Delete task                                           | `tasks.delete` |
| PATCH  | `{{BASE_URL}}/tasks/:id/complete` | Mark task complete                                    | `tasks.update` |
| GET    | `{{BASE_URL}}/tasks/my-tasks`     | Get current user's tasks                              | `tasks.read`   |
| GET    | `{{BASE_URL}}/tasks/overdue`      | Get overdue tasks                                     | `tasks.read`   |

#### 5.9.2 Activities (Auto-logged)

**Collection Schema: `activities`**

```json
{
  "_id": "ObjectId",
  "type": "enum: call | email | meeting | note | status_change | deal_update | document_upload | viewing | system",
  "description": "string",
  "metadata": "object (flexible, depends on type)",
  "client": "ObjectId (ref: clients, optional)",
  "deal": "ObjectId (ref: deals, optional)",
  "unit": "ObjectId (ref: units, optional)",
  "performedBy": "ObjectId (ref: users)",
  "createdAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                                   | Description             | Permission          |
| ------ | ------------------------------------------ | ----------------------- | ------------------- |
| GET    | `{{BASE_URL}}/activities`                  | List all activities     | `activities.read`   |
| POST   | `{{BASE_URL}}/activities`                  | Log manual activity     | `activities.create` |
| GET    | `{{BASE_URL}}/activities/client/:clientId` | Activities for a client | `activities.read`   |
| GET    | `{{BASE_URL}}/activities/deal/:dealId`     | Activities for a deal   | `activities.read`   |

**Auto-logging triggers:**

- Client status change → activity logged
- Deal stage change → activity logged
- Task completion → activity logged
- Document upload → activity logged
- Unit status change → activity logged

---

### 5.10 📞 Communication Log Module — CRM Communication

**Purpose:** Track all communications (calls, emails, meetings, WhatsApp) with clients.

**Collection Schema: `communications`**

```json
{
  "_id": "ObjectId",
  "client": "ObjectId (ref: clients)",
  "type": "enum: phone_call | email | whatsapp | meeting | sms | other",
  "direction": "enum: inbound | outbound",
  "subject": "string",
  "content": "string",
  "duration": "number (minutes, for calls/meetings)",
  "outcome": "enum: successful | no_answer | voicemail | callback_requested | not_interested | follow_up_needed",
  "nextAction": "string (optional)",
  "nextActionDate": "Date (optional)",
  "relatedDeal": "ObjectId (ref: deals, optional)",
  "attachments": ["ObjectId (ref: media)"],
  "performedBy": "ObjectId (ref: users)",
  "createdAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                                       | Description               | Permission              |
| ------ | ---------------------------------------------- | ------------------------- | ----------------------- |
| GET    | `{{BASE_URL}}/communications`                  | List communications       | `communications.read`   |
| POST   | `{{BASE_URL}}/communications`                  | Log communication         | `communications.create` |
| GET    | `{{BASE_URL}}/communications/client/:clientId` | Communications for client | `communications.read`   |
| GET    | `{{BASE_URL}}/communications/statistics`       | Communication stats       | `analytics.read`        |

---

### 5.11 📄 Document Management Module

**Purpose:** Manage all documents related to deals, clients, and units.

**Collection Schema: `documents_metadata`**

```json
{
  "_id": "ObjectId",
  "name": { "en": "string", "ar": "string" },
  "type": "enum: contract | deed | id_copy | floor_plan | proposal | invoice | receipt | other",
  "url": "string (Cloudflare R2 URL)",
  "mimeType": "string",
  "size": "number (bytes)",
  "relatedClient": "ObjectId (ref: clients, optional)",
  "relatedDeal": "ObjectId (ref: deals, optional)",
  "relatedUnit": "ObjectId (ref: units, optional)",
  "tags": ["string"],
  "uploadedBy": "ObjectId (ref: users)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                     | Description                 | Permission         |
| ------ | ---------------------------- | --------------------------- | ------------------ |
| GET    | `{{BASE_URL}}/documents`     | List documents (filterable) | `documents.read`   |
| GET    | `{{BASE_URL}}/documents/:id` | Get document metadata       | `documents.read`   |
| POST   | `{{BASE_URL}}/documents`     | Upload document             | `documents.create` |
| PATCH  | `{{BASE_URL}}/documents/:id` | Update metadata             | `documents.update` |
| DELETE | `{{BASE_URL}}/documents/:id` | Delete document             | `documents.delete` |

---

### 5.12 👁️ Interest Tracking Module

**Purpose:** Track which units generate the most interest (views, searches) to provide actionable business intelligence.

**Collection Schema: `interest_logs`**

```json
{
  "_id": "ObjectId",
  "type": "enum: view | search | inquiry | share | favorite",
  "unit": "ObjectId (ref: units, optional, for view/favorite)",
  "searchQuery": "string (optional, for search type)",
  "searchFilters": "object (optional, captured search parameters)",
  "ipAddress": "string (hashed for privacy)",
  "userAgent": "string",
  "userId": "ObjectId (ref: users, optional)",
  "sessionId": "string",
  "referrer": "string (optional)",
  "duration": "number (seconds on page, optional)",
  "createdAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                              | Description                                  | Permission       |
| ------ | ------------------------------------- | -------------------------------------------- | ---------------- |
| GET    | `{{BASE_URL}}/interest/most-viewed`   | Most viewed units (daily/weekly/monthly/all) | `analytics.read` |
| GET    | `{{BASE_URL}}/interest/most-searched` | Most searched terms & filters                | `analytics.read` |
| GET    | `{{BASE_URL}}/interest/trending`      | Trending units (rising interest)             | `analytics.read` |
| GET    | `{{BASE_URL}}/interest/unit/:unitId`  | Interest history for specific unit           | `analytics.read` |
| GET    | `{{BASE_URL}}/interest/heatmap`       | Search filter heatmap (popular criteria)     | `analytics.read` |

**Auto-tracking triggers:**

- GET `/units/:id` → logs a `view` event
- GET `/units?search=...` → logs a `search` event with query/filters
- POST `/clients` with `interestedIn` → logs `inquiry` events

---

### 5.13 📊 Analytics & Reports Module

**Purpose:** Comprehensive business intelligence dashboard data.

**Endpoints:**

| Method | Endpoint                                  | Description                             | Permission       |
| ------ | ----------------------------------------- | --------------------------------------- | ---------------- |
| GET    | `{{BASE_URL}}/analytics/dashboard`        | Main dashboard KPIs                     | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/sales`            | Sales analytics & revenue               | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/pipeline`         | Pipeline health & velocity              | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/agents`           | Agent performance metrics               | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/clients`          | Client acquisition & conversion         | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/units`            | Unit inventory & status overview        | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/revenue-forecast` | Revenue forecasting (based on pipeline) | `analytics.read` |
| GET    | `{{BASE_URL}}/analytics/trends`           | Time-series trends                      | `analytics.read` |

**Dashboard KPIs Include:**

```json
{
  "units": {
    "total": 250,
    "available": 120,
    "reserved": 45,
    "sold": 80,
    "maintenance": 5
  },
  "clients": {
    "total": 500,
    "new_this_month": 35,
    "hot_leads": 20,
    "conversion_rate": "16%"
  },
  "deals": {
    "active": 45,
    "total_value": 12500000,
    "avg_deal_size": 450000,
    "pipeline_velocity": "32 days",
    "win_rate": "35%"
  },
  "revenue": {
    "this_month": 2500000,
    "last_month": 1800000,
    "growth_rate": "38.9%",
    "forecast_next_month": 3200000
  },
  "tasks": {
    "pending": 15,
    "overdue": 3,
    "completed_this_week": 28
  },
  "interest": {
    "total_views_this_month": 5200,
    "most_viewed_unit": { "id": "...", "unitNumber": "A-101", "views": 340 }
  }
}
```

**All analytics endpoints support date range filters:**

| Parameter   | Example                 | Description                              |
| ----------- | ----------------------- | ---------------------------------------- |
| `startDate` | `?startDate=2026-01-01` | Start of period                          |
| `endDate`   | `?endDate=2026-03-31`   | End of period                            |
| `period`    | `?period=monthly`       | Grouping: daily, weekly, monthly, yearly |

---

### 5.14 📝 Audit Log Module

**Purpose:** Immutable log of all critical operations for compliance and security.

**Collection Schema: `audit_logs`**

```json
{
  "_id": "ObjectId",
  "action": "enum: create | update | delete | login | logout | status_change | permission_change | export",
  "module": "string (e.g., units, clients, deals, users, roles)",
  "resourceId": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "userName": "string (denormalized for quick access)",
  "changes": {
    "before": "object (previous state)",
    "after": "object (new state)"
  },
  "ipAddress": "string",
  "userAgent": "string",
  "createdAt": "Date"
}
```

**Endpoints:**

| Method | Endpoint                                       | Description                             | Permission        |
| ------ | ---------------------------------------------- | --------------------------------------- | ----------------- |
| GET    | `{{BASE_URL}}/audit-logs`                      | List audit logs (paginated, filterable) | `audit_logs.read` |
| GET    | `{{BASE_URL}}/audit-logs/resource/:module/:id` | Logs for specific resource              | `audit_logs.read` |
| GET    | `{{BASE_URL}}/audit-logs/user/:userId`         | Logs for specific user                  | `audit_logs.read` |

**Business Rules:**

- Audit logs are IMMUTABLE — no update or delete operations
- Automatically capture `before` and `after` states on every update
- Retain logs for minimum 2 years

---

### 5.15 🏥 System Health Module

**Endpoints:**

| Method | Endpoint                       | Description                     | Auth           |
| ------ | ------------------------------ | ------------------------------- | -------------- |
| GET    | `{{BASE_URL}}/health`          | Server health check             | 🌐 Public      |
| GET    | `{{BASE_URL}}/health/detailed` | Detailed health (DB, Redis, R2) | 🔒 Super Admin |

---

## 6. Cross-Cutting Concerns

### 6.1 Bilingual Support (AR/EN)

- All user-facing content fields have `{ en: string, ar: string }` structure
- API responses include both languages by default
- Optional `?lang=ar` or `?lang=en` query param to filter single language

### 6.2 Soft Delete Strategy

- All deletable resources use `isDeleted: boolean` + `deletedAt: Date`
- Soft-deleted resources are excluded from normal queries
- Only super_admin can view/restore soft-deleted resources

### 6.3 Pagination Standard

Every list endpoint returns:

```json
{
  "success": true,
  "data": [...],
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

### 6.4 Error Response Standard

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "email": ["Email is required", "Invalid email format"]
    }
  },
  "meta": {
    "timestamp": "2026-03-09T10:00:00.000Z",
    "requestId": "uuid"
  }
}
```

---

## 7. Required Credentials & Environment Variables

### 7.1 What the Developer Must Provide Before Development

```
┌─────────────────────────────────────────────────────────────────────────┐
│              REQUIRED CREDENTIALS FROM YOU (THE OWNER)                   │
│                                                                         │
│  1. MongoDB Atlas Connection String                                     │
│     → Create cluster at https://cloud.mongodb.com                      │
│     → Whitelist IP addresses                                           │
│     → Create database user                                             │
│     → Copy connection string                                           │
│                                                                         │
│  2. Cloudflare R2 Credentials                                          │
│     → Account ID                                                       │
│     → R2 Access Key ID                                                 │
│     → R2 Secret Access Key                                             │
│     → R2 Bucket Name                                                   │
│     → R2 Public URL (custom domain or default)                         │
│                                                                         │
│  3. Redis Connection (optional but recommended)                         │
│     → Redis URL (e.g., from Upstash, Redis Cloud, or self-hosted)     │
│                                                                         │
│  4. JWT Secrets                                                         │
│     → Generate two strong random strings (32+ chars each)              │
│     → One for access tokens, one for refresh tokens                    │
│                                                                         │
│  5. Postman API Key (for MCP documentation)                            │
│     → Get from Postman Settings → API Keys                            │
│     → Workspace ID where collection will be created                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Complete .env File Template

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
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
MONGODB_DB_NAME=awali_realestate
MONGODB_POOL_SIZE=10

# JWT
JWT_ACCESS_SECRET=<your-access-secret-min-32-chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<your-refresh-secret-min-32-chars>
JWT_REFRESH_EXPIRES_IN=7d

# SECURITY
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CLOUDFLARE R2
CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_R2_ACCESS_KEY_ID=<your-r2-access-key>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
CLOUDFLARE_R2_BUCKET_NAME=awali-media
CLOUDFLARE_R2_PUBLIC_URL=https://media.awali.com

# REDIS (Optional)
REDIS_URL=redis://localhost:6379

# LOGGING
LOG_LEVEL=debug

# SUPER ADMIN SEED
SUPER_ADMIN_EMAIL=admin@awali.com
SUPER_ADMIN_PASSWORD=<strong-initial-password>
SUPER_ADMIN_NAME_EN=Super Admin
SUPER_ADMIN_NAME_AR=المدير العام
```

---

## 8. Database Collections Summary

| #   | Collection           | Description                      | Indexes                                                                                                    |
| --- | -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | `users`              | System admin users               | email(unique), role, isActive, createdAt                                                                   |
| 2   | `roles`              | Dynamic roles with permissions   | nameEn(unique), isActive, isSystem                                                                         |
| 3   | `units`              | Property units/buildings         | unitNumber, status, buildingType, unitType, price.amount, facade, text(description, unitNumber), createdAt |
| 4   | `building_types`     | Building type lookup             | nameEn(unique), isActive, order                                                                            |
| 5   | `unit_types`         | Unit type lookup                 | nameEn(unique), isActive, order                                                                            |
| 6   | `features`           | Amenities/characteristics lookup | nameEn(unique), category, isActive, order                                                                  |
| 7   | `clients`            | CRM clients/leads                | email, phone(unique), status, rating, source, assignedTo, text(name, email, phone), createdAt              |
| 8   | `deals`              | Sales pipeline deals             | client, unit, stage, assignedTo, expectedCloseDate, createdAt                                              |
| 9   | `tasks`              | CRM tasks & follow-ups           | assignedTo, status, priority, dueDate, relatedClient, relatedDeal                                          |
| 10  | `activities`         | Auto-logged activities           | client, deal, unit, type, createdAt                                                                        |
| 11  | `communications`     | Client communication logs        | client, type, performedBy, createdAt                                                                       |
| 12  | `documents_metadata` | Document metadata                | relatedClient, relatedDeal, relatedUnit, type, createdAt                                                   |
| 13  | `interest_logs`      | View/search tracking             | unit, type, createdAt, sessionId                                                                           |
| 14  | `audit_logs`         | Immutable audit trail            | module, resourceId, userId, action, createdAt                                                              |

---

## 9. Non-Functional Requirements

| Requirement                 | Target                 |
| --------------------------- | ---------------------- |
| API Response Time (p95)     | < 500ms                |
| Concurrent Users            | 500+                   |
| Uptime                      | 99.9%                  |
| Database Backup             | Daily automated        |
| Data Retention (Audit Logs) | 2+ years               |
| Max Upload Size (Images)    | 10MB                   |
| Max Upload Size (Videos)    | 100MB                  |
| Max Upload Size (PDFs)      | 25MB                   |
| Rate Limiting (General)     | 100 req/15min          |
| Rate Limiting (Auth)        | 5 req/15min            |
| Test Coverage               | ≥ 80%                  |
| Security                    | OWASP Top 10 compliant |

---

## 10. Seed Data Requirements

On first deployment, the system must seed:

1. **Super Admin Role** — with ALL permissions, `isSystem: true`
2. **Super Admin User** — using credentials from `.env`
3. **Default Building Types** — Villa, Apartment, Duplex, Townhouse, Penthouse, Studio
4. **Default Unit Types** — Residential, Commercial, Mixed-Use
5. **Default Features** — Pool, Garden, Parking, Elevator, Smart Home, Security System, Central AC, Balcony, Maid's Room, Driver's Room, Storage

---

## 11. Acceptance Criteria

- [ ] All CRUD endpoints functional for every module
- [ ] Dynamic RBAC enforced on every endpoint
- [ ] JWT authentication with refresh token rotation
- [ ] Full CRM pipeline: Lead → Contact → Qualify → Negotiate → Close
- [ ] Interest tracking on unit views and searches
- [ ] File upload/download via Cloudflare R2
- [ ] Bilingual content (AR/EN) on all relevant fields
- [ ] Pagination, search, filter, sort on all list endpoints
- [ ] Analytics dashboard with real-time KPIs
- [ ] Audit trail on all write operations
- [ ] Test coverage ≥ 80%
- [ ] Postman collection with all endpoints documented
- [ ] Health check endpoint
- [ ] Graceful shutdown handling
- [ ] Zero hardcoded secrets

---

_Document Version: 1.0.0_
_Last Updated: March 9, 2026_
_Author: Chief Backend Engineer_
