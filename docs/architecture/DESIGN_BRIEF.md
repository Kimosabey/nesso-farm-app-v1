<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso" width="140" />

# Design Brief — Nesso Farm Traceability Platform

**Paste this entire file into your design Claude session.**
Project folder has been attached — read the docs first, then design.

</div>

---

## 0 · Your mission

You are designing the complete visual & interaction system for **Nesso**, a farm-to-fork traceability platform spanning a mobile app (Android + iOS), a web admin dashboard, and a public QR traceability portal.

I want a **modern, fluid, impressive, unique, world-class** design language — not another generic SaaS dashboard, not a default Bootstrap clone, not a flat-2017 throwback. Bring something that feels like 2026: confident typography, considered motion, fluid layouts, intentional restraint with bold moments.

You must produce designs that are **production-ready** — every screen ships against WCAG 2.2 AA, both light and dark themes, 12 languages, and a real-world audience of field officers using mid-range Android phones under sunlight.

> ### Stand-out mandate
>
> This app **must impress and stand out globally**. Not "another agri app." Not "good for India." World-class.
> The bar: a designer in San Francisco, Berlin, or Tokyo opens this on their phone and screenshots it for Twitter.
> Every screen earns its place. Every animation earns its frames. Every component is the best version of itself we've ever shipped.
>
> Use **only modern libraries** (full inventory in §11.5). No legacy, no jQuery-era patterns, no UI-Kit defaults.
> Reach for cutting-edge **CSS** (`view-transition-api`, `:has()`, container queries, scroll-driven animations, OKLCH, anchor positioning, popover API), modern **React** (RSC, transitions, suspense streams), and modern **motion** (Framer Motion layout, Reanimated 3 shared values, Lottie micro-interactions).
> See §11.6 for the wow-moment checklist.

---

## 1 · Read these first (in this order)

The full plan is already written. Internalize it before drawing anything.

1. [`README.md`](README.md) — what the project is
2. [`docs/plan/00-overview.md`](docs/plan/00-overview.md) — vision, personas
3. [`docs/plan/13-ux-accessibility.md`](docs/plan/13-ux-accessibility.md) — **the rulebook** — UX principles + WCAG 2.2 AA + motion safety
4. [`docs/plan/09-design-system.md`](docs/plan/09-design-system.md) — current token spec to extend / refine
5. [`docs/plan/14-screen-inventory.md`](docs/plan/14-screen-inventory.md) — **every screen you need to design** (~99 across mobile, web, portal)
6. [`docs/palette.txt`](docs/palette.txt) — validated brand palette
7. [`docs/plan/05-mobile-app.md`](docs/plan/05-mobile-app.md) — mobile screen list + navigation
8. [`docs/plan/06-web-dashboard.md`](docs/plan/06-web-dashboard.md) — web page list + layout
9. [`docs/plan/07-qr-portal.md`](docs/plan/07-qr-portal.md) — public portal
10. Skim each [`docs/plan/modules/*.md`](docs/plan/modules/) for screen-level UX flow and acceptance criteria

If anything in this brief conflicts with the WCAG / accessibility doc, the accessibility doc wins.

---

## 2 · Brand at a glance

### Logo
- File: `docs/nesso___nr_group_logo.jpeg`
- Use the logo as-is. Place it on solid brand backgrounds for splash; on white/porcelain for the login card; small mark in topbars.

### Validated palette (source of truth — `docs/palette.txt`)

| Token | Hex | Role |
|---|---|---|
| **Turf Green** | `#0D783C` | Primary brand · CTAs · active states · focus rings |
| **Turf Green 2** | `#207647` | Primary hover · gradient stop |
| **Golden Glow** | `#F1D412` | Accent · highlights · harvest CTAs · badges |
| **Jungle Teal** | `#518E6D` | Secondary · chips · secondary buttons · chart series 2 |
| **Porcelain** | `#FAFDFA` | Light theme background |
| **White** | `#FFFFFF` | Text/icons on primary |

