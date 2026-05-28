# 04 — Backend API (NestJS)

## Module map

One NestJS module per bounded context. Each owns its controllers, services, schemas, and DTOs.

```
src/
├── app.module.ts
├── main.ts
├── config/              # env loading, Zod-validated AppConfig
├── common/              # decorators, guards, interceptors, filters
│   ├── auth/            # @Roles, JwtAuthGuard, RolesGuard
│   ├── pipes/           # ZodValidationPipe
│   ├── interceptors/    # logging, audit-log
│   └── filters/         # http-exception, mongo-exception
├── modules/
│   ├── auth/            # login, OTP send/verify, refresh
│   ├── users/           # admin staff CRUD
│   ├── farmers/         # CRUD + approval
│   ├── farms/           # CRUD + polygon area calc
│   ├── crops/           # CRUD + season/year filters
│   ├── activities/      # CRUD + idempotent offline sync
│   ├── pre-harvest/     # CRUD + denorm hydrate
│   ├── samples/         # CRUD + status transitions
│   ├── audits/          # CRUD + approval
│   ├── procurement/     # CRUD + payment tracking
│   ├── warehouses/      # CRUD
│   ├── inventory/       # CRUD + GRN accept + status txn
│   ├── qr/              # generate, scan, public trace
│   ├── reports/         # pre-harvest report, exports
│   ├── notifications/   # send, schedule, read
│   ├── sync/            # mutation outbox endpoint
│   ├── files/           # S3 pre-signed upload URLs
│   ├── geo/             # IFSC proxy, weather proxy, reverse-geocode
│   ├── catalog/         # POP + input catalog
│   └── settings/        # options enum endpoints
└── infrastructure/
    ├── mongo/           # Mongoose module, schemas auto-discovered
    ├── redis/           # cache + BullMQ
    ├── s3/              # uploader, signer
    ├── bullmq/          # queues & workers
    ├── logger/          # Pino setup
    └── observability/   # OTel, Prometheus
```

## Global middleware order

1. Helmet (security headers)
2. Compression
3. CORS (allowlist)
4. Rate limiter (`@nestjs/throttler`)
5. Body parser (JSON 1MB default; files go through S3 pre-signed flow)
6. `RequestIdInterceptor` (adds `x-request-id`)
7. `LoggingInterceptor` (Pino)
8. `JwtAuthGuard` (global, with `@Public()` opt-out)
9. `RolesGuard`
10. Controllers
11. `AuditLogInterceptor` (writes to `auditLogs`)
12. `HttpExceptionFilter` (uniform error shape)

## Standard error response

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "mobileNumber must match /^[6-9]\\d{9}$/",
  "details": [{"path":"mobileNumber","code":"invalid_string"}],
  "requestId": "01H..."
}
```

## REST surface

Base URL: `/api/v1`. All non-public endpoints require `Authorization: Bearer <JWT>`.

### Auth

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/otp/send` | `{phone}` → sends OTP via Firebase; returns `{sessionId, expiresAt}`. Rate limit 3/min/phone. |
| POST | `/auth/otp/verify` | `{sessionId, otp, firebaseIdToken}` → verifies token server-side, returns `{accessToken, refreshToken, user}`. |
| POST | `/auth/password` | `{username, password}` → admin/staff password login (bcrypt). |
| POST | `/auth/refresh` | `{refreshToken}` → rotates and returns new pair. |
| POST | `/auth/logout` | invalidates refresh token (Redis blacklist). |
| GET | `/auth/me` | current user profile. |

### Users (admin staff)

| Method | Path | Role required |
|---|---|---|
| GET | `/users` | admin / orgMD |
| GET | `/users/:id` | admin |
| POST | `/users` | admin |
| PATCH | `/users/:id` | admin |
| DELETE | `/users/:id` | admin (soft) |

### Farmers

| Method | Path | Notes |
|---|---|---|
| GET | `/farmers?status&association&q&page&pageSize` | excludes blob URL fields |
| GET | `/farmers/:id` | full doc with pre-signed image URLs |
| POST | `/farmers` | auto-assigns `farmerId`; `approvalStatus: pending` |
| PATCH | `/farmers/:id` | |
| POST | `/farmers/:id/approve` | `{approved:bool, reason?:string}` |
| GET | `/farmers/pending` | shortcut for `?approvalStatus=pending` |
| GET | `/farmers/flower-agents` | `?isFlowerAgent=true` shortcut |
| POST | `/farmers/flower-agents/:id/approve` | mirror of approve |
| DELETE | `/farmers/:id` | soft + cascade |
| POST | `/farmers/sync` | offline batch upsert; body = `{records:[…]}` with `clientRequestId` per row |

### Farms

| Method | Path |
|---|---|
| GET | `/farms?farmerId&flowerAgentId&status&page&pageSize` |
| GET | `/farms/:id` |
| POST | `/farms` |
| PATCH | `/farms/:id` |
| DELETE | `/farms/:id` |
| GET | `/farms/nearby?lat&lng&radiusKm` | uses 2dsphere |

### Crops

| Method | Path | Filters |
|---|---|---|
| GET | `/crops` | `farmId, farmerId, flowerAgentId, year, season` |
| POST/PATCH/DELETE | `/crops[/:id]` | |

### Activities

| Method | Path | Filters |
|---|---|---|
| GET | `/activities` | `farmId, cropId, status, from, to` |
| POST/PATCH/DELETE | `/activities[/:id]` | |
| POST | `/activities/sync` | offline batch (idempotent by `clientRequestId`) |

