# 11 — Implementation Phases

A 6-phase delivery plan that gets us from empty repo to v1 GA. Each phase ends with a demoable milestone and an updated changelog. Estimated durations assume a 4-person team (1 backend, 1 web, 1 mobile, 1 design/QA) — adjust as needed.

> **The user will trigger the start of Phase 0. Until then, no code is written.**

---

## Phase 0 — Foundations (Week 1)

**Goal:** monorepo scaffolded, dev environment runs locally, design tokens shipping.

- [ ] Initialize pnpm workspace + Turborepo with `apps/{api,web,portal,mobile}` and `packages/{shared-types,design-system,i18n,config}`
- [ ] Shared ESLint + Prettier + TS config in `packages/config`
- [ ] Tailwind preset in `packages/design-system` (palette tokens from `palette.txt`, light + dark themes, motion tokens)
- [ ] i18next bootstrap in `packages/i18n` with all 12 language stubs (English keys complete, others fall back)
- [ ] `docker-compose.yml`: Mongo + Redis + Minio + Mailhog
- [ ] NestJS skeleton with health endpoint, Pino logger, Swagger
- [ ] Next.js dashboard skeleton with auth route group and sidebar shell
- [ ] Next.js portal skeleton with `/t/[code]` page (mocked data)
- [ ] Expo skeleton with root navigator, splash screen, font loading, theme provider
- [ ] CI: lint + typecheck + build matrix
- [ ] Storybook (or Ladle) for design-system components
- [ ] Sentry projects provisioned for all four surfaces

**Demo:** four "Hello Nesso" surfaces running locally with shared brand theme.

---

## Phase 1 — Auth & Identity (Week 2)

**Goal:** users can log in everywhere; RBAC enforced.

- [ ] Backend `auth` module: password login, OTP send/verify, refresh token rotation, blacklist on logout
- [ ] Backend `users` module: CRUD with bcrypt
- [ ] JWT RS256 keypair; `JwtAuthGuard` + `RolesGuard` + `@Roles` decorator + `@Public`
- [ ] Audit log interceptor wired
- [ ] Bootstrap admin seed script
- [ ] Web login + forgot-password pages; session cookie wired
- [ ] Mobile login flow (phone → OTP via Firebase) with offline-cached token
- [ ] `useCurrentRole()` web hook + `<RequireRole>` component
- [ ] Rate limiting on `/auth/*`

**Demo:** admin logs in on web, field officer logs in on mobile with Firebase OTP, JWT verified server-side.

---

## Phase 2 — Farmer & Farm core (Weeks 3–4)

**Goal:** the core onboarding flow works offline and online.

- [ ] `farmers` module: schema, CRUD, approval workflow, soft-delete cascade
- [ ] `farms` module: schema, CRUD, polygon geo-index, area calculation helper
- [ ] `files` module: S3 pre-signed upload URLs for profile/ID/bank/farm photos
- [ ] `geo` module: IFSC proxy (cached), reverse geocode
- [ ] Mobile screens: RegisterFarmer, FarmerList, FarmerProfile, AddNewFarm (polygon editor in WebView Leaflet)
- [ ] Mobile validators (Aadhaar, PAN, Voter, Passport, DL, IFSC, mobile, pincode)
- [ ] Mobile SQLite outbox + SyncManager → drains via `/farmers/sync` and `/farms/sync`
- [ ] Web pages: Farmers list, Farmer detail, Pending approvals (inline approve), Farm list + map view
- [ ] Web forms: farmer create/edit with image upload via pre-signed URLs
- [ ] e2e: Playwright covers "field officer registers farmer offline → reconnects → admin approves"

**Demo:** register a farmer with KYC + bank from mobile while offline, sync online, see them appear in the web dashboard for approval.

---

## Phase 3 — Crops, Activities, Pre-Harvest (Weeks 5–6)

**Goal:** the day-to-day operational loop.

- [ ] `crops` module + CRUD
- [ ] `activities` module + CRUD + idempotent sync endpoint + offline replay
- [ ] `preHarvest` module + CRUD with denormalization
- [ ] `catalog` module: `popCatalog`, `inputCatalog` seeded
- [ ] Mobile screens: AddNewCrop, AddActivity (10 types + 180-item input picker), Activities (calendar + list), PreHarvest tabs
- [ ] Mobile geo-tagging on activities; photos via S3 pre-signed
- [ ] Web pages: Crops, Activities (filter builder), Pre-Harvest (Report / Activities / Crop History)
- [ ] Push notifications: activity reminders via FCM + BullMQ schedule worker