Derive 50–950 scales per base in `oklch()` for perceptual uniformity. Full token map and dark-theme pairs are in `09-design-system.md` — use them as a starting point, not a ceiling.

### Typography
- Display: **Montserrat** (500 / 600 / 700)
- Body & UI: **Inter** (400 / 500 / 600)
- Code/IDs: **JetBrains Mono**
- Mobile fallback: system stack while bundled fonts load
- Tabular numerics for KPIs (`font-feature-settings: "tnum"`)

Consider a **variable** version of Inter & Montserrat for smoother weight transitions on hover/focus.

---

## 3 · Design language — the mood

Build a system that feels like this combination:

> **Linear's clarity** · **Stripe's restraint** · **Apple HIG's hierarchy** · **Material 3's expressiveness** · **Vercel's typographic confidence** — applied to an Indian agricultural product, with warmth.

### Concrete style anchors
- **Glassmorphism**, but tasteful — only on hero cards, modals, and the topbar shell. Never on data tables.
- **Bento-grid** dashboards on web (varied tile sizes, intentional rhythm)
- **Generous whitespace** — pad rows 12–16px, never pack
- **Editorial type** — large display sizes for KPIs (clamp(36px, 5vw, 64px)), tight tracking on headings (-0.01em)
- **Soft glows / auroras** on primary CTAs and the login hero (CSS-only, GPU-accelerated)
- **Layered depth** — three-tier elevation rhythm (cards → sheets → modals)
- **Rounded everything** — 12 / 16 / 20 / 28 px radii; only hairline dividers get square edges
- **Color-led status** with icon + label pairing (never color-only)
- **Big, friendly farmer photography moments** on the QR portal hero — but optimized & lazy
- **Custom illustrations** for empty states (160×120 SVG, brand palette)
- **3D-isometric splash** illustration (optional, single asset, ≤ 80 KB)

### Anti-patterns (do NOT ship)
- Default Bootstrap shadows, default Material elevation, default shadcn looks
- Neumorphism (a11y unfriendly)
- Parallax scroll, vestibular triggers, autoplay video
- Cliché stock photos (smiling farmers at golden-hour sunset, fake "diverse team" board-room shots, hands holding soil with shallow DOF) — imagery is allowed but must be earned, see §11.8
- Card-stack zooming UIs (impressive but unusable on low-end devices)
- "Glass" on text-heavy surfaces (kills readability)
- Skeuomorphic textures (paper, leaves, wood — tempting but tacky)
- Emoji as UI primitives
- Gradient text on body copy
- Animated background videos / particle fields

---

## 4 · Motion language

Motion is purposeful, never decorative-only. Every animation respects `prefers-reduced-motion` (web) and `AccessibilityInfo.isReduceMotionEnabled()` (mobile) — collapse to opacity-only when reduced.

### Tokens
| Token | Value | Use |
|---|---|---|
| `motion-fast` | 120ms · `cubic-bezier(0.4, 0, 0.2, 1)` | Hover, focus, icon swaps |
| `motion-base` | 200ms · `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `motion-slow` | 320ms · `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets, modals, layout |
| `motion-spring` | spring(stiffness 320, damping 30) | FAB press, drag, sortable |
| `motion-stagger` | 40ms / item | List entrance (cap 8 items) |

### Required motion patterns to design
1. **Page transitions (web)** — 200ms cross-fade + 8px y-slide on route change
2. **Bottom sheet entry (mobile)** — spring scale 0.96 → 1, backdrop fade
3. **List item entrance** — opacity 0→1, y +6→0, staggered
4. **Pull-to-refresh** — Reanimated elastic scale of a custom brand spinner
5. **FAB press** — scale 0.96, 80ms, haptic light
6. **KPI count-up** — tween from 0 to value over 600ms
7. **Skeleton shimmer** — linear-gradient sweep, 1400ms loop
8. **Toast slide** — bottom-in with bounce damping + dismiss progress bar
9. **Map polygon vertex** — pop in 120ms, scale 0.6→1
10. **Status chip transition** — soft cross-fade when an item changes state

