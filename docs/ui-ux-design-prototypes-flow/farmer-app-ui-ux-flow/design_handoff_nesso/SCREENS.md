# Nesso — Per-Screen Breakdown

Driving values come from `design-system.tokens.json`. This doc covers layout, key components, copy, and states for each screen. Recreate in Expo/RN (mobile), Next.js (web/portal). Sample data shown is representative — wire real data; treat layout/components as the spec.

---
## MOBILE (Expo + RN + NativeWind) — design canvas 392×850

### Splash
Full-bleed radial green gradient (`#207647→#0D783C→#06401f`). White coin (108px) center; logomark blooms petal-by-petal (stagger 40ms, emphasized easing), golden drop swells last; wordmark "NESSO" (Montserrat 700, letter-spacing .16em, white) + tagline "Farm to fork, verified" rise in. Bottom: spinner + `v1.0 · NR Group`. Auto-advance ~2.6s or tap. Reduced-motion → static lockup.

### Login
Top: language chip ("🌐 EN") + theme toggle. Logo tile 60px. H1 "Welcome to Nesso" (Montserrat 700, 34px). Body copy. Field: "Mobile number", prefix `+91`, mono, 10-digit (regex `^[6-9]\d{9}$`), hint "Standard SMS rates may apply." Sticky bottom CTA "Send OTP" (disabled until valid) + Terms/Privacy line. 54px field height, 56px CTA.

### OTP
Back chevron. H1 "Verify your number". Masked target `+91 ••••• ´last3`. Six segmented inputs (1 char each, auto-advance, backspace-to-prev, mono 24px); active = 2px ring. Resend cooldown 30s → "Resend code". Sticky "Verify & continue" (enabled when all 6 filled).

### Dashboard
Scroll. Header: avatar (→Settings) · "Good morning" + role chip "Field Officer" · name · theme toggle · bell w/ red dot (→Notifications). Sync chip "All synced · 2 min ago". Weather hero card (gradient, location, 27°, spraying-window note, 4-day strip; →Weather). "This season" + season picker. 2×2 KPI grid (Farmers 1,284 ↑12 / Farms 942 ↑8 / Active crops 376 / Pending 23 ↓4) — count-up, sparklines. Quick actions ×4 (Register / Add farm / Activity / Scan GRN). Module rail (chips: Harvest, Activities, Pre-harvest, Post-harvest, Samples, Procurement). Recent activity list. Bottom tab bar (glass) + pulsing FAB.

### Tabs: Farmers / Verify / Farms
- **Farmers:** PageTop "Farmers" + count. Search field + filter chips (All/Approved/Pending/Rejected). Cards: avatar, name, village·crop, ID·area, status pill, chevron → Farmer Profile.
- **Verify:** tabs Pending/Approved/Rejected. KYC cards: avatar, name, village·crop·area, KYC chip; doc strip (Aadhaar/Bank/Docs); Reject (outline) / Approve (primary) → toast.
- **Farms:** search; cards with polygon thumbnail, name, village, crop+area chips → Farm Details.

### Register Farmer (4-step sticky form)
Progress bar (Personal/ID/Bank/Consent). §1 name, gender segmented (Female/Male/Other), +91 mobile. §2 ID type segmented, Aadhaar number, front/back photo tiles. §3 account no, IFSC (hint ABCD0123456). §4 crop multi-select chips. Consent checkbox. Sticky "Save farmer" (disabled until name+10-digit+consent). "Saved offline — syncs when online."

### Add Farm (polygon editor)
Full-screen faux map (Standard/Satellite toggle). Tap to drop vertices (pop animation); undo/clear floating buttons; "Use my current location". Live bottom sheet: area in ha (shoelace), vertex count; CTA "Add N more corners" → "Save farm boundary" (needs ≥3). Replace with real map + GPS.

