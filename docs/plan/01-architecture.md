# 01 — Architecture

## High-level system

```
┌────────────────────────────┐      ┌────────────────────────────┐      ┌────────────────────────────┐
│  Mobile App (Expo TS)      │      │  Web Dashboard (Next.js15) │      │  QR Portal (Next.js)       │
│  Field Officers, Farmers   │      │  Admin, Ops, Quality       │      │  Public, no auth           │
│                            │      │                            │      │                            │
│  • Zustand state           │      │  • App Router (RSC)        │      │  • SSG/ISR for trace pages │
│  • TanStack Query          │      │  • shadcn/ui + Tailwind    │      │  • Reads via public API    │
│  • Expo SQLite + MMKV      │      │  • Recharts + TanStack Tbl │      │                            │
│  • NativeWind UI           │      │  • Server actions          │      │                            │
└──────────────┬─────────────┘      └──────────────┬─────────────┘      └──────────────┬─────────────┘
               │ JWT (RS256)                       │ JWT cookie (httpOnly)             │
               ▼                                   ▼                                   ▼
               ┌──────────────────────────────────────────────────────────────────────────┐
               │  NestJS API (modular monolith)                                            │
               │  • Auth (JWT, OTP) • RBAC guards • Zod validation • Pino logger          │
               │  • Modules: auth, farmers, farms, crops, activities, pre-harvest,        │
               │    samples, audits, procurement, warehouse, inventory, qr, reports,      │
               │    notifications, sync, files, geo                                       │
               │  • BullMQ workers (sync, notifications, report exports)                  │
               └──────────────┬───────────────────────────────────┬───────────────────────┘
                              │                                   │
                              ▼                                   ▼
                ┌────────────────────────┐         ┌────────────────────────┐
                │  MongoDB (Atlas)       │         │  Redis                 │
                │  Primary data store    │         │  Cache + BullMQ +      │
                │  12+ collections       │         │  OTP store + sessions  │
                └────────────┬───────────┘         └────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │  Object Storage        │
                │  (S3 / Azure Blob)     │
                │  Images, map exports,  │
                │  KYC docs, QR PNGs     │
                └────────────────────────┘
```

## Architectural principles

1. **Offline-first on mobile.** Every write goes to a local SQLite queue first, then syncs. UI never blocks on network.
2. **Modular monolith on backend.** One deployable NestJS app, strictly modular code. We split into microservices only if a module proves it needs to.
3. **Server-rendered web.** Next.js App Router with Server Components for data tables; Client Components only where interactivity is essential (maps, charts, modals).
4. **Object storage for blobs.** No base64 image fields in MongoDB. All images → S3/Blob, store URL only. (This is the explicit fix for the FoodSign 50MB-JSON pattern.)
5. **JWT with refresh tokens.** Access token 15 min, refresh 30 days, rotated on use.
6. **RBAC at the controller layer.** Every endpoint declares required roles via decorator; guard rejects before reaching service.
7. **Idempotent sync.** Every mutation accepts a `clientRequestId`; duplicates are ignored. Critical for offline replay.
8. **Soft delete everywhere.** `isDeleted: boolean` + cascading soft-deletes (farmer → farms → crops → activities).

## Data flow — write path (mobile)

```
User action
   │
   ▼
Zustand store (optimistic update)
   │
   ▼
SQLite mutation log (clientRequestId, payload, retries=0)
   │
   ▼
TanStack Query mutation
   │
   ├── online ─► POST /api/... ─► 200 ─► drain SQLite row
   │                          ─► 4xx ─► mark row failed, surface error
   │                          ─► 5xx/timeout ─► increment retries, exp. backoff
   │
   └── offline ─► NetInfo listener requeues on reconnect
```

## Data flow — read path

- Mobile: read-through cache. UI renders SQLite snapshot immediately, then fetches fresh data and replaces.
- Web: server-rendered tables fetch fresh; client-side mutations use TanStack Query with `invalidateQueries` after success.
- QR portal: ISR with 5-minute revalidate so traceability pages load instantly and reflect updates without on-demand SSR cost.

## Deployment topology

```
                ┌───── Cloudflare (CDN + WAF) ─────┐
                │                                  │
        QR portal (Vercel/static)         Web dashboard (Vercel or Docker)
                                                   │
                                          api.nesso.example.com
                                                   │
                                          ┌────────┴────────┐
                                          │  Nginx (LB/TLS) │
                                          └────────┬────────┘
                                                   │
                                          ┌────────┴────────┐
                                          │ NestJS replicas │  (≥2)
                                          └────────┬────────┘
                                                   │
                                  ┌────────────────┼────────────────┐
                                  ▼                ▼                ▼
                          MongoDB Atlas      Redis (managed)   S3-compatible store
```

Workers: BullMQ workers run in their own container set so background jobs (report exports, push notifications, image processing) don't impact API latency.

## Sync architecture summary

See `modules/17-offline-sync.md` for the full spec. Key points:

- Local store: **SQLite** (relational records, deterministic queries) + **MMKV** (KV for tokens, prefs, small lookups).
- Outbox pattern: every offline mutation written to `mutation_outbox` table.
- Background sync triggered by `NetInfo` reconnect, app foreground, and periodic 60s tick.
- Conflict policy: **server wins** (last-write-wins by `updatedAt`); client mutations are append-only events when possible (activities, samples) so conflicts are rare.

## Observability

- **Logs:** Pino structured JSON → stdout → CloudWatch/Stackdriver.
- **Metrics:** Prometheus client in NestJS, scraped by managed Prometheus; Grafana dashboards.
- **Traces:** OpenTelemetry, exported to a managed backend (Honeycomb/Tempo). Sample rate 10% in prod.
- **Errors:** Sentry on mobile, web, and backend.
- **Audit log:** All admin mutations write to `auditLogs` collection with actor, action, before/after diffs.

## Security headlines

- JWT RS256 (asymmetric) so QR portal can verify without holding signing key.
- bcrypt(12) for password hashes; OTP stored as hash with 5-min TTL in Redis.
- CORS allowlist (no wildcards).
- Rate limit on `/auth/*` (5/min/IP) and `/qr/generate` (10/min/user).
- Server-side validation with **Zod** on every endpoint.
- Object-storage URLs are pre-signed and short-lived (15 min for KYC docs).
- All PII fields (Aadhaar, bank account) encrypted at rest via field-level encryption.

See `12-known-gaps.md` for the hardening backlog inherited from the FoodSign baseline.