### Libraries the design must work within
- Web: **Framer Motion** (variants, layout animations, `AnimatePresence`)
- Mobile: **react-native-reanimated 3** + **gesture-handler** + **@gorhom/bottom-sheet**
- Splash mascot: **Lottie** (≤ 80 KB JSON), single autoplay

---

## 5 · Themes

**Both themes are first-class.** Every screen designed twice; every component verified on both.

### Light theme
- Backgrounds in Porcelain (`#FAFDFA`) and pure white for elevated surfaces
- Primary text near-black `#0F1A14` (16.4:1 contrast)
- Brand green CTAs on white; accent yellow used sparingly for harvest moments

### Dark theme
- Backgrounds `#0A1410` (warm-tinted, never pure black)
- Elevated surfaces `#101C16`
- Brand green shifts to `#5DB683` for dark-on-dark contrast
- Glassmorphism shines here — soft glow halos around CTAs

### System
- Implicit third mode that follows `prefers-color-scheme`

The full audited contrast tables (light + dark) are in `13-ux-accessibility.md` §3.4. Honor every pair.

---

## 6 · Layouts

### Mobile (Expo + NativeWind)
- Single-column, safe-area aware
- Bottom-tab nav (5 tabs + center FAB, 60×60, brand green)
- Primary CTAs sticky bottom (thumb zone)
- Bottom sheets > centered modals for primary actions
- Glanceability under sunlight — high contrast, ≥ 18px body for KPIs

### Web (Next.js 15 + Tailwind + shadcn)
- Sidebar (256px expanded / 72px icon-only) + sticky topbar (64px)
- 12-column grid on `lg+`, gracefully stacks below
- Dashboard uses a **bento grid** — varied tile sizes for KPI / chart / map / feed
- Tables: dense on `md+`, stack-to-cards on `sm`
- Detail pages: profile panel left (320–400px), activity feed right
- Command palette (`Cmd/Ctrl+K`) on every page

### QR Portal (Next.js public)
- Mobile-first hero, generous type
- Single scroll page per trace code, no chrome
- "Verified by Nesso" trust mark prominent
- 8px CLS budget; sub-1.5s LCP on 3G

---

## 7 · Components to design (priority list)

Design these first, in this order, both themes, all states (default · hover · focus-visible · active · disabled · loading · error · readonly · empty).

### Primitives (Phase 0)
- Button (primary · secondary · ghost · outline · destructive · icon-only)
- Input (text · number · phone · email · password · search)
- Select / Combobox / MultiSelect
- DatePicker / DateRangePicker
- Card · Sheet · Modal · Dialog · Drawer · Popover · Tooltip
- Badge · StatusBadge · Avatar · AvatarGroup
- Toast (4 variants)
- Skeleton (list · card · chart shapes)
- EmptyState · LoadingState · ErrorState
- Tabs · Accordion · Stepper · Switch · Slider · Progress
- Tag input · Combobox · Command palette

### Composed (Phase 1)
- DataTable (sortable, filterable, virtualized, bulk-select, CSV export)
- FilterBuilder (URL-synced chip composer)
- Sidebar · Topbar · PageHeader · Breadcrumbs
- KpiCard with delta + trend
- Chart wrappers (Donut · Pie · Line · Bar · Area · Heatmap) using palette
- MapView (Leaflet skin: brand markers, polygon overlay style)
- PolygonEditor (vertex markers, hover affordance)
- CameraScanner (reticle + scan animation)
- FormField · FormSection · FormGrid
- TimelineList (stage histories, audit trails)
- CalendarView (activity scheduling)
- HierarchyTree (FPO → Agent → Farmers)
- ExportDialog · ConfirmDialog
- QRPreview · CopyableCode

### Surface-specific
- Mobile: AppShell · ScreenHeader · BottomSheet · CalendarStrip · OfflineBanner · SyncStatusChip · HelpTip · KpiChart
- Web: CommandPalette · KeyboardShortcuts overlay · NotificationBell · ThemeSwitcher · LanguageSwitcher

