<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Performance & Optimization Plan

**Concrete, prioritized improvements across API, Web, Portal, Mobile.**
Each item: what, why, effort (S/M/L), and the win.

</div>

---

## Priority 0 — quick wins (do first, all S)

| # | Area | Change | Win |
|---|---|---|---|
| 0.1 | API | Add Mongo indexes on hot query fields: `farmers.approvalStatus`, `farms.farmerId`, `crops.farmId`, `activities.{farmId,scheduledOn}`, `procurements.paymentStatus`, `inventory.status`. Several exist; audit + fill gaps. | List/stats endpoints go from collection-scan to index-hit |
| 0.2 | API | `.lean()` on all read-only list queries (skip Mongoose hydration). | ~2-4× faster list serialization |
| 0.3 | Web | Mark dashboard/list pages `export const revalidate = 30` or `dynamic = 'force-dynamic'` deliberately; today some refetch every hit. | Fewer API calls, faster TTFB |
| 0.4 | Web | `next/font` (already on landing) everywhere — kill layout shift + FOUT. | CLS → ~0 |
| 0.5 | Mobile | Memoize list row components (`React.memo`) in Farmers/Farms/Activities; they re-render on every parent state tick. | Smoother scroll on low-end phones |
| 0.6 | All | Turn on Turborepo remote-cache-free local caching for `build`/`typecheck` (already using turbo) — ensure outputs are declared. | Faster CI + local rebuilds |

---

## Priority 1 — API (NestJS)

- **Pagination defaults**: enforce `pageSize` cap (≤100) on every list endpoint; reject unbounded queries. (Some already do — audit all.)
- **Projection**: return only fields the UI needs (`.select()`), especially farmers/farms list — drop heavy nested subdocs from list payloads, keep them on detail.
- **Stats via aggregation**: `farmers/stats`, `procurement/stats` etc. should use a single `$group` aggregation, not N `countDocuments` calls. (`farmers.countByStatus` already aggregates — replicate the pattern.)
- **Compression**: `compression()` is wired ✅. Confirm gzip/br on JSON responses.
- **Connection pool**: set Mongoose `maxPoolSize` (default 100 is fine local; tune for Atlas in Phase 6).
- **Redis caching** (Phase 6 has Redis): cache `catalog/*` (rarely changes) + weather proxy responses (currently in-memory 1h — move to Redis so it survives restarts + scales horizontally).
- **DataLoader / batch**: if any endpoint N+1s farmer lookups per row, batch them.

## Priority 2 — Web (Next.js dashboard)

- **Server Components by default** — keep tables' data-fetch on the server, ship only the interactive table as a client island (already the pattern; verify no page is over-clientized).
- **recharts is heavy (~400 KB)** — it's only on the dashboard. Confirm it's not pulled into other routes; `dynamic(() => import(...), { ssr:false })` the chart cards so they don't block first paint.
- **`@tanstack/react-table`** — fine, tree-shakes well. Virtualize tables only if rows exceed ~200 (add `@tanstack/react-virtual` then).
- **Image optimization**: use `next/image` for any real photos (KYC, farm) in Phase 6; today logos are tiny.
- **Route-level code splitting**: App Router does this automatically; verify no giant shared client bundle via `next build` output (watch First Load JS per route — keep < 200 KB).
- **Sentry tunnel** (`/monitoring`) is on — confirm it isn't adding latency to first paint (it shouldn't; it's lazy).

## Priority 3 — Portal (public, SEO + speed critical)

- **Static/ISR the trace pages**: `/[locale]/t/[code]` should be ISR (`revalidate`) — a batch's trace rarely changes after mint. Cuts API load + makes scans instant.
- **framer-motion**: the scroll-linked timeline is the only heavy bit — it's already client-only on the trace page. Keep landing/about/privacy as pure RSC (no motion bundle).
- **Metadata + OG tags**: add per-trace `generateMetadata` (crop, farm) for shareable QR links.
- **Edge runtime** for the trace fetch (Phase 6) — serve from the nearest region.

## Priority 4 — Mobile (Expo / RN)

- **FlatList tuning**: set `initialNumToRender`, `windowSize`, `removeClippedSubviews`, `getItemLayout` (fixed-height rows) on Farmers/Farms/Activities/Inventory lists.
- **Memoize**: `React.memo` row components + `useCallback` renderItem; stable `keyExtractor`.
- **Image**: switch the logo + any photos to `expo-image` (already a dep) for caching + faster decode.
- **Hermes**: confirm Hermes engine on (default in SDK 54) — already bundling `.hbc`. ✅
- **Reanimated worklets**: animations (splash bloom, FAB pulse, count-ups) — keep on the native driver (`useNativeDriver: true`); the count-up uses setInterval+setState which can jank — consider moving to `requestAnimationFrame` or reanimated `withTiming` for buttery counts.
- **SQLite outbox**: batch drains (already does); add an index on the outbox `status` column if not present.
- **Bundle size**: 3,400 modules → ~7-8 MB Hermes. Audit with `npx expo export --dump-sourcemap` + source-map-explorer; lucide-react-native imports should be per-icon (named) not the whole set. ✅ (we import named icons).
- **Theme/i18n context**: both are top-level providers — fine; ensure consumers don't over-subscribe (selector pattern if a screen re-renders too often).

## Priority 5 — build & CI

- **Turbo pipeline**: declare `outputs` for `build` (`.next/**`, `dist/**`) so caching works; `typecheck` + `lint` cache on inputs.
- **tsc incremental**: `incremental: true` is set for Next; ensure `.tsbuildinfo` is gitignored (it is) and cached in CI.
- **CI matrix**: run the 4 apps' typecheck/lint/test in parallel jobs (already structured per-app via filters).
- **EAS build caching**: enable EAS's `cache` for node_modules to speed cloud builds.

---

## Measurement (do before + after, so wins are real)

| Surface | Tool |
|---|---|
| API | `autocannon` or `k6` against `/farmers`, `/dashboard` stats; watch p95 latency |
| Web/Portal | `next build` First-Load-JS report + Lighthouse (LCP/CLS/TBT) |
| Mobile | React DevTools Profiler + Flipper; FPS during list scroll on a mid-range Android |
| DB | Mongo `explain()` on the hot queries — confirm `IXSCAN` not `COLLSCAN` |

---

## Suggested execution order

1. **P0 quick wins** (½ day) — indexes, `.lean()`, FlatList tuning, memoization
2. **P1 API** projections + aggregation stats (1 day)
3. **P4 Mobile** list + animation tuning (1 day)
4. **P3 Portal** ISR + metadata (½ day)
5. **P2 Web** chart code-split + bundle audit (½ day)
6. **P5 build/CI** caching (½ day)
7. Re-measure → lock in a perf budget (API p95 < 150ms local; web LCP < 2s; mobile 60fps lists)

None of this blocks current functionality — it's all incremental hardening.
