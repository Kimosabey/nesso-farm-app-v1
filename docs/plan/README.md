# Nesso v1 — Build Plan

End-to-end implementation plan for the **Nesso Farm Traceability Platform**, derived from `../prdv1.txt.txt` (target spec) and `../FoodSign_PRD.md` (legacy implementation used as domain & feature reference).

**Target stack:** NestJS + MongoDB/Redis backend, Next.js 15 web dashboard, Expo (TypeScript) mobile app, public QR portal.
**Feature scope:** full FoodSign feature set ported into the modern stack (farmer onboarding, farm/polygon mapping, crop lifecycle, activities, pre-harvest, sampling, audits, procurement, GRN, batch inventory, QR traceability, reports, offline-first sync, 12-language i18n).

---

## How to read this plan

1. **Start with `00-overview.md`** — vision, personas, scope boundaries.
2. **Then `01-architecture.md` + `02-tech-stack.md`** — system shape and library decisions.
3. **Then `03-database-schema.md`** — the source-of-truth data model. Every feature module references collections defined here.
4. **Then platform specs** (`04`–`07`) — what each surface (backend, mobile, web, QR portal) must deliver.
5. **Then per-module specs** under `modules/` — feature-by-feature requirements (APIs, screens, data, edge cases).
6. **`11-implementation-phases.md`** is the sprint-by-sprint sequence that ties it all together.

---

## File map

### Top level

| File | Purpose |
|---|---|
| `00-overview.md` | Vision, personas, scope, success metrics |
| `01-architecture.md` | System architecture, data flow, deployment topology |
| `02-tech-stack.md` | Library choices with rationale per layer |
| `03-database-schema.md` | All MongoDB collections, indexes, relationships |
| `04-backend-api.md` | NestJS module breakdown + full REST surface |
| `05-mobile-app.md` | Expo TS app: navigation, screens, state, offline cache |
| `06-web-dashboard.md` | Next.js 15 admin: routes, layouts, data fetching |
| `07-qr-portal.md` | Public traceability portal (Next.js, no auth) |
| `08-roles-permissions.md` | RBAC matrix, JWT claims, route guards |
| `09-design-system.md` | Nesso brand tokens (validated palette), components, typography, motion |
| `10-deployment.md` | Docker, Nginx, GitHub Actions, environments |
| `11-implementation-phases.md` | Phased delivery plan with milestones |
| `12-known-gaps.md` | Risks, security backlog, deferred items |
| `13-ux-accessibility.md` | UX principles, WCAG 2.2 AA checklist, motion safety, modern lib inventory |

### Modules (`modules/`)

| File | Module |
|---|---|
| `01-authentication.md` | OTP login, JWT, session, device registration |
| `02-farmer-onboarding.md` | Farmer registration, KYC, approval workflow |
| `03-farm-mapping.md` | GPS capture, polygon drawing, area calc |
| `04-crop-lifecycle.md` | Crop cycles, varieties, sowing/harvest planning |
| `05-activity-tracking.md` | Daily activities, inputs, costs, POP compliance |
| `06-pre-harvest.md` | Pre-harvest activities, growth stages, weather alerts |
| `07-weather.md` | Open-Meteo integration, forecasts, advisories |
| `08-harvest.md` | Harvest entries, batch creation, yield |
| `09-sampling-quality.md` | Sample queue, lab status, POP catalog |
| `10-audits.md` | Internal/external audit workflow |
| `11-procurement.md` | Procurement orders, pricing, payment status |
| `12-warehouse.md` | Warehouse master data, capacity, certifications |
| `13-inventory-grn.md` | GRN scanning, batch inventory, status transitions |
| `14-qr-traceability.md` | QR generation, scanning, public timeline |
| `15-notifications.md` | Push, in-app, weather, activity reminders |
| `16-reports-analytics.md` | Dashboard KPIs, pre-harvest report, exports |
| `17-offline-sync.md` | SQLite + MMKV cache, queue, conflict resolution |
| `18-i18n.md` | 12-language support, key strategy, fallback |
| `19-maps-gps.md` | Map rendering (Leaflet/OSM), permissions, offline tiles |

---

## Status

- [x] Docs read (`FoodSign_PRD.md`, `prdv1.txt.txt`)
- [x] Plan files drafted
- [ ] Plan reviewed & approved by user
- [ ] Phase 1 implementation kicked off

Implementation will not start until the user explicitly approves this plan.
