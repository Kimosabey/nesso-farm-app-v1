<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Roadmap & Pending — what's done, what's optional next

**Single source of truth for remaining work. Nothing here is broken; all
items are enhancements or your-side testing. Check off as completed.**

Last updated: 2026-05-31

</div>

---

## ✅ DONE (shipped + committed)

- **All 60 screens** built to design-handoff parity (mobile 32, web 21, portal 7)
- **Dark / light mode** consistent across every surface (mobile `useTheme()`, web/portal `[data-theme]` tokens)
- **i18n** runtime + live switching; en/hi/kn for core strings (login, tabs, dashboard, settings, farmers)
- **Modern toast** system on mobile (replaces blocking Alert); inline-error + diagnostics on login
- **Polish pass**: empty states (EmptyState), loading skeletons (web loading.tsx + mobile ListSkeleton), press-feedback, sectioned+validated web forms
- **Complex screens animated**: AddFarm (vertex pop, hectare count-up), AddActivity (input picker), AcceptGRN (reticle sweep + success check), splash bloom, dashboard count-ups
- **Data**: local Mongo seeded — admin + 18 role users + realistic demo (farmers/farms/crops/activities/samples/audits/procurement/inventory/QR). All screens pull real API data.
- **Auth**: password login (all UIs) + Firebase OTP fully wired (both test numbers → real users, backend verified)
- **Sentry** live (API event confirmed); **Firebase backend** verified
- **CI-clean**: all 4 apps typecheck; web+portal build; mobile bundles

---

## 🟡 PENDING — optional enhancements (priority order)

### P1 · Modern UI libraries (biggest visual uplift) — see `UI_LIBRARIES_PLAN.md`
- [ ] **Mobile: moti** — declarative entrance/press animations app-wide (partially done via Animated; moti makes it 1-liner + spring-consistent)
- [ ] **Mobile: lottie-react-native** — hero moments: splash seed-bloom, approve/GRN success ticks, empty-state illustrations, weather glyphs
- [ ] **Mobile: @gorhom/bottom-sheet** — replace the ad-hoc `Modal` sheets (Inventory move, Add Activity input picker) with spring sheets
- [ ] **Mobile: @shopify/flash-list** — swap FlatList on long lists (Farmers/Farms/Activities/Inventory) for recycling perf
- [ ] **Mobile: datetimepicker** — native date pickers in AddCrop/AddActivity (replace YYYY-MM-DD text)
- [ ] **Web: shadcn/ui** — adopt Dialog/DropdownMenu/Tabs/Select/Switch/Tooltip/AlertDialog (replace hand-rolled account dropdown, profile tabs, settings switches) — BIGGEST web consistency win, but a deliberate multi-file rework
- [ ] **Web: sonner** (installed) — standardize web toasts (replace any alert)
- [ ] **Web: react-hook-form** — upgrade the 3 sectioned forms to RHF + zod resolver for richer validation

### P2 · Performance & optimization — see `PERFORMANCE.md`
- [x] **Mongo indexes** on hot fields — audited; all compound hot-path indexes present (farmers.approvalStatus+isDeleted, farms.farmerId+isDeleted, crops.farmId+isDeleted & farmerId+year, activities.farmId+scheduledOn & status+scheduledOn, procurement.status+date & paymentStatus, inventory.status+date, samples/audits/notifications compound). No gaps.
- [x] **`.lean()`** on all read-only API list queries — verified present in every service `list()` + reports.
- [x] **Stats via `$group` aggregation** (not N countDocuments) — farmers/activities/procurement/samples/inventory all aggregate.
- [x] **Web**: `dynamic()` import recharts Bars+Donut — recharts now a lazy chunk; dashboard route own-JS 6.21 kB (charts stream in behind a sized shimmer, no CLS).
- [x] **Portal**: ISR `revalidate=300` on all trace pages + `generateMetadata` OG/Twitter tags on `t/[code]` (rich WhatsApp/Twitter previews for shared QR links; fetchTrace is request-deduped so no extra round-trip).
- [x] **Mobile**: FlatList tuning — shared `listPerf` props (removeClippedSubviews[android], initialNumToRender, maxToRenderPerBatch, windowSize) spread into all 9 long-list screens.
- [ ] ~~**Projections** (`.select()`)~~ — **deliberately deferred**: trimming list payloads risks breaking UIs that read full objects (district/amounts/subdocs) for marginal gain at demo-data scale. Revisit only if a list grows large in prod.
- [ ] **Mobile**: migrate count-up setInterval → reanimated `withTiming` (minor; current setInterval works)
- [ ] **Redis caching** (Phase 6): catalog + weather proxy
- [ ] **Turbo/EAS build caching**

### P3 · Functional gaps
- [ ] **Per-role web nav gating** — today any logged-in user sees the full shell; API enforces writes. Add role→nav-item visibility (hide Settings/Reports for field roles, etc.)
- [ ] **i18n full coverage** — migrate remaining ~25 screens' inline English → `t()` keys; translate hi/kn (+ the other 9 locales scaffolded). Big content task; infra is ready.
- [ ] **Refresh-token rotation in Redis** (Phase 1.5 — blacklist exists; rotation is a hardening follow-up)
- [ ] **Real document uploads** (KYC photos, farm photos) — S3 presign exists in API; wire mobile camera → upload in dev build
- [ ] **Web Login glass-aurora polish** (functional; spec wants the aurora card treatment)

### P4 · Testing (your side — guides ready)
- [ ] **All 18 role logins** — `docs/TESTING_ROLES_AND_OTP.md` §1-4
- [ ] **OTP end-to-end** — needs `npx expo run:android` dev build, then §6
- [ ] **Mobile on device** — Expo Go for password flows; dev build for OTP/native
- [ ] **Sentry events** — trigger `/debug/sentry/throw`, confirm in dashboard
- [ ] **API smoke** — `pwsh ./scripts/smoke-test-api.ps1` (43 checks)

### P5 · Phase 6 (production — paid, deliberate) — ⛔ ON HOLD
> **Do NOT start any Phase 6 / production item until the user explicitly says so.**
> (User directive, 2026-05-31.) Everything below stays untouched until then.

- [ ] MongoDB Atlas, AWS S3, Redis Cloud, Vercel (web+portal), API host (Render/Fly), domain + DNS
- [ ] Sentry source-map upload (`SENTRY_AUTH_TOKEN`) + release tagging
- [ ] EAS production builds + store submission
- [ ] GitHub Actions CI (typecheck/lint/test on PR, deploy on main)
- [ ] Remove `/debug/*` routes (see TESTING.md §6)
- [ ] Backups + uptime monitoring

---

## Reference docs
| Doc | Covers |
|---|---|
| `UI_LIBRARIES_PLAN.md` | which modern libs, what they replace, migration order |
| `ANIMATION_UX_PLAN.md` | per-screen micro-animations, Lottie, toast |
| `PERFORMANCE.md` | P0-P5 optimization plan + measurement |
| `POLISH_PUNCHLIST.md` | inner-page polish gaps (mostly done now) |
| `TESTING_ROLES_AND_OTP.md` | every role→UI→login + OTP flow |
| `FIREBASE_LOCAL_PLAN.md` | Firebase local/dev/build setup |
| `SCREEN_PARITY.md` | 60/60 screen tracker |
| `RUNBOOK.md` | services, ports, logs, known-issue fixes |