### Add Activity (+ input picker)
Activity type grid (Spraying/Fertilizer/Irrigation/Weeding/Harvest/Scouting). Date + farm row. Inputs card: add (opens picker sheet — search "180+ inputs", category tabs Chemical/Organic/Inventory/Other, rate/unit), qty steppers, running total. Photo + Geotag tiles. Sticky "Log activity" → toast.

### Accept GRN (scanner)
Dark camera view, corner reticle + sweeping scan-line, flash toggle, format chips (QR/EAN-13/PDF417/Aztec/DataMatrix). Tap reticle simulates detect → green check → confirm bottom sheet (batch code, crop·grade, qty, supplier, farm) → "Accept GRN".

### Settings & system
- **Settings:** profile card (avatar, name, +91, role); groups — Account (Associations, Cluster), App (Language, Theme & display, Notifications, Sync health ·2 queued, Offline maps), Support (Help, About v1.0), Log out (danger → returns to Login).
- **Language:** search + 2-col grid of 12 (native + English name), selected = 2px ring + check.
- **Theme & display:** Light/Dark/System cards; a11y toggles (Reduce motion, Larger text, High contrast).
- **Sync Health:** outbox hero (count), "Sync now", queue rows (pending/failed → Retry).
- **Notifications:** Today/Earlier groups; icon, title, sub, time, unread dot.
- **About:** logo, NESSO, tagline, version, links (Privacy/Terms/Support/Licenses).

### Field/detail
- **Weather:** big current card (56px temp), hourly strip, spraying-window banner, 7-day list.
- **Harvest Board:** Today/Tomorrow/Planned groups; cards (farm, farmer·crop, expected kg, distance, Navigate).
- **Activities:** Pending/Approved tabs; type-icon rows.
- **Pre-harvest:** tabs Report (4 stat tiles + crop rows w/ "due soon"/"on track") / Activities / Crop history.
- **Add Crop:** crop chips, variety, type segmented, area+unit, sow/harvest dates, options toggles (multi-harvest, PoP).
- **Farmer Profile:** header (avatar, FPO, KYC chip), 3 stats, tabs Farms/Produce/Financial/Inventory; sticky Reject/Approve.
- **Farm Details:** map, stat grid, tabs Crops/Activities/Weather/Certificates/Soil; sticky Add crop.
- **Post-harvest hub:** 4 tiles (Batches/Inventory/Accept GRN/Procurement).
- **Batches:** Order/Batch toggle; batch rows; scan FAB.
- **Inventory:** batch rows → move sheet (Sell/Transfer/Process, qty, dest, notes).
- **Procurement:** All/Pending/Paid; payee rows w/ amount + status; "Record procurement".
- **Samples:** Queue/Sent; sample rows. **Audit:** Pending/Approved/Rejected; approve/reject cards.
- **Location picker:** map + lat/long fields + "Use current location" → Confirm.
- **Offline maps:** map w/ dashed selection, area/size, Download + progress, downloaded-regions list.

---
## WEB (Next.js + Tailwind) — full-viewport responsive

### Landing (public)
Top nav (logo, NESSO, links Platform/Traceability/Pricing/About, theme, Sign in). Animated 3-blob mesh bg. Hero "The operating system for verified farming." (gradient on "verified farming"), subcopy, CTAs "Sign in to dashboard" + "Book a demo", 4 stat chips. Browser-chrome product-preview window (KPI cards). 3 feature cards (Map/Log/Prove). CTA band. Footer.

### Login
Glass card over mesh aurora: logo, "Welcome back", Email + Password (Forgot?), "Sign in" (→ app). Back button → Landing. Theme toggle. Footnote "Field officers — use the mobile app with OTP."

### App shell
Sidebar (248/74 collapse): logo, WORKSPACE nav (Dashboard, Approvals ·23, Farmers, Farms, Activities, Pre-harvest, Quality, Procurement, Inventory, Reports), footer (Settings, Collapse). Active = left bar + green tint. Topbar (glass, sticky): breadcrumbs, ⌘K search trigger, theme, bell (→Notifications), account button → dropdown (Profile/Settings/Notifications/Log out). ⌘K palette: search + jump-to list.