**Demo:** log a watering activity offline on mobile with photos and cost, see it in web activity list + cost summary card.

---

## Phase 4 — Quality, Procurement, Inventory (Weeks 7–8)

**Goal:** post-onboarding supply chain.

- [ ] `samples` module + status transitions
- [ ] `audits` module + approval flow
- [ ] `procurement` module + payment tracking + `procurement/stats`
- [ ] `warehouses` module + master data
- [ ] `inventory` module + GRN accept + status transitions (SELL / TRANSFER / PROCESS)
- [ ] Mobile screens: SampleBoard, Audit, Procurement, PostHarvestDashboard, Batches (QR scan FAB), AcceptGRN (multi-format scanner), InventoryDashboard
- [ ] Web pages: Samples, Audits, Procurement, Warehouses, Inventory (Batches + GRN + Movements)
- [ ] Linkage: procurement → inventory batch generation

**Demo:** procurement order accepted via QR scan on mobile → inventory batch created → status transitioned through Cleaned → Packed on web.

---

## Phase 5 — QR Traceability, Notifications, Reports (Weeks 9–10)

**Goal:** consumer-facing trace + reporting + notifications.

- [ ] `qr` module: generation (with PNG to S3), scan logging, **public** `/public/trace/:code` endpoint
- [ ] Backend regenerates `qrCodes.payload` on inventory transition (BullMQ job)
- [ ] Portal: `/t/[code]` page (ISR), `/t/[code]/farmer`, `/t/[code]/farm`, scan analytics
- [ ] Privacy: `publicTraceConsent` toggle on farmer profile
- [ ] `notifications` module: push, in-app inbox, scheduling
- [ ] Mobile: in-app notification inbox + push token registration; weather notifications via Open-Meteo cache
- [ ] Web: notification bell + inbox
- [ ] `reports` module: pre-harvest report aggregation, queued exports via BullMQ → S3 download links
- [ ] Web Reports page: filter builder + export

**Demo:** scan a QR with any phone camera → consumer-facing trace page loads in < 2 s with the farm-to-shelf timeline.

---

## Phase 6 — Hardening, Observability, GA (Weeks 11–12)

**Goal:** production-ready.

- [ ] Migration tooling (`migrate-mongo`): base64 → S3 migration script if porting from FoodSign
- [ ] Field-level encryption for Aadhaar and bank account numbers
- [ ] Rate-limits tuned, CORS allowlist locked down
- [ ] Performance pass: list virtualization, image lazy-loading, code-splitting, route prefetch
- [ ] WCAG 2.2 audit (Axe sweep, manual screen-reader pass on critical flows)
- [ ] i18n pass: ensure all 12 languages have key parity (CI `check-i18n` enforces)
- [ ] Load test API: 1000 concurrent clients, 1M activities baseline
- [ ] Observability: Grafana dashboards (API latency, queue depth, sync success rate, scan counts), PagerDuty alerts
- [ ] Disaster recovery drill
- [ ] App Store / Play Store submission (Expo Submit)
- [ ] Production deploy + smoke tests
- [ ] Runbook and on-call docs in `/docs/runbook/`

**Demo:** v1 live, full happy-path walkthrough recorded.

---

## Cross-phase tracks

These run continuously, not as a phase:

- **Design system maintenance** — every new component lands in `packages/design-system` first.
- **i18n** — every new copy string is keyed and shipped in EN; translations batched weekly.
- **Tests** — every PR adds tests for new behavior; coverage gates kept at 70%+ on the API.
- **Docs** — `docs/plan/*` updated whenever a decision changes. Each module's MD evolves into living documentation.

---

## Phase exit criteria (definition of done)

Each phase requires before moving on:

1. All checklist items merged.
2. Demo recorded and shared.
3. CI green on `main`.
4. No P0/P1 Sentry issues open in the last 7 days.
5. WCAG audit pass on screens introduced in the phase.
6. Performance budgets met (`13-ux-accessibility.md` §10).
7. Updated changelog entry.

---

## What we explicitly defer (post-GA)

- AI features (disease detection, yield prediction, chatbot)
- Blockchain trace anchoring
- IoT ingestion (sensor → activity)
- ERP integrations (SAP/Oracle)
- Multi-tenant org isolation (single-org v1)
- SCIM/SSO

See `12-known-gaps.md` for the full deferred-items list.
