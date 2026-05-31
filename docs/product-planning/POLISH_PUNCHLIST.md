<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Inner-Page Polish Punch-List

**Every unpolished page/screen + the exact fix. Token classes only
(auto dark/light). Goal: consistent empty states, loading skeletons,
sectioned forms, press feedback — across web + mobile.**

</div>

---

## Cross-cutting (build once, reuse everywhere)

| Item | Web | Mobile |
|---|---|---|
| **Skeleton loader** | `components/dashboard/Skeleton.tsx` (shimmer via `animate-pulse`) | `components/Skeleton.tsx` (Animated opacity loop) |
| **EmptyState** | ✅ exists `components/dashboard/EmptyState.tsx` — wire into remaining spots | `components/EmptyState.tsx` (icon + title + hint + CTA) |
| **Press feedback** | hover/active already on tables; ensure buttons | press-scale 0.97 on all Pressables |

---

## WEB — gaps

### Loading skeletons (0 today → add)
- Table pages render blank/spinner while data loads. Add a `<TableSkeleton rows={6} />` shown via React `Suspense` fallback OR a loading.tsx per route. Minimum: dashboard, farmers, farms, crops, samples, audits, procurement, inventory.
- Use Next.js `loading.tsx` route convention for each `(dashboard)/<page>/loading.tsx` → renders PageHeader skeleton + table skeleton.

### Forms (/new) — barebones → sectioned + validated
- `farmers/new/FarmerForm.tsx`, `farms/new/FarmForm.tsx`, `activities/new/ActivityForm.tsx`:
  - Group fields into titled sections (cards): e.g. Farmer = Personal / Address / Group; Farm = Identity / Location / Practice; Activity = Type / Schedule / Inputs.
  - Consistent field styling (h-11, label 13px/600, hint text), inline validation (required + format), submit disabled until valid, success → toast/redirect.
  - Use existing `zod` for validation; optionally `react-hook-form` (see UI_LIBRARIES_PLAN).

### Empty states still bare → use `<EmptyState>`
- `FarmTabs.tsx` (Crops/Activities/Samples/Documents tabs), `ProfileTabs.tsx` (same), `ActivitiesView.tsx`, `QrGenerator.tsx` (no batch selected), crops/samples/audits/procurement table empties.

### Dashboard
- Chart cards: ensure recharts `isAnimationActive` (draw-in). Sparkline already animates? confirm. Add hover tooltips on donut/bar.

---

## MOBILE — gaps

### Build shared components first
- `components/EmptyState.tsx` — tinted icon circle + title + hint + optional CTA button (navigates).
- `components/Skeleton.tsx` — Animated shimmer block (opacity 0.4↔1 loop), used for list rows + cards while loading.

### Wire empty states + loading into list screens
- FarmersScreen, FarmsListScreen, ActivitiesScreen, SamplesScreen, AuditScreen, ProcurementScreen, BatchesScreen, InventoryScreen, NotificationsScreen, HarvestBoardScreen, PreHarvestScreen, FarmerProfileScreen tabs:
  - While loading → 4-6 Skeleton rows (not blank).
  - When empty → `<EmptyState icon title hint actionLabel onAction>` (e.g. Farmers empty → "Register a farmer" → Register tab; Farms empty → "Add a farm" → AddFarm).

### Specific screen polish
- **RegisterFarmerScreen** — make the 4-step progress bar clearly visible (filled segments + step labels Personal/ID/Bank/Consent + step N of 4). Consent = real checkbox component.
- **SplashScreen** — already animated; ensure petal stagger plays (it does); low priority.
- **AcceptGRNScreen** — animate the reticle sweep line (Animated translateY loop) + success checkmark scale-in.
- **AddActivityScreen** — category picker as a wrapped grid (not row), field height 54, photo/geotag tiles.
- **FarmerProfileScreen** — stats row (Farms/Area/Crops/Practice) + populate tabs from real data (listFarms/listCrops/listActivities by farmerId) instead of empty stubs.
- **Press feedback** — wrap key Pressables with a press-scale (0.97) — buttons, cards, tiles. (moti later; for now `style={({pressed})=>({transform:[{scale:pressed?0.97:1}]})}`.)

---

## Execution order
1. Shared components (web Skeleton + mobile EmptyState/Skeleton)
2. Wire empty + loading states across all list pages/screens
3. Section + validate the 3 web forms
4. RegisterFarmer progress + FarmerProfile data + scanner animation
5. Global press-scale pass
6. Re-typecheck + build both apps

All token-classed (dark/light safe), no raw hex, no layout regressions.