### Pre-Harvest

| Method | Path |
|---|---|
| GET | `/pre-harvest?farmerId&farmId&growthStage&status` |
| GET | `/pre-harvest/farmers` |
| GET | `/pre-harvest/farms/:farmerId` |
| GET | `/pre-harvest/crops/:farmId` |
| POST | `/pre-harvest` |
| PATCH | `/pre-harvest/:id` |
| DELETE | `/pre-harvest/:id` |

### Reports

| Method | Path |
|---|---|
| GET | `/reports/pre-harvest?approvalStatus&status&growthStage&includeMissingFarm&includeFlowerAgents&onlyPreHarvest&format=json\|csv\|xlsx` |
| GET | `/reports/farmer-summary?farmerId&from&to` |
| GET | `/reports/procurement?from&to&association&status` |
| POST | `/reports/export` | queues a background export job; returns `{jobId}` |
| GET | `/reports/export/:jobId` | poll status → returns S3 download URL when done |

### Samples

| Method | Path |
|---|---|
| GET | `/samples?status&crop&variety&association` |
| GET | `/samples/crops` |
| GET | `/samples/varieties` |
| POST/PATCH | `/samples[/:id]` |
| DELETE | `/samples/:id` |

### Audits

| Method | Path |
|---|---|
| GET | `/audits?status&auditType&association` |
| POST/PATCH | `/audits[/:id]` |

### Procurement

| Method | Path |
|---|---|
| GET | `/procurement?status&from&to&association` |
| GET | `/procurement/stats` → `{total, pending, completed, totalValue}` |
| POST/PATCH/DELETE | `/procurement[/:id]` |
| POST | `/procurement/:id/payment` | append `paymentRecords[]` entry |

### Warehouses

| Method | Path |
|---|---|
| GET | `/warehouses` |
| POST/PATCH | `/warehouses[/:id]` |
| DELETE | `/warehouses/:id` |

### Inventory

| Method | Path |
|---|---|
| GET | `/inventory?status&warehouseId&grade&supplier&from&to` |
| GET | `/inventory/:batchId` |
| POST | `/inventory/grn/accept` | `{qrPayload OR manualEntry, procurementId}` |
| POST | `/inventory/:batchId/transition` | `{toStatus, notes}` |
| POST | `/inventory/:batchId/sell` | `{quantity, buyer}` |
| POST | `/inventory/:batchId/transfer` | `{toWarehouseId, quantity}` |
| POST | `/inventory/:batchId/process` | `{toStage, notes}` |

### QR

| Method | Path | Auth |
|---|---|---|
| POST | `/qr/generate` | `{batchId}` → returns `{code, imageUrl}` |
| POST | `/qr/scan` | `{code}` → logs scan, returns batch summary (auth users only) |
| GET | `/public/trace/:code` | **public** — returns full trace timeline (no auth) |
| GET | `/qr/:code/png` | returns 256×256 PNG redirect |

### Files

| Method | Path |
|---|---|
| POST | `/files/sign-upload` | `{kind, contentType}` → `{uploadUrl, key, expiresAt}` |
| GET | `/files/sign-read/:key` | `{url, expiresAt}` for protected blobs |

### Notifications

| Method | Path |
|---|---|
| GET | `/notifications` | inbox for current user |
| PATCH | `/notifications/:id/read` | |
| POST | `/notifications/register-device` | `{expoPushToken, platform, appVersion}` |
| DELETE | `/notifications/devices/:tokenHash` | unregister |

### Geo proxies

| Method | Path |
|---|---|
| GET | `/geo/ifsc/:ifsc` | proxies Razorpay IFSC, caches in Redis 30d |
| GET | `/geo/weather?lat&lng` | proxies Open-Meteo, caches 1h |
| GET | `/geo/reverse?lat&lng` | proxies Nominatim, caches 7d |

### Catalog

| Method | Path |
|---|---|
| GET | `/catalog/pop?crop&variety&year` |
| GET | `/catalog/inputs?kind&q` |
| GET | `/catalog/options` | returns all enums (roles, languages, participantTypes, …) for client dropdowns |

### Stats / Dashboard

| Method | Path |
|---|---|
| GET | `/stats/dashboard` | `{totalFarmers, totalFarms, totalCrops, recent:[…], activityProgress, practices, groups}` |

---

## Pagination

All list endpoints support `?page=1&pageSize=50` (max 200). Response envelope:

```json
{
  "data": [...],
  "page": 1,
  "pageSize": 50,
  "total": 1234,
  "totalPages": 25
}
```

## Soft delete + cascade behavior

`DELETE /farmers/:id` runs in a Mongo session/transaction:
1. Sets `isDeleted: true` on farmer
2. Same on all `farms` where `farmerId = id`
3. Same on `crops` for those farms
4. Same on `activities`, `samples`, `audits`, `procurements`, `preHarvest`, `locations`
5. Inventory is **not** soft-deleted (trace integrity); it's marked `farmerArchived: true` instead

Implemented in `farmers.service.ts` via a `SoftDeleteService` helper.

## Idempotency

Any endpoint that accepts `clientRequestId` (sync endpoints, activities POST from mobile) uses a Redis SETNX on `idem:<clientRequestId>` with 24h TTL. Duplicate requests return the cached response.

## Versioning

URL-versioned (`/api/v1`). Breaking changes ship as `/api/v2` with a 6-month deprecation overlap.

## OpenAPI

Generated by `@nestjs/swagger`. Served at `/api/docs` in non-prod, password-protected in prod.
