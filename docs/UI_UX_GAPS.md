<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# UI/UX Gaps · Prototype → Implementation

**Source of truth**: `docs/ui-ux-design-prototypes-flow/farmer-app-ui-ux-flow/design_handoff_nesso/`
(specifically `SCREENS.md` + `design-system.tokens.json` + the HTML files).

**Bottom line**: ~30–35% of the design handoff is migrated. Functional
plumbing is in place; the signature "Cultivated Clarity" visual layer is
mostly missing.

</div>

---

## 1 · Coverage at a glance

| Surface | Spec screens | Built | Status |
|---|---|---|---|
| Mobile (Expo) | ~32 | ~8 | 🟡 25% |
| Web dashboard | ~21 | ~10 partial | 🟡 ~30% (functional, not visual) |
| QR Portal | 7 | 2 minimal | 🟡 30% |
| Design system tokens | full | wired | ✅ (minor drift, hex leaks) |
| Library coverage | full stack | partial | 🟡 (charts, maps, fonts, scanner missing) |

---

## 2 · Library gaps (install these before claiming "done")

| Need | Package | Where |
|---|---|---|
| Charts (donut, bar, sparkline) | `recharts` *or* `visx` | web |
| Web fonts | `next/font/google` for Montserrat / Inter / JetBrains Mono | web + portal |
| Mobile fonts | register Montserrat/Inter via `expo-font` | mobile |
| Mobile icons (stroke consistency w/ spec) | `lucide-react-native` | mobile |
| Mobile map (polygon editor) | `react-native-maps` *or* `@maplibre/maplibre-react-native` | mobile |
| GRN barcode/QR scanner | `expo-barcode-scanner` *or* `vision-camera-code-scanner` | mobile |
| Locale resources | 11 additional language files | `packages/i18n/resources/` (currently `en/` only) |
| Empty-state illustrations | flat-geometric inline SVG set | shared `packages/design-system/illustrations/` |

Already installed but **not used**:
- `cmdk` (web) — no ⌘K palette built
- `@tanstack/react-table` (web) — tables are hand-rolled `<ul>`
- `expo-camera` (mobile) — installed but no scanner screen
- `framer-motion` (web + portal) — used for tiny bits; no scroll-link
  journey timeline, no count-up KPIs, no animated polygon draw

---

## 3 · Top 5 to claim "100% migrated"

These are the screens / features stakeholders see in demos. In order:

### 3.1 Web Dashboard bento + landing
- `apps/web/src/app/page.tsx` currently redirects to login — spec
  requires a full **marketing landing** (mesh-gradient hero, stat chips,
  feature cards, animated blobs, footer)
- `apps/web/src/app/(dashboard)/dashboard/page.tsx` is 4 flat KPI tiles
  + recent list. Spec demands **bento 4-col grid** with:
  - KPI tiles with count-up animations + sparklines
  - Map card (farm distribution)
  - Activity bar chart
  - Associations donut chart
  - Weather card
  - Recent activity feed

**Blocked on**: `recharts` install. Time estimate: 2–3 days.

### 3.2 App shell (Web)
- Sidebar that **collapses** 248 → 74px with a footer toggle
- **Glass topbar** with breadcrumbs, ⌘K search trigger, theme toggle,
  account dropdown
- Wire `next-themes` provider for dark/light/system
- Use `cmdk` for the command palette

Time estimate: 2 days.

### 3.3 Missing field-work mobile screens
The blockers for actual farm-side use:
- `AddFarmScreen` with polygon editor (needs mobile map lib)
- `AddActivityScreen` with the 180-input picker spec
- `AcceptGRNScreen` (camera + barcode scanner)
- `FarmerProfileScreen` with 5 tabs (Farms/Crops/Activities/Samples/Documents)
- `FarmDetailsScreen` with tabbed Crops/Activities/Weather/Certificates
- Settings, Language picker (12), Theme picker, Sync Health, Notifications, About

Time estimate: 1–2 weeks.

### 3.4 Portal trace experience
- Photo hero ("Know exactly where your flowers grew")
- "Verified by Nesso" holographic shimmer card
- **Scroll-linked green-fill journey timeline** (framer-motion `useScroll`)
- Animated polygon draw farm card
- Raw-JSON peek link
- Auxiliary routes that don't exist: `/farmer/[id]`, `/farm/[id]`,
  `/about`, `/privacy`, `/raw/[code]`, invalid-code 404

Time estimate: 3–4 days.

### 3.5 Token + font hygiene
- Replace hardcoded hex in `MainTabs.tsx` (FAB) and `DashboardScreen.tsx`
  `RefreshControl` with token references
- Resolve `theme.css` vs `design-system.tokens.json` drift
  (`--bg`: `244 248 245` vs spec `#FAFDFA`; `primary.700`: `#207647` vs
  spec `#084E28`) — pick one source of truth
- Add `next/font` registration in `apps/web/src/app/layout.tsx` and
  `apps/portal/src/app/layout.tsx`
- Load Montserrat/Inter on mobile via `expo-font`

Time estimate: half a day.

---

## 4 · Polish gaps (visible-but-not-blocking)

- **No loading skeletons** anywhere — relies on RSC streaming
- **Empty states are text-only** ("No farmers yet.") — spec wants illustrations
- **No 403/404/500 system pages** beyond the Sentry-aware `global-error.tsx`
- **Farmer Profile**: spec shows avatar + stats grid + 5 tabs; we render
  4 plain info cards
- **Farms page**: spec shows tabbed Farm with map/Crops/Activities/
  Weather/Certificates/Soil; we render list + minimal detail
- **Activities**: spec shows calendar+list toggle; we render list only
- **Topbar**: no breadcrumbs, no theme toggle, no account dropdown — just
  role chip + bell + raw "Sign out" button
- **Splash screen** (mobile): plain text, no SVG logomark petal-bloom
  animation
- **OTP step**: single text input, spec wants 6 segmented inputs

---

## 5 · What IS done well

So this doesn't read as all-negative:

- ✅ Tokens correctly wired through `packages/design-system/tailwind-preset.js`
- ✅ Semantic Tailwind classes (`bg-bg`, `text-fg`, `border-border`) used consistently across web/portal/mobile
- ✅ Dark/light CSS-var system in `theme.css`
- ✅ Offline-first mobile sync, SQLite outbox, QR mint-on-GRN — all
  functional plumbing the prototype assumes
- ✅ Polygon editor on **web** (react-leaflet) — the one place spec-grade map work exists today
- ✅ Auth + RBAC + middleware-gated routes
- ✅ Farmer/Farm/Crop CRUD with approval workflows

---

## 6 · Recommendation

This is **2–4 engineer-weeks** of work for parity. If Phase 6 (paid cloud
+ deployment) starts before this, the demos will look thin.

**Suggested order if you do tackle it:**
1. Charts + bento dashboard (#3.1)
2. App shell with ⌘K + theme toggle (#3.2)
3. Portal trace polish (#3.4)
4. Token / font hygiene (#3.5)
5. Mobile field screens last (#3.3) — biggest, but lowest demo impact

Or: ship Phase 6 first with the current functional UI, then iterate on
visuals in Phase 7 / post-launch.
