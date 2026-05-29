# Handoff: Nesso — Farm-to-Fork Traceability Design System

## Overview
Nesso is an offline-first farm-to-fork traceability platform for Indian horticulture (NR Group). This package is the **complete design system and high-fidelity prototype set** for three surfaces:
- **Mobile app** — the field-officer tool (register farmers, map farms, log activities, scan GRNs, post-harvest).
- **Web dashboard** — the admin/FPO back-office (approvals, farmers, farms, activities, quality, procurement, inventory, reports, settings).
- **Public QR portal** — the consumer-facing trace page opened by scanning a batch QR.

Design language: **"Cultivated Clarity"** — editorial typography + a bento dashboard rhythm, glass used only on chrome/heroes, warmed by the brand's green-and-gold botanical palette. Light is the in-app default (sunlight/glove legibility); dark is a fully-audited first-class theme.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via in-browser Babel)** — prototypes that show the intended look, motion, and behavior. They are **not production code to copy directly.**

The task is to **recreate these designs in the target codebase's environment**, per the project's plan:
- **Mobile:** Expo + React Native + TypeScript (NativeWind for styling).
- **Web:** Next.js + React + TypeScript (Tailwind v4).
- **Portal:** Next.js (public, SSR/SSG, dynamic `/t/[code]` route).
- **Shared:** a `packages/design-system` consuming the included `design-system.tokens.json`.

Use the established patterns/libraries of each app. Mocked data, `localStorage` persistence, decorative QR/SVG maps, and fake auth in the prototypes must be replaced with real APIs, a real auth/OTP backend, and a real map library (Leaflet/MapLibre or Google Maps).

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, motion, and interactions are specified. Recreate the UI pixel-faithfully using each codebase's component library, driving all values from the design tokens. Where a prototype tab shows representative sample data, treat the *layout/component* as the spec and wire real data in.

## Design Tokens
Authoritative source: **`design-system.tokens.json`** (W3C Design Tokens format, in this bundle). Summary:

### Color — brand
- Turf Green (primary) `#0D783C` · Primary-2 `#207647` · Primary-300 `#5DB683` · Primary-50 `#EAF6EE`
- Golden Glow (accent) `#F1D412` · Jungle Teal (secondary) `#518E6D` / deep `#3C6B51`

### Color — light theme
- bg `#F4F8F5` · bg-elevated `#FFFFFF` · bg-muted `#EEF3F0`
- fg `#0F1A14` · fg-muted `#4A5A52` · fg-subtle `#7A8A82`
- border `#E2EAE5` · border-strong `#C9D6CE` · ring `#0D783C`
- warning `#9A8407` (bg `#FBF5D6`) · danger `#B42318` (bg `#FBEAE8`) · info `#0E7490`
- glass-bg `rgba(255,255,255,0.72)` · glass-border `rgba(13,120,60,0.12)`

### Color — dark theme
- bg `#080F0B` (mobile app uses `#0A1410`) · bg-elevated `#0F1A14` (mobile `#101C16`) · bg-muted `#152219`
- fg `#FAFDFA` · fg-muted `#A8B7AE` · fg-subtle `#73837A`
- border `#1E2C24` · border-strong `#32433A` · ring `#5DB683`
- primary `#5DB683` · accent `#F8E353` · on-primary `#06140C`
- warning `#F8E353` · danger `#FF6B5B`

### Typography
- Display: **Montserrat** 500/600/700, letter-spacing −0.02em (headings, KPIs, wordmark)
- Body: **Inter** 400/500/600
- Mono: **JetBrains Mono** 400/500 (IDs, numbers, coordinates, timestamps; tabular-nums on KPIs)
- Scale (px / line-height): xs 12/18, sm 14/22, base 16/26, lg 18/28, xl 20/30, 2xl 24/34, 3xl 30/38, 4xl 36/44, 5xl 48/56

### Spacing — 4px grid
4, 8, 12, 16, 20, 24, 32, 40, 48

### Radius
sm 4 · md 8 · lg 12 · xl 16 · 2xl 20 · 3xl 28 · full 9999

### Shadow (light)
- sm `0 1px 3px rgba(13,40,22,.05)`
- md `0 10px 30px -10px rgba(13,40,22,.16)`
- lg `0 28px 60px -16px rgba(13,40,22,.24)`
(dark: same offsets, `rgba(0,0,0,.4 / .6 / .7)`)

### Sizing
- Min touch target **44×44px** (WCAG 2.2 SC 2.5.8); FAB 62px
- Web sidebar 248px expanded / 74px collapsed; topbar 64px

### Motion
- Durations: fast 120ms · base 200ms · slow 320ms · stagger 40ms
- Easing: emphasized `cubic-bezier(.32,.72,0,1)` (sheets/modals/push-nav/FAB) · standard `cubic-bezier(.4,0,.2,1)` (hovers/color/opacity)
- Spring (drag/FAB/sortable): stiffness 320, damping 30
- **Only animate `transform` and `opacity`** (compositor-only — keeps low-end Android at 60fps). Everything must collapse under `prefers-reduced-motion`.