Full component contract in `09-design-system.md` §6.

---

## 8 · Screens to design (~99 total)

The full inventory is in [`docs/plan/14-screen-inventory.md`](docs/plan/14-screen-inventory.md) — every screen with priority (P0/P1/P2) and module reference.

### Start with these "hero screens" (high-impact, design-system-defining)

**Mobile**
1. Splash (with Lottie reveal)
2. Login (phone) → OTP Verify
3. Dashboard (KPIs + weather + quick actions)
4. Farmer List (search + filter + swipe-actions)
5. Register Farmer (multi-section sticky form)
6. Add New Farm (polygon editor + side sheet)
7. Add Activity (input picker modal with ~180 items)
8. Accept GRN (camera scanner overlay)

**Web**
1. `/login` (glass card + animated brand backdrop)
2. `/` Dashboard (bento grid: 4 KPI · 3 charts · interactive map · feed · weather)
3. `/farmers` (DataTable + filter builder + bulk actions)
4. `/farmers/[id]` (profile + tabs + activity feed)
5. `/farms/[id]` (interactive map polygon + tabs)
6. `/inventory/batches/[batchId]` (stageHistory timeline + QR + linked procurement)
7. `/reports/pre-harvest` (filter builder + export queue)

**QR Portal**
1. `/t/[code]` — the public trace page (hero · farmer · farm · crop · timeline · certifications · warehouse)

Once these define the language, the remaining 80+ screens are systematic application.

---

## 9 · Hard requirements

These are not negotiable.

### Accessibility — WCAG 2.2 AA (and AAA where cheap)
- Body text contrast ≥ 4.5:1; large/UI ≥ 3:1
- Focus rings visible (2px in `--ring`, 2px offset)
- Min 44×44 touch targets (WCAG 2.2 SC 2.5.8)
- Sticky headers/footers don't obscure focus (SC 2.4.11)
- Every drag has a tap/keyboard alternative (SC 2.5.7)
- No keyboard traps; ESC closes modals; focus returns to trigger
- All visible labels are part of the accessible name (SC 2.5.3)
- No more than 3 flashes/sec; no strobes
- Color never the only signal — pair with icon + label
- `prefers-reduced-motion` collapses non-essential animation
- Audited contrast tables in `13-ux-accessibility.md` §3.4 — meet every pair

### Internationalization
- Designed for 12 languages: EN, HI, KN, BN, TE, TA, ML, MR, OR, GU, TR, VI
- Native scripts in font sample; no missing-glyph boxes
- Text expansion budget: 1.4× English line length (German, Tamil tend to expand)
- Numbers, dates, currencies via `Intl.*` formatting
- Layouts RTL-ready (use logical CSS `start/end`, not `left/right`)

### Performance (UX-affecting)
| Surface | LCP | INP | CLS |
|---|---|---|---|
| QR portal `/t/[code]` | < 1.5s | < 100ms | < 0.05 |
| Web dashboard `/` | < 2.5s | < 150ms | < 0.10 |
| Web table pages | < 2.5s | < 200ms | < 0.10 |
| Mobile cold start | < 3.0s | – | – |

Designs that require massive assets or heavy compositing won't ship. Beautiful is cheap; *beautifully performant* is the bar.

### Audience constraints
- Field officers use phones in **sunlight + gloves + spotty network** — glanceability and high contrast win
- Many farmers are **low-literacy** — image-heavy, icon-supported, vernacular
- Many target devices are **low-end Android** — no GPU-burning effects

---

## 10 · Deliverables I need from you

For each priority screen and component:

