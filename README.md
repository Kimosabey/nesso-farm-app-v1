<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso · NR Group" width="180" />

# Nesso — Farm Traceability Platform

**A modern, offline-first farm-to-fork traceability ecosystem for the Indian agriculture supply chain.**

Digitally connects farmers, field agents, operations, warehouses, logistics, and consumers — with real-time data and QR-powered transparency.

<br />

<p>
  <img alt="Status" src="https://img.shields.io/badge/status-planning-FCD34D?style=for-the-badge" />
  <img alt="Version" src="https://img.shields.io/badge/version-v1.0--planning-0D783C?style=for-the-badge" />
  <img alt="Platforms" src="https://img.shields.io/badge/platforms-Android%20%7C%20iOS%20%7C%20Web%20%7C%20QR%20Portal-518E6D?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-Proprietary-1F2937?style=for-the-badge" />
</p>

<p>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs&logoColor=white" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square&logo=expo&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
  <img alt="WCAG" src="https://img.shields.io/badge/WCAG-2.2%20AA-7C3AED?style=flat-square" />
</p>

<sub>Powered by **NESSO · NR Group** · Continuation of the FoodSign platform on a modern stack</sub>

</div>

---

<br />

## What is Nesso

Nesso is a digital traceability platform built for **horticulture and scented-flower value chains** (Tuberose, Jasmine, Marigold, Rose, Davana) — extensible to any crop. It captures the full produce journey: farmer onboarding, farm GPS mapping, crop lifecycle, day-to-day activities, pre-harvest planning, sampling, audits, procurement, GRN, batch inventory, and **public QR traceability** that any consumer can scan.

<table>
  <tr>
    <td width="50%" valign="top">

### Why it matters

- **Transparency** — every batch links back to a farmer, a farm, and a date
- **Offline-first** — works in low-connectivity rural India
- **Vernacular** — 12 Indian + regional languages
- **Scale-ready** — designed for 100K+ farmers, 1M+ activity records

</td>
    <td width="50%" valign="top">

### Who it's for

- Org Admin / MD
- Field Officers & Field Assistants
- Flower Agents / FPOs
- Farmers
- Procurement Managers / Processors
- Quality Auditors
- Consumers & Retailers (via QR portal)

</td>
  </tr>
</table>

<br />

## Highlights

<table>
  <tr>
    <td width="33%" valign="top" align="center">
      <h3>Offline-First Mobile</h3>
      <p>SQLite outbox + MMKV. Field officers work for hours without network. Idempotent sync drains on reconnect.</p>
    </td>
    <td width="33%" valign="top" align="center">
      <h3>GPS Polygon Mapping</h3>
      <p>Tap-to-draw farm boundaries with Leaflet inside WebView. Auto-area in acres / hectares.</p>
    </td>
    <td width="33%" valign="top" align="center">
      <h3>QR Traceability</h3>
      <p>Every batch gets a public trace URL. Farm-to-shelf timeline loads in under 2 seconds on 3G.</p>
    </td>
  </tr>
  <tr>
    <td valign="top" align="center">
      <h3>12 Languages</h3>
      <p>EN, HI, KN, BN, TE, TA, ML, MR, OR, GU, TR, VI — native script across all surfaces.</p>
    </td>
    <td valign="top" align="center">
      <h3>WCAG 2.2 AA</h3>
      <p>Audited contrast, keyboard reachable, screen-reader friendly, reduced-motion safe — light & dark.</p>
    </td>
    <td valign="top" align="center">
      <h3>RBAC + Audit Log</h3>
      <p>17 roles with scope filters. Every admin write captured in an immutable audit trail.</p>
    </td>
  </tr>
</table>

<br />

## Platforms

| Surface | Stack | Audience |
|---|---|---|
| **Mobile App** (Android · iOS) | Expo SDK 54 · React Native 0.81 · TypeScript · NativeWind · Zustand · TanStack Query · SQLite · MMKV · Reanimated 3 | Field officers, agents, farmers |
| **Web Dashboard** | Next.js 15 (App Router · RSC) · TypeScript · Tailwind · shadcn/ui · TanStack Table · Recharts · react-leaflet | Admin, ops, procurement, quality, warehouse |
| **QR Portal** | Next.js 15 (ISR · static) · Tailwind | Consumers, retailers, auditors |
| **Backend API** | NestJS 10 · MongoDB 7 · Mongoose 8 · Redis 7 · BullMQ · S3 · Zod · Pino · OpenTelemetry | All clients |

<br />

## Brand Palette

<table>
<tr>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#0D783C;border-radius:8px;"></div><br /><sub><strong>Turf Green</strong><br /><code>#0D783C</code><br />Primary</sub></td>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#207647;border-radius:8px;"></div><br /><sub><strong>Turf Green 2</strong><br /><code>#207647</code><br />Primary hover</sub></td>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#F1D412;border-radius:8px;"></div><br /><sub><strong>Golden Glow</strong><br /><code>#F1D412</code><br />Accent</sub></td>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#518E6D;border-radius:8px;"></div><br /><sub><strong>Jungle Teal</strong><br /><code>#518E6D</code><br />Secondary</sub></td>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#FAFDFA;border:1px solid #ddd;border-radius:8px;"></div><br /><sub><strong>Porcelain</strong><br /><code>#FAFDFA</code><br />Light surface</sub></td>
<td align="center" width="16.6%"><div style="width:80px;height:80px;background:#FFFFFF;border:1px solid #ddd;border-radius:8px;"></div><br /><sub><strong>White</strong><br /><code>#FFFFFF</code><br />On-primary</sub></td>
</tr>
</table>