## Screens / Views
See **SCREENS.md** in this bundle for the full per-screen breakdown (layout, components, copy, states). High-level inventory:

**Mobile (~32):** Splash (logomark bloom) · Login (+91) · OTP (6-digit) · Dashboard · Farmers · Verify · Farms · Register Farmer (4-step) · Add Farm (polygon editor) · Add Activity (180-input picker) · Accept GRN (scanner) · Settings · Language (12) · Theme/a11y · Sync Health · Notifications · About · Weather · Harvest Board · Activities · Pre-harvest · Add Crop · Farmer Profile · Farm Details · Post-harvest · Batches · Inventory · Procurement · Samples · Audit · Location picker · Offline maps.

**Web (~21):** Landing · Login · Dashboard (bento) · Approvals · Farmers (table) · Farmer Profile · Farms · Farm · Activities (calendar+list) · Activity detail · Pre-harvest · Quality (Samples/Audits) · Procurement · Warehouses · Inventory ledger · Batch · QR generator · Reports · Settings · Notifications · 403/404/500.

**Portal (7):** Landing · Trace · Farmer · Farm · About · Privacy · Raw JSON · invalid-code 404.

## Interactions & Behavior
- **Mobile nav:** 4 bottom tabs + center FAB (Register). Detail screens push in (`translateX` 320ms emphasized). Bottom sheets for create flows. iOS/Android frame toggle (Dynamic Island vs punch-hole).
- **Web nav:** collapsible sidebar, glass topbar, **⌘K command palette** (Cmd/Ctrl+K), breadcrumbs, account-menu dropdown with **logout**.
- **Auth flows:** Mobile Splash→Login→OTP→app; logout (Settings) → Login. Web Landing→Sign in→Login→Dashboard; account menu→Logout→Landing.
- **Signature interactions:** logomark petal-bloom splash (reused as sync/refresh); count-up KPIs (rAF); magnetic primary CTA + golden hover halo (web, gated to `hover:hover` + motion-safe); scroll-linked journey fill on the portal trace timeline; tap-to-drop polygon farm editor with live hectare (shoelace) calc.
- **States:** empty (flat-geometric illustrations), loading, error, offline; status semantics carry **icon + label**, never color alone (color-blind safe).

## State Management
Per app, replace prototype `localStorage` with real state:
- Auth/session (OTP for field officers, email/password for staff), role (Field Officer / Admin / Verifier).
- Offline-first sync queue (outbox with pending/failed/retry) — see mobile Sync Health screen.
- Theme (persisted, follows `prefers-color-scheme`), language (12 locales, i18n).
- Domain entities: Farmer, Farm (polygon geometry), Crop, Activity (+inputs catalog ~180), Sample, Audit, Batch (stage history), Procurement, Warehouse, Inventory movement.

## Assets
- **Logo:** `assets/nesso-logo.jpeg` (supplied raster). Vectorize to SVG — variants documented in *Nesso Design Ops.html*: full color, reverse/knockout (white on green), monochrome, rounded-squircle app icon. Geometry: 5 leaf-petals (clover) around a golden essence-drop.
- **Icons:** lucide-style 1.7px stroke set, drawn inline in the prototypes — replace with `lucide-react` / `lucide-react-native`.
- **Illustrations:** flat-geometric empty states (inline SVG, soft brand gradients, no outlines, one accent pop) — see Design Ops.
- **Fonts:** Montserrat, Inter, JetBrains Mono (Google Fonts).
- **Maps:** stylized SVG placeholders — replace with a real tile library + GeoJSON farm polygons.

## Files (in this bundle)
- `Nesso Index.html` — front door linking all deliverables
- `Design Language Thesis.html` — direction + the 7 design decisions
- `Nesso Mobile.html` + `app/*.jsx` — mobile prototype (ui, screens_auth, screens_main, screens_create, screens_create2, screens_settings, screens_feature, screens_detail, screens_quality)
- `Nesso Web.html` + `web/*.jsx` — web prototype (web_ui, web_viz, web_landing, web_pages, web_pages2, web_pages3, web_pages4)
- `Nesso QR Portal Family.html` — public portal (7 hash-routed views)
- `Nesso Design Ops.html` — logo set, illustrations, motion spec, WCAG 2.2 AA annotations
- `design-system.tokens.json` — W3C design tokens (authoritative)
- `assets/nesso-logo.jpeg` — source logomark

## Accessibility (WCAG 2.2 AA — must hold in implementation)
- Audited contrast pairs (see Design Ops); body-on-bg ≥ 16:1, CTA text ≥ 5.6:1.
- 2px brand-green focus ring, 2px offset, never removed; full keyboard reachability; Esc closes overlays.
- Labels on all inputs and icon-only buttons; live-region toasts; respects `prefers-reduced-motion`, scales to 1.4× text.