1. **Figma frames** (or equivalent) — light + dark, both mobile (390 / 768 / 1024 / 1440 widths) and web breakpoints
2. **Design tokens JSON** — colors, spacing, radii, shadows, typography, motion durations & easings, ready to feed into Tailwind preset + NativeWind config
3. **Component states** for every primitive — default · hover · focus-visible · active · disabled · loading · error · empty · readonly
4. **Motion specs** — for each animation: timing function, duration, what reduces under reduced-motion
5. **Illustration set** — empty-state SVGs (160×120) in brand palette, splash logomark Lottie source
6. **Accessibility annotations** — focus order, ARIA labels, contrast ratios on each pair, keyboard shortcuts
7. **i18n notes** — flagging strings likely to expand; max line lengths
8. **Loom or short walkthrough** explaining the design language and trade-offs

Output a single **`design-system.tokens.json`** that engineers can import directly (Style Dictionary or W3C Design Tokens format).

---

## 11 · References that capture the right vibe

(Use as anchors, don't copy.)

- **Linear** — clarity, density, keyboard shortcuts UX
- **Stripe Dashboard** — typographic restraint, data hierarchy
- **Vercel Dashboard** — bento layouts, motion subtlety
- **Arc Browser** — playful but professional motion
- **Apple Wallet** — depth and material warmth
- **Things 3** — single-purpose primary actions, thumb zone
- **Things 3 / Notion mobile** — gesture-driven list interactions
- **Plant.id / iNaturalist** — agricultural-adjacent visual warmth
- **Indian fintech (Cred, Slice)** — for vernacular + warm motion in Indian context

---

## 11.5 · Modern library stack — the full kit

Every library here is current as of 2026 and approved. Designs must compose within this kit; nothing from outside lands without written justification.

### Web (Next.js 15 dashboard + QR portal)

| Concern | Library | Why it's here |
|---|---|---|
| App framework | **Next.js 15** (App Router · RSC · Server Actions · Partial Prerendering) | Streaming UI, instant TTFB, modern routing |
| Styling | **Tailwind CSS v4** (Oxide engine) | Token-driven, CSS-first config, `@theme` directive |
| Headless primitives | **Radix UI** | Accessibility built-in |
| Styled primitives | **shadcn/ui** | Copy-in, no runtime lock |
| Motion | **Framer Motion** (with layout animations, scroll-linked, `<MotionConfig reducedMotion>`) | The de-facto standard |
| Page transitions | **Next.js `view-transition-api`** + `AnimatePresence` | Native shared-element feel |
| Sheets / drawers | **Vaul** | Bottom sheet on web |
| Command palette | **cmdk** | Linear-style spotlight |
| Tables | **TanStack Table v8** + **TanStack Virtual** | Virtualized at 10k rows |
| Forms | **react-hook-form** + **Zod** | Shared schemas with backend |
| Charts | **Recharts** + **visx** for custom viz | Brand-skinned, performant |
| Maps | **react-leaflet** + **leaflet.markercluster** | OSM, no Google billing |
| Icons | **lucide-react** | 1.5px stroke, tree-shaken |
| Toasts | **sonner** | Stacked, swipeable |
| Carousel | **embla-carousel** | When (rarely) needed |
| Date | **react-day-picker v9** | Accessible, themeable |
| Rich text | **TipTap** | If activity notes ever need formatting |
| File upload | **react-dropzone** + S3 pre-signed | – |
| Confetti / micro-celebration | **canvas-confetti** | Rare, intentional |
| 3D / WebGL (optional hero) | **@react-three/fiber** + **drei** | If we do a 3D portal hero |
| Lottie | **lottie-react** | Splash + micro-interactions |
| A11y testing | **@axe-core/playwright**, **jest-axe** | CI-gated |
| Animations on scroll | Tailwind `scroll-driven-animations` + Framer Motion `useScroll` | Native CSS where possible |
| State (client) | **Zustand** | Tiny, no boilerplate |
| Server state | **TanStack Query v5** | Cache + invalidation |

### Mobile (Expo SDK 54 + RN 0.81)

| Concern | Library |
|---|---|
| Framework | **Expo SDK 54 + React Native 0.81** (New Architecture on) |
| Styling | **NativeWind v4** (Tailwind for RN) |
| Motion | **react-native-reanimated v3** + **react-native-gesture-handler v2** |
| Lists | **@shopify/flash-list** (1.6) — buttery scroll |
| Sheets | **@gorhom/bottom-sheet v5** |
| Skia for custom drawing | **@shopify/react-native-skia** — gradients, charts, splash mascot |
| Charts | **victory-native (Skia)** OR **react-native-svg-charts** |
| Forms | **react-hook-form** + **Zod** |
| Maps | **Leaflet in react-native-webview** (proven from FoodSign) |
| Camera | **expo-camera** (multi-format scanner) |
| Date | **@react-native-community/datetimepicker** |
| Splash | **expo-splash-screen** + **lottie-react-native** |
| Haptics | **expo-haptics** |
| Image | **expo-image** (built on libpag/SDWebImage, blurhash placeholders) |
| Push | **expo-notifications** + FCM |
| Storage | **react-native-mmkv** + **Expo SQLite** |
| State | **Zustand** + **TanStack Query** (persistor over MMKV) |
| Shared element | **react-native-shared-element** (Reanimated v3 compatible) |
| Blurs | **expo-blur** (native blur backdrops) |
| A11y | RN built-ins + **react-native-accessibility-engine** |

### Cross-platform helpers

- **Storybook 8 / Ladle** — design-system playground
- **Chromatic** — visual regression on every PR
- **Pa11y CI** + **axe-playwright** — a11y CI gate
- **Lighthouse CI** — performance budgets
- **Style Dictionary** — single tokens JSON → Tailwind preset + NativeWind + Figma plugin

> If a library you want isn't in this list, propose it with a one-paragraph justification: what it enables, what it replaces, bundle-size impact, maintenance health.

---

## 11.6 · Wow moments — signature interactions

A handful of these per surface are what make the app *memorable*. Use sparingly, with intent. Each must respect reduced-motion.

### Mobile — pick 5 to ship in v1
- **Animated splash** — Lottie logomark paints in (Skia variant); transitions to the first screen via shared-element fade
- **FAB pulse** — gentle 2s breathing glow when there's a queued harvest or pending approval
- **Bottom-sheet rubber-band** — over-drag has a subtle spring resistance
- **Pull-to-refresh** — custom Skia brand spinner (sprout unfurling), elastic
- **Polygon vertex drop** — Skia ripple at the touch point
- **KPI count-up** — tabular numerics animate from 0 with subtle blur clearing
- **Activity status chip** — soft cross-fade + tiny check-scale when marked complete
- **Toast** — slide-in with dismiss timer ring around the close button
- **Camera scan success** — green pulse around the detected code + haptic notification
- **Offline → online transition** — top banner morphs from amber "Offline" to brand-green "Synced 12 items" with a check tween
- **Theme switch** — view-transition cross-fade across the whole screen (Reanimated 3 + Skia)
- **Map fly-to** — `flyTo` ease with a soft zoom-blur frame on completion

### Web — pick 5 to ship in v1
- **Login hero** — animated CSS-only aurora (conic gradients, GPU-only) behind a glass card; logo subtly parallax-tilts to cursor
- **Sidebar item hover** — magnetic effect (item gently attracts cursor 4px) — only on `hover:hover` devices
- **Page transitions** — Next.js `view-transition-api` cross-fade; shared-element morph on detail-page entry (avatar grows from list row into the profile header)
- **Bento KPIs** — entrance stagger (40ms), count-up numbers, soft glow on hover
- **DataTable row hover** — left-border slides in (3px, brand green), row elevates 1px
- **CommandPalette** — Linear-style — fast, ranked, with recent items and `↑/↓/⏎`
- **Filter chips** — additive composer with a satisfying "snap-in" spring; chip dismissal collapses width with a damped spring
- **QR generation modal** — QR PNG paints in dot-by-dot (300ms), then settles
- **Chart hover** — soft glow on the active series; cross-fade tooltip with backdrop-filter blur
- **Export job complete** — bottom-right toast morphs into a download chip; click ripples
- **Notification bell** — silent badge breath when unread > 0
- **Theme switch** — `view-transition` "wipe" from the toggle origin
- **404** — bespoke illustration with a subtle parallax tilt on cursor move

### QR Portal — the show-stopper
- **Hero entry** — staggered reveal: farm photo crops in from center, type sets in below, timeline draws in dot-by-dot
- **Trust mark** — "Verified by Nesso" badge with a subtle holographic shimmer (CSS-only, motion-safe)
- **Timeline scroll-linked** — as the user scrolls, the active stage in the timeline highlights via scroll-driven animation (native CSS); polyline draws between completed stages
- **Farmer card** — photo loads with a blurhash placeholder, sharpens in
- **Farm polygon** — drawn live with SVG `pathLength` animation
- **Map "where is this farm"** — interactive mini-map zooms from district view to plot polygon on tap
- **Certifications** — badges stagger in with a soft pop and tap-to-reveal back-of-badge details (CSS `view-transition`)
- **Share** — native share sheet with a custom OG image generated server-side per code

---

## 11.7 · 2026 techniques to use

- **OKLCH color space** for perceptually uniform palette steps and accessible interpolation
- **CSS `:has()`** for parent-state-driven styling (e.g., focus-within forms)
- **Container queries** for component-level responsiveness
- **Scroll-driven animations (native CSS)** wherever motion-safe
- **`view-transition-api`** for page and theme transitions
- **Native popover & anchor positioning** for tooltips / menus
- **Variable fonts** for smooth weight/optical-size transitions
- **`color-mix()`** for runtime tints
- **`backdrop-filter`** for true glassmorphism
- **Skia on mobile** for GPU-accelerated custom UI (charts, splash, brand effects)
- **React Server Components + Suspense streaming** for instant TTFB
- **Server Actions** for mutation ergonomics without API boilerplate
- **Edge runtime** for QR portal trace pages (sub-100ms TTFB globally)
- **Partial Prerendering** in Next.js 15 for the dashboard shell
- **Blurhash / thumbhash** placeholders for every image
- **`expo-image`** with native caching, transitions, and priority hints

---

## 11.8 · Imagery & photography

Real photography earns its place. Use it where it lifts the experience; never as filler.

### Allowed sources (in order of preference)

1. **Field photos from Nesso / partner farms** (best — most authentic, when we have them)
2. **Unsplash** — free, project-related, hand-picked
3. **Pexels** — free, fallback
4. **Custom illustrations / SVG** — for empty states, marketing flourishes

### Strict selection criteria (Unsplash)

When picking from Unsplash, every image must:

- **Be project-relevant** — Indian / South-Asian agriculture context, the specific crop (tuberose, jasmine, marigold, rose, davana), warehouses, hands working, soil, harvest baskets, real fields
- **Look real, not staged** — documentary, not commercial; daylight, not golden-hour cliché
- **Show people respectfully** — never the "smiling farmer at sunset" trope; prefer process, hands, tools, environment over posed portraits
- **Be culturally accurate** — Indian farms, Indian dress, regional context (Karnataka, Tamil Nadu, Maharashtra, etc. depending on screen)
- **Have permissive licensing** — Unsplash license is fine; record the source URL in `docs/credits.md`
- **Pass tech requirements** — ≥ 2400px wide for hero, compressible to ≤ 200 KB AVIF / WebP

### Where imagery makes sense

| Surface | Use |
|---|---|
| **QR portal hero** | One large farm photo per trace page (the actual farm if we have it; placeholder field shot otherwise). Lazy-loaded, blurhash placeholder, AVIF + WebP fallback. |
| **QR portal farmer card** | Real farmer photo IF consent given; initials-avatar fallback. Never a stock face for a real farmer. |
| **Web `/login`** | Abstract / botanical illustration over the brand gradient — no faces. |
| **Web dashboard empty states** | Custom SVG illustrations, not photos. |
| **Web marketing pages** (about, privacy) | Honest editorial photos — process, fields, warehouses; never posed. |
| **Mobile splash & onboarding** | Vector illustrations only — no raster photos. Photo decoding hurts cold-start. |
| **Mobile screens** | No decorative imagery in the app body. Photos only when they're user content (farmer profile, ID proof, farm map, activity log). |

### Where imagery does NOT belong

- Mobile dashboard background
- Inside data tables
- Behind form fields
- As card backgrounds for KPIs
- Anywhere it competes with text for attention

### Performance rules

- Serve **AVIF** primary + **WebP** fallback + **JPEG** for ancient browsers
- Always specify `width` × `height` to prevent CLS
- **Blurhash** (or **thumbhash**) placeholder for every image
- `loading="lazy"` for below-the-fold; `fetchpriority="high"` for hero LCP image
- Use Next.js `<Image>` (web) and `expo-image` (mobile) — both handle modern formats, caching, and placeholders natively
- Cap hero image transfer at 150 KB on QR portal (3G budget)

### Attribution

Maintain a running `docs/credits.md` with `URL · Photographer · License · Where used`. Even when not required by license, we attribute by default.

### Custom illustrations

Where photos don't fit, commission or design custom SVG illustrations:

- **Style:** flat-geometric with soft brand-color gradients; subtle highlights; no outlines
- **Size:** 160×120 for empty states, 320×240 for onboarding moments
- **Palette:** strictly from brand tokens; one accent pop allowed
- **Format:** SVG (inline-able), optimized via SVGO

---

## 12 · Process — how to work with me

1. **Day 1–2:** Read the docs, produce a one-pager mood-board with the design language thesis. I'll confirm direction.
2. **Day 3–5:** Token system, primitives in both themes, animation language reel.
3. **Week 2:** Hero screens (the 8+7+1 above).
4. **Week 3+:** Roll out remaining screens systematically.

After each batch, deliver:
- Updated Figma / token JSON
- Annotated screens (rationale for novel choices)
- Open questions
- Trade-off log

---

## 13 · Open questions you should answer

Surface these in your first reply so we align early:

1. Which **mood pillar** do we lean hardest into — *editorial / glass / bento / soft-skeuo* — or a unique synthesis you propose?
2. Is the **dark theme** the marketing default (as the original Nesso PRD suggested with glassmorphism) or do we open with light?
3. **Splash mascot** — abstract logomark animation, or a small agricultural illustration (sprout, leaf, hand)?
4. **Logo treatment** — do we evolve the supplied JPEG into a vector? Re-do for monochrome usage?
5. **Custom illustration style** for empty states — flat geometric, isometric, or hand-drawn?
6. **Charts** — do we adopt a unique chart aesthetic (rounded bar caps, soft gradients, no axis lines) or stay convention-safe?
7. **Cursor / focus motion** on web — any signature interaction (e.g., magnetic CTAs, hover halos)?

---

## 14 · What success looks like

When this design ships:

- Field officers say "this is the first ag app that doesn't feel like government software"
- A consumer scans a QR and says "this looks like a real brand, not a tax receipt"
- Accessibility audit passes WCAG 2.2 AA with zero violations
- Dev team can build a screen in a day because the system is rigorous
- The design wins a thing — Awwwards Honorable Mention or Mobbin feature is the bar

---

<div align="center">

<sub><strong>Project context:</strong> Modern offline-first farm-to-fork traceability platform for India.</sub>

<br />

<sub><strong>Audience:</strong> Field officers, farmers, admins, consumers · 12 languages · Android-first.</sub>

<br />

<sub><strong>Source of truth:</strong> the <code>docs/plan/</code> folder you already have. Always defer to <code>13-ux-accessibility.md</code> when in doubt.</sub>

<br /><br />

<img src="docs/nesso___nr_group_logo.jpeg" alt="NR Group" width="60" />

<br />

<sub>NESSO · NR Group · © 2026</sub>

</div>