<sub>Full theme spec, contrast tables, motion tokens, and component contract → [`docs/plan/09-design-system.md`](docs/plan/09-design-system.md)</sub>

<br />

## Modules at a glance

<table>
<tr><td>

**Identity**
- [Authentication](docs/plan/modules/01-authentication.md)
- [Roles & Permissions](docs/plan/08-roles-permissions.md)

**Onboarding**
- [Farmer Onboarding](docs/plan/modules/02-farmer-onboarding.md)
- [Farm Mapping](docs/plan/modules/03-farm-mapping.md)

**Operations**
- [Crop Lifecycle](docs/plan/modules/04-crop-lifecycle.md)
- [Activity Tracking](docs/plan/modules/05-activity-tracking.md)
- [Pre-Harvest](docs/plan/modules/06-pre-harvest.md)
- [Weather](docs/plan/modules/07-weather.md)
- [Harvest](docs/plan/modules/08-harvest.md)

</td><td>

**Quality**
- [Sampling & Quality](docs/plan/modules/09-sampling-quality.md)
- [Audits](docs/plan/modules/10-audits.md)

**Supply Chain**
- [Procurement](docs/plan/modules/11-procurement.md)
- [Warehouse](docs/plan/modules/12-warehouse.md)
- [Inventory & GRN](docs/plan/modules/13-inventory-grn.md)
- [QR Traceability](docs/plan/modules/14-qr-traceability.md)

**Platform**
- [Notifications](docs/plan/modules/15-notifications.md)
- [Reports & Analytics](docs/plan/modules/16-reports-analytics.md)
- [Offline Sync](docs/plan/modules/17-offline-sync.md)
- [i18n (12 langs)](docs/plan/modules/18-i18n.md)
- [Maps & GPS](docs/plan/modules/19-maps-gps.md)

</td></tr>
</table>

<br />

## Repository layout (target)

```
nesso/
├── apps/
│   ├── api/            NestJS backend (modular monolith)
│   ├── web/            Next.js 15 admin dashboard
│   ├── portal/         Next.js public QR traceability portal
│   └── mobile/         Expo TS app (Android + iOS)
├── packages/
│   ├── shared-types/   Zod schemas + generated TS types
│   ├── design-system/  Tailwind preset + shared UI primitives
│   ├── i18n/           12-language translation JSONs
│   └── config/         eslint, tsconfig, prettier shared
├── infra/
│   ├── docker/         Dockerfiles + compose
│   ├── nginx/          Reverse-proxy config
│   └── github/         Reusable workflows
└── docs/
    ├── plan/           End-to-end build plan (this directory)
    ├── FoodSign_PRD.md Legacy implementation (domain reference)
    ├── prdv1.txt.txt   Target product spec
    └── palette.txt     Validated brand palette
```

<br />

## Getting started

> Implementation has **not** started yet. The full plan is approved, then we kick off Phase 0.
> Until then, the commands below are the *intended* developer experience.

<details>
<summary><strong>Prerequisites</strong></summary>

- Node.js **20 LTS**
- pnpm **9+** (`corepack enable`)
- Docker Desktop (for Mongo + Redis + Minio + Mailhog)
- For mobile: Expo CLI (`pnpm dlx expo`), Android Studio or Xcode

</details>

<details>
<summary><strong>Local development</strong></summary>

```bash
# 1. Clone & install
git clone <repo>
cd nesso
pnpm install

# 2. Spin up infra (Mongo, Redis, Minio, Mailhog)
docker compose up -d

# 3. Seed the database
pnpm seed

# 4. Run everything in parallel
pnpm dev
```

| Service | URL |
|---|---|
| API (NestJS) | http://localhost:3000 |
| Web Dashboard | http://localhost:3001 |
| QR Portal | http://localhost:3002 |
| Mobile (Expo) | http://localhost:8081 |
| Swagger API docs | http://localhost:3000/api/docs |
| Minio console | http://localhost:9001 |
| Mailhog | http://localhost:8025 |

</details>

<details>
<summary><strong>Common scripts</strong></summary>

```bash
pnpm lint              # ESLint across the workspace
pnpm typecheck         # tsc --noEmit per app
pnpm test              # vitest (api + web) + jest (api e2e)
pnpm test:e2e          # Playwright (web) + Detox (mobile)
pnpm i18n:check        # verify 12-language key parity
pnpm i18n:scan         # find missing / orphaned i18n keys
pnpm build             # production builds via Turborepo
pnpm storybook         # design-system component playground
```

</details>

<br />

## Documentation

> Everything you need to build, run, ship, and operate Nesso lives under [`docs/plan/`](docs/plan/).