### Dashboard (bento, 4-col)
Header + actions (season, Export, Register farmer). 4 KPI cards (count-up + sparkline). Map card (c2 r2, clustered markers + polygon + zoom). Activity-progress donut (rounded caps, soft fills). Activities bar chart (rounded caps, dotted baseline, accent hi-bar). Associations donut. Recent activity feed. Weather card (gradient). Bento collapses 4→2→1 col.

### Approvals
4 mini-stats. Tabs Farmers/Activities/Audits. **Split master-detail** (`.split-detail` = `1fr 380px`, collapses <920px): queue list (risk badges) + sticky detail card (KYC fields, Reject/Approve).

### Farmers (DataTable)
Header + Export/Register. Filter bar: search + removable filter chips + "Add filter". Bulk bar on select (Approve/Export/Clear). Table (checkboxes, avatar+name+ID, village+district, crop chip, area mono, status pill, KYC, chevron; row hover = left accent). Footer pagination. Min-width 720, horizontal scroll.

### Farmer Profile
Left panel (avatar, name, KYC pill, contact rows, 2×2 stats). Right tabs Farms (map cards) / Crops / Activities (timeline) / Samples (table) / Documents (doc grid). `profile-grid` = `360px 1fr`.

### Farm
Map card (280px) + stat grid. Tabs Crops/Activities/Weather/Certificates/Soil — all populated.

### Activities
Calendar/List toggle. Calendar = 7-col month grid with color-coded activity chips, today highlight. List = table (activity/farm/detail/cost/date/status). **Activity detail:** inputs+cost card, map+geotag/logged-by, photo grid.

### Pre-harvest
4 mini-stats + table (farmer, farm, crop chip, stage, harvest-in (warning if soon), forecast, progress bar).

### Quality
Tabs Samples (4 stats + table: sample/crop/moisture/grade A·B·—/lab/status) and Audits (cards w/ approve/reject).

### Procurement / Warehouses / Inventory / QR gen / Batch / Reports
- **Procurement:** 4 stats, tabs All/Pending/Paid, table + Pay button.
- **Warehouses:** capacity cards (bento) with usage bars (warning >75%).
- **Inventory ledger:** 4 stats + batch table (stage, warehouse, updated) → Batch.
- **QR generator:** settings (batch select, size) + live QR preview card.
- **Batch:** QR + stat panel + stage-history timeline.
- **Reports:** filter chips + preview table + export-queue card.

### Settings
Left sub-nav (Users & roles / Catalogs / Preferences / Audit log / Organization). Users table (avatar, role badge, status, Invite). Catalogs counts. Preferences rows. Audit-log feed. Org card. Collapses <720px.

### System
403/404/500 — big ghost code numeral + icon, title, copy, Go back / Dashboard. Notifications — Today/Earlier cards.

---
## PORTAL (Next.js public, `/t/[code]`) — 640px column, hash-routed in prototype

- **Landing:** mesh hero "Know exactly where your flowers grew.", scan card w/ QR + "Open sample trace", 3 feature cards.
- **Trace:** photo hero w/ trace chip + crop title; "Verified by Nesso" trust card (holographic shimmer); **journey timeline** (Grown→Harvested→Quality→Stored→Market) with **scroll-linked green fill**; farmer card (→Farmer); farm card w/ animated polygon draw (→Farm); "View raw trace data".
- **Farmer:** avatar, name, FPO chip, about, meta grid, farms list.
- **Farm:** polygon map, meta grid, practices chips, current crops.
- **About:** mission prose. **Privacy:** DPDP-aligned policy (what's shown, consent, rights, cookies).
- **Raw JSON:** syntax-highlighted `GET /api/v1/trace/TBR-0291` response.
- **Invalid code (catch-all):** "Invalid trace code" + Go home / Try sample trace.

All views: top bar (logo, nav, theme), animated mesh on landing, footer. Content visible by default (no hidden-until-JS states); reveal/entrance effects must degrade gracefully.
