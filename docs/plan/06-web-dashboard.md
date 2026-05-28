# 06 — Web Dashboard (Next.js 15)

## Project layout

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               # sidebar + topbar shell
│   │   ├── page.tsx                 # dashboard home (KPIs + charts + map)
│   │   ├── farmers/
│   │   │   ├── page.tsx             # list (Server Component)
│   │   │   ├── new/page.tsx
│   │   │   ├── [id]/page.tsx        # detail
│   │   │   └── [id]/edit/page.tsx
│   │   ├── farms/
│   │   ├── crops/
│   │   ├── activities/
│   │   ├── pre-harvest/
│   │   ├── samples/
│   │   ├── audits/
│   │   ├── procurement/
│   │   ├── warehouses/
│   │   ├── inventory/
│   │   ├── reports/
│   │   ├── approvals/
│   │   ├── flower-agents/
│   │   ├── users/
│   │   └── settings/
│   ├── api/                         # route handlers (proxy to NestJS or server actions)
│   ├── layout.tsx                   # root
│   └── globals.css
├── components/                      # client + server components
│   ├── ui/                          # shadcn primitives
│   ├── tables/                      # TanStack Table wrappers
│   ├── charts/                      # Recharts wrappers
│   ├── map/                         # react-leaflet wrappers
│   ├── forms/                       # form fields
│   └── layout/                      # Sidebar, Topbar, PageHeader
├── lib/
│   ├── api.ts                       # server-side fetch helper (Bearer JWT)
│   ├── auth.ts                      # session/cookie helpers
│   ├── format.ts
│   └── zod-schemas.ts               # re-exports from @nesso/shared-types
├── middleware.ts                    # cookie auth gate, locale negotiation
└── public/
```

## Routing

Next.js App Router with route groups:
- `(auth)` — public auth pages, no sidebar
- `(dashboard)` — requires session, renders shell

`middleware.ts` redirects unauthenticated visits to `/login`.

## Data fetching pattern

- **List pages:** Server Components fetch the first page server-side with the user's JWT (HttpOnly cookie). The page renders TanStack Table on the client with `initialData` passed in.
- **Detail pages:** Server Components fetch full doc + related entities in parallel.
- **Mutations:** Server Actions (`'use server'`) wrap the NestJS call. After success, call `revalidatePath('/farmers')`. Optimistic UX uses `useOptimistic`.
- **Realtime-ish updates:** dashboard polls KPIs every 60s via TanStack Query.

## Sidebar navigation

```
NESSO logo
─────────────────
Dashboard
Farmers           ▼  (badge: pending count)
  ├ All Farmers
  ├ Pending Approvals
  └ Flower Agents
Farms
Crops
Activities
Pre-Harvest       ▼
  ├ Report
  ├ Activities
  ├ Crop History
  └ Nutrition
Samples
Audits
Procurement
Warehouses
Inventory         ▼
  ├ Batches
  ├ GRN
  └ Movements
Reports
─────────────────
Settings          ▼
  ├ Users
  ├ Warehouses
  ├ Catalogs (POP / Inputs)
  └ Preferences
```

Active route highlighted with brand green left-border. Sidebar collapsible to icon-only on narrow viewports.

## Pages — feature inventory

| Page | Components |
|---|---|
| Dashboard | 4 KPI cards · ActivityProgress doughnut · Practices pie · FarmerGroups pie · interactive map of farms · recent-activity feed |
| Farmers list | TanStack Table with search, multi-filter (status, association, district), CSV export, bulk approve |
| Farmer detail | tabs: Profile / Farms / Crops / Activities / Samples / Audits / Procurements / Documents |
| Pending approvals | quick approve/reject inline, with reason modal |
| Flower agents | hierarchy tree view (FPO → Flower Agent → Farmers) |
| Farms list | table + map toggle |
| Farm detail | Leaflet polygon view + tabs: Crops / Activities / Weather / Certificates / Soil / Crop History |
| Crops | filterable list |
| Activities | calendar + list views |
| Pre-Harvest | sub-tabs (Report / Activities / Crop History / Nutrition) |
| Samples | queue → sent pipeline view |
| Audits | pending / approved tabs |
| Procurement | list + stats cards + payment status |
| Warehouses | grid view with map markers |
| Inventory | batch list, status filters, transition modals (SELL / TRANSFER / PROCESS) |
| Reports | filter builder + result table + export to CSV/XLSX (queued, status polled) |
| Settings → Users | staff CRUD |
| Settings → Warehouses | master data |
| Settings → Catalogs | POP + Inputs editing |

## Auth flow

1. POST `/api/auth/login` (server action) → NestJS `/auth/password` or `/auth/otp/*`
2. On success, set `nesso_session` HttpOnly cookie containing `{accessToken, refreshTokenId}` (refresh token kept server-side in Redis)
3. Server-side fetch helper reads cookie and attaches `Authorization: Bearer ...`
4. On 401, attempt silent refresh; if that fails, redirect to login

## State & queries

- **Server state:** TanStack Query for lists/mutations from client components; SSR-hydrated where useful.
- **Client state:** Zustand (sidebar collapsed, current filters, modal open state). Not persisted.
- **Forms:** react-hook-form + Zod (shared schemas).

## Tables

`<DataTable>` wrapper around TanStack Table v8:
- column visibility toggles
- pinned columns
- server-side sort & filter (push to URL params)
- row selection + bulk actions
- CSV export (client-side for current page; server-side for full export via `/reports/export`)
- virtualized rows for >500 entries

## Charts

Recharts wrappers under `components/charts/`:
- `ActivityProgressDonut`
- `PracticesPie`
- `FarmerGroupsPie`
- `MonthlyTrendsLine`
- `ProcurementValueBar`

All charts read from `/stats/dashboard` or `/reports/*`.

## Map

`<FarmMap>` (client component) using `react-leaflet`:
- Initial bounds from `/farms?bbox=...`
- Marker cluster plugin for >100 farms
- Click → popup with farm summary + link to detail
- Polygon overlay when zoomed past level 14

## Permissions in UI

- `useCurrentRole()` hook reads JWT claims
- `<RequireRole roles={['admin']}>` wrapper hides links/buttons
- Server actions also re-check; UI hiding is defense in depth only

## Styling & theme

Tailwind + shadcn/ui + shared `design-system` package. Light theme primary; **dark theme is the brand default** per the Nesso PRD glassmorphism direction (see `09-design-system.md`). Theme toggle in topbar; persisted to user prefs server-side.

## Performance budget

- Initial JS for `/` ≤ 250 KB gzipped
- Largest table page ≤ 350 KB
- Map pages ≤ 500 KB (Leaflet weight allowed)
- Lighthouse perf ≥ 85 on `/login` and `/` (dashboard)

## i18n

`packages/i18n` shared dictionaries. App Router locale via path (`/[locale]/...`) for SEO of QR portal; for the gated dashboard, locale lives in user prefs and is applied via i18next.

## Testing

- **Vitest** + **React Testing Library** for component tests
- **Playwright** for e2e — at minimum cover: login, farmer create, farmer approve, batch GRN accept, generate QR, reports export