### Start here

| Read this first | Why |
|---|---|
| [README](docs/plan/README.md) | Plan index + how to read |
| [Overview](docs/plan/00-overview.md) | Vision, personas, scope, success metrics |
| [Architecture](docs/plan/01-architecture.md) | System shape, data flow, deployment topology |
| [Tech Stack](docs/plan/02-tech-stack.md) | Every library decision with rationale |

### Build references

| Doc | What it covers |
|---|---|
| [Database Schema](docs/plan/03-database-schema.md) | 16 collections, indexes, soft-delete cascade |
| [Backend API](docs/plan/04-backend-api.md) | NestJS modules + full REST surface |
| [Mobile App](docs/plan/05-mobile-app.md) | Screens, navigation, state, offline strategy |
| [Web Dashboard](docs/plan/06-web-dashboard.md) | App Router routes, tables, charts, server actions |
| [QR Portal](docs/plan/07-qr-portal.md) | Public trace page, ISR strategy, privacy redaction |
| [Roles & Permissions](docs/plan/08-roles-permissions.md) | 17-role matrix, JWT claims, scope filters |
| [Design System](docs/plan/09-design-system.md) | Palette, themes, typography, motion, splash |
| [Deployment](docs/plan/10-deployment.md) | Docker, Nginx, CI/CD, EAS, secrets, DR |
| [Implementation Phases](docs/plan/11-implementation-phases.md) | 6-phase delivery plan with milestones |
| [Known Gaps](docs/plan/12-known-gaps.md) | Risks, security backlog, deferred features |
| [UX & Accessibility](docs/plan/13-ux-accessibility.md) | UX principles + WCAG 2.2 AA checklist |
| [Screen Inventory](docs/plan/14-screen-inventory.md) | ~99 screens across mobile, web, portal |

### Source PRDs

- [`docs/FoodSign_PRD.md`](docs/FoodSign_PRD.md) — Legacy implementation (domain reference)
- [`docs/prdv1.txt.txt`](docs/prdv1.txt.txt) — Target product spec
- [`docs/palette.txt`](docs/palette.txt) — Validated brand palette

<br />

## Roadmap

The plan delivers v1 in **six phases over ~12 weeks**.

| Phase | Focus | Demo milestone |
|---|---|---|
| **Phase 0** · Foundations | Monorepo, design system, four "Hello Nesso" shells | Four surfaces running locally with shared theme |
| **Phase 1** · Auth & Identity | OTP login, JWT, RBAC, audit log | Login working across web + mobile |
| **Phase 2** · Farmer & Farm core | Onboarding, polygon mapping, offline sync, approvals | Register farmer offline → sync → approve on web |
| **Phase 3** · Crops, Activities, Pre-Harvest | POP catalog, ~180 inputs, calendar, reminders | Log activity offline with photos & cost |
| **Phase 4** · Quality, Procurement, Inventory | Samples, audits, procurement, GRN, batch inventory | Procurement → QR-scan → inventory batch |
| **Phase 5** · QR, Notifications, Reports | Public traceability, push, exports | Consumer scans QR → trace page in < 2 s |
| **Phase 6** · Hardening & GA | Security, performance, a11y audit, load test | v1 live |

Full breakdown → [`docs/plan/11-implementation-phases.md`](docs/plan/11-implementation-phases.md).

<br />

## Quality bar

<table>
<tr>
<td width="33%" valign="top">

### Accessibility
- **WCAG 2.2 AA** across both themes
- Audited contrast tables
- Reduced-motion safe
- Keyboard-reachable on web
- Min 44×44 touch targets

</td>
<td width="33%" valign="top">

### Performance
- API p95 < 500 ms
- Mobile cold start < 3 s
- QR portal LCP < 1.5 s
- Sync success > 99% / 7d
- Crash-free sessions > 99.5%

</td>
<td width="33%" valign="top">

### Security
- JWT RS256 + refresh rotation
- bcrypt(12), no plaintext
- Field-level encryption for PII
- Pre-signed S3 (15-min TTL)
- Audit log on every mutation

</td>
</tr>
</table>

<br />

## Contributing

This is a **proprietary** project under NESSO · NR Group. Internal contributors:

1. Read [`docs/plan/README.md`](docs/plan/README.md) and the module spec you intend to touch.
2. Branch from `main`: `feat/<scope>-<short-name>` or `fix/<scope>-<short-name>`.
3. Open a PR; CI must pass (lint, typecheck, unit, e2e, i18n parity, a11y, perf budgets).
4. Get one CODEOWNER review.
5. Squash-merge.

Coding standards live in [`packages/config`](packages/config) once Phase 0 ships.

<br />

## Support

- **Issues:** internal tracker (link TBD)
- **Owner:** NESSO · NR Group
- **Tech lead contact:** harshan.aiyappa@graylinx.ai

<br />

---

<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="NR Group" width="80" />

<br />

<sub><strong>NESSO · NR Group</strong> — building a transparent agricultural supply chain, one batch at a time.</sub>

<br />

<sub>© 2026 NR Group. All rights reserved.</sub>

</div>
