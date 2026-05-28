# 14 — Complete Screen & UI Inventory

Every screen we need to build, across **Mobile (Expo TS)**, **Web Dashboard (Next.js 15)**, and **QR Portal (Next.js)**. Use this as the build checklist — each row maps to a module spec under `modules/`.

Legend: 🟢 P0 (MVP, must-ship) · 🟡 P1 (v1 GA) · 🔵 P2 (post-GA)

---

## A. Mobile App Screens

### A.1 Auth & onboarding (5)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 1 | **Splash** | 🟢 | Brand logo, Lottie logomark reveal, version chip | auth |
| 2 | **Language Selection** | 🟢 | 12-language grid w/ native script preview, search | i18n |
| 3 | **Login (phone)** | 🟢 | +91 prefix, 10-digit input, "Send OTP" CTA, ToS link | auth |
| 4 | **OTP Verify** | 🟢 | 6-digit segmented input, resend (30s cooldown), max 3 attempts | auth |
| 5 | **Select Associations** | 🟢 | Multi-select cards (FPO / Flower Agent / Independent), search | onboarding |

### A.2 Dashboard & home (3)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 6 | **Dashboard** | 🟢 | KPI cards (farmers/farms/crops/pending), weather widget, year filter, quick actions grid, recent activity feed, jump links | reports |
| 7 | **Notifications Inbox** | 🟢 | Grouped by kind, unread badges, swipe-to-read, deep link on tap | notifications |
| 8 | **Profile / Settings** | 🟢 | Avatar, name, role badge, language, theme toggle, sync status, logout | auth + i18n |

### A.3 Farmer flows (5)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 9 | **Farmer List** | 🟢 | Search bar, filter chips (status/association/district), infinite scroll, swipe-actions, "Add" FAB | onboarding |
| 10 | **Farmer Profile** | 🟢 | Avatar, KYC summary, tabs: Farm / Facilities / Produce / Financial / Inventory / Agreements / Tokens | onboarding |
| 11 | **Register Farmer** | 🟢 | Multi-section form: Personal / Contact / Address / Association / ID Proof modal / Bank modal / Crop Prefs / Consent. Sticky save | onboarding |
| 12 | **Verify Farmer** | 🟢 | Pending/Approved/Rejected tabs, inline approve/reject with reason picker | onboarding |
| 13 | **KYC Photo Capture** | 🟢 | Full-screen camera, document outline guide, retake/use buttons | onboarding |

### A.4 Farm flows (4)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 14 | **Farm List** | 🟢 | Search, filter, farm cards with polygon thumb, "Add" FAB | mapping |
| 15 | **Farm Details** | 🟢 | Polygon header, area/lat-lng, tabs: Crops / Activities / Weather / Certificates / Soil / Crop History | mapping |
| 16 | **Add New Farm** | 🟢 | Full-screen Leaflet (Standard/Satellite toggle), polygon vertex add/undo/clear, area readout, side-sheet form | mapping |
| 17 | **Location Picker** | 🟢 | Map + manual lat/lng entry + reverse-geocode display + "Use my location" CTA | mapping |

### A.5 Crop & activity flows (5)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 18 | **Add New Crop** | 🟢 | Crop autocomplete, variety, type radio, unit segmented, area numerics, date pickers, multi-harvest toggle, POP seed checkbox | crop |
| 19 | **Add Activity** | 🟢 | Activity type picker (10), date pickers, input picker modal (180 catalog items), photos, geotag, notes, cost composer | activity |
| 20 | **Activities List** | 🟢 | Pending/Approved tabs, calendar ↔ list toggle, filters, swipe complete/edit | activity |
| 21 | **Input Picker (modal)** | 🟢 | Chemical/Organic/Inventory/Other tabs, search w/ multilingual tokens, recents, qty/unit/cost fields | activity |
| 22 | **Pre-Harvest** | 🟢 | Report / Activities / Crop History tabs; hierarchical add modal (Agent→Farmer→Farm→Crop) | pre-harvest |

### A.6 Harvest & post-harvest (5)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 23 | **Harvest Board** | 🟢 | Today / Tomorrow / Planned sections, distance-from-officer chip, navigate CTA | harvest |
| 24 | **Weather Alerts** | 🟢 | 7-day cards, hourly chart, activity tips, refresh, last-updated chip | weather |
| 25 | **Post-Harvest Dashboard** | 🟡 | Hub tiles → Batches / Inventory / GRN | inventory-grn |
| 26 | **Batches** | 🟡 | ORDER ↔ BATCH view toggle, filters (association/supplier/grade/crop/date), scan FAB | inventory-grn |
| 27 | **Accept GRN (scanner)** | 🟡 | Full-screen camera w/ reticle, multi-format (QR/EAN/PDF417/Aztec/DataMatrix), debounce, manual entry fallback, confirm sheet | inventory-grn |

### A.7 Inventory & procurement (3)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 28 | **Inventory Dashboard** | 🟡 | Batch cards, status chips, action bar SELL/TRANSFER/PROCESS, filter sheet | inventory-grn |
| 29 | **Inventory Transition (sheet)** | 🟡 | Stage picker, quantity, destination warehouse, notes, photos | inventory-grn |
| 30 | **Procurement** | 🟡 | List + filter chips, payment status badge, detail w/ payment recorder sheet | procurement |

### A.8 Quality (2)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 31 | **Sample Board** | 🟡 | Queue / Sent tabs, add sample modal, status chips, code copyable | sampling |
| 32 | **Audit** | 🟡 | Pending / Approved / Rejected tabs, detail w/ attachments + approve/reject (with reason) | audits |

### A.9 Maps & offline (2)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 33 | **Offline Map** | 🟡 | Region selector (drag box), zoom-range slider, download progress, region list w/ size, purge | maps-gps |
| 34 | **QR Scanner (generic)** | 🟢 | Full-screen camera reusable from GRN/inventory; manual entry; flash toggle | qr |

### A.10 Utility / system (5)

| # | Screen | Priority | Key UI elements | Module |
|---|---|---|---|---|
| 35 | **Sync Health** | 🟢 | Outbox count, last sync, error list w/ retry & resolve, manual "Sync now" | offline-sync |
| 36 | **Theme** | 🟢 | Light / Dark / System segmented, accessibility toggles (reduced motion, large text) | design-system |
| 37 | **About** | 🟢 | Version, build, support email, OSS licenses | – |
| 38 | **Error Fallback** | 🟢 | ErrorBoundary screen w/ "Reload", "Copy diagnostics", "Contact support" | – |
| 39 | **No-Internet Banner** | 🟢 | Persistent top banner when offline; tap → Sync Health | offline-sync |

### A.11 Reusable mobile UI components

Built once in `packages/design-system`, used everywhere:

- `<AppShell>` (tabs + FAB + safe-area)
- `<ScreenHeader title back?>` 
- `<KpiCard label value delta icon>`
- `<StatusChip kind="pending|approved|rejected|overdue|completed|cancelled">`
- `<Toast>` (success/error/info/warning)
- `<EmptyState icon title description action>`
- `<LoadingState skeleton="list|card|chart" rows>`
- `<ErrorState title description onRetry>`
- `<DateField>`, `<NumberField>`, `<TextField>`, `<PhotoField>`, `<LocationField>`
- `<FormSection title>` (sectioned forms)
- `<BottomSheet>` (`@gorhom/bottom-sheet` wrapper)
- `<ConfirmDialog>`
- `<SearchBar>` (debounced)
- `<FilterChips>`
- `<SegmentedControl>`
- `<Avatar>`, `<Badge>`, `<Card>`
- `<MapView>` (Leaflet WebView)
- `<PolygonEditor>`
- `<CameraScanner>` (multi-format)
- `<ImagePickerSheet>` (camera / library)
- `<CalendarStrip>` (week strip on activity screens)
- `<KpiChart>` wrappers: Donut / Pie / Line / Bar
- `<HelpTip>` (long-press info bubble)
- `<OfflineBanner>`

**Total mobile screens: ~39 + ~30 reusable components.**

---

## B. Web Dashboard Pages

### B.1 Auth (3)

| # | Page | Priority | Key UI elements |
|---|---|---|---|
| 1 | `/login` | 🟢 | Glass card, username/email + password, "Forgot" link, animated brand backdrop |
| 2 | `/forgot` | 🟢 | Phone → OTP → new password (3-step) |
| 3 | `/2fa` (optional) | 🔵 | TOTP entry |

### B.2 Dashboard home (1)

| # | Page | Priority | Key UI elements |
|---|---|---|---|
| 4 | `/` | 🟢 | 4 KPI cards · ActivityProgress donut · Practices pie · FarmerGroups pie · interactive farm map (clustered markers) · recent activity feed · weather widget · alerts banner |

### B.3 Farmer management (5)

| # | Page | Priority |
|---|---|---|
| 5 | `/farmers` (list) | 🟢 |
| 6 | `/farmers/new` (create) | 🟢 |
| 7 | `/farmers/[id]` (detail w/ tabs: Profile · Farms · Crops · Activities · Samples · Audits · Procurements · Documents · Audit log) | 🟢 |
| 8 | `/farmers/[id]/edit` | 🟢 |
| 9 | `/approvals` (pending queue, inline approve) | 🟢 |
| 10 | `/flower-agents` (hierarchy tree FPO→Agent→Farmers) | 🟡 |

### B.4 Farm management (3)

| # | Page | Priority |
|---|---|---|
| 11 | `/farms` (table ↔ map toggle) | 🟢 |
| 12 | `/farms/[id]` (interactive map + polygon + tabs Crops / Activities / Weather / Certificates / Soil) | 🟢 |
| 13 | `/farms/[id]/edit` (in-modal polygon editor) | 🟢 |

### B.5 Crop & activity (4)

| # | Page | Priority |
|---|---|---|
| 14 | `/crops` (filterable list) | 🟢 |
| 15 | `/activities` (calendar + list views, filter builder, bulk actions) | 🟢 |
| 16 | `/activities/new` | 🟢 |
| 17 | `/activities/[id]` (detail w/ photos, geotag, cost breakdown) | 🟢 |

### B.6 Pre-harvest (4)

| # | Page | Priority |
|---|---|---|
| 18 | `/pre-harvest` (sub-tabs: Report / Activities / Crop History / Nutrition) | 🟢 |
| 19 | `/pre-harvest/new` (hierarchical pickers) | 🟢 |
| 20 | `/pre-harvest/[id]` (detail w/ attachments) | 🟡 |
| 21 | `/pre-harvest/nutrition` (fertilizer log + bulk schedule) | 🟡 |

### B.7 Quality (3)

| # | Page | Priority |
|---|---|---|
| 22 | `/samples` (queue pipeline view, bulk transitions) | 🟡 |
| 23 | `/samples/[id]` (timeline + result payload) | 🟡 |
| 24 | `/audits` (pending/approved tabs, bulk approve, reject w/ reason) | 🟡 |

### B.8 Procurement (3)

| # | Page | Priority |
|---|---|---|
| 25 | `/procurement` (stats cards + list + filters) | 🟡 |
| 26 | `/procurement/[id]` (detail + payment recorder + history) | 🟡 |
| 27 | `/procurement/new` | 🟡 |

### B.9 Warehouse & inventory (5)

| # | Page | Priority |
|---|---|---|
| 28 | `/warehouses` (card grid ↔ map) | 🟡 |
| 29 | `/warehouses/[id]` (detail + linked batches) | 🟡 |
| 30 | `/inventory/batches` (table w/ QR previews, status badges) | 🟡 |
| 31 | `/inventory/batches/[batchId]` (detail w/ stageHistory timeline, QR download, linked procurement) | 🟡 |
| 32 | `/inventory/grn` (pending procurements awaiting GRN, quick accept) | 🟡 |
| 33 | `/inventory/movements` (append-only ledger, CSV export) | 🟡 |

### B.10 QR (2)

| # | Page | Priority |
|---|---|---|
| 34 | `/qr` (generator + bulk download) | 🟡 |
| 35 | `/qr/[code]` (admin trace view w/ analytics) | 🟡 |

### B.11 Reports (3)

| # | Page | Priority |
|---|---|---|
| 36 | `/reports` (filter builder + result table + export queue) | 🟢 |
| 37 | `/reports/pre-harvest` (row-level join report) | 🟢 |
| 38 | `/reports/exports` (queued export jobs + download links) | 🟡 |

### B.12 Notifications (1)

| # | Page | Priority |
|---|---|---|
| 39 | `/notifications` (drawer + inbox + broadcast composer for admin) | 🟢 |

### B.13 Settings (6)

| # | Page | Priority |
|---|---|---|
| 40 | `/settings/users` (staff CRUD) | 🟢 |
| 41 | `/settings/users/new` | 🟢 |
| 42 | `/settings/warehouses` (links to /warehouses CRUD) | 🟡 |
| 43 | `/settings/catalogs/pop` (POP catalog editor) | 🟡 |
| 44 | `/settings/catalogs/inputs` (input catalog editor) | 🟡 |
| 45 | `/settings/preferences` (language, theme, notification prefs per-user) | 🟢 |
| 46 | `/settings/audit-log` (admin-only read-only view) | 🟡 |
| 47 | `/settings/api-tokens` (post-GA: machine-to-machine) | 🔵 |

### B.14 System / utility (4)

| # | Page | Priority |
|---|---|---|
| 48 | `/403` Forbidden | 🟢 |
| 49 | `/404` Not Found | 🟢 |
| 50 | `/500` Error | 🟢 |
| 51 | `/health` (internal status; auth-gated) | 🟡 |

### B.15 Reusable web UI components

Built in `packages/design-system` + `apps/web/components`:

- `<Sidebar>` (collapsible, badged items)
- `<Topbar>` (breadcrumbs, search, notification bell, profile menu, theme toggle, language switcher)
- `<PageHeader title actions breadcrumbs>`
- `<DataTable>` (TanStack Table wrapper: column visibility, pinned columns, URL-state filters, virtualization, CSV export, bulk actions)
- `<FilterBuilder>` (composable filter chips w/ URL sync)
- `<KpiCard>`, `<StatChip>`, `<TrendDelta>`
- `<Chart.*>` wrappers: Donut · Pie · Line · Bar · Area · Heatmap
- `<MapView>` (react-leaflet w/ marker clusters, polygon overlay)
- `<Form*>` primitives: TextField, NumberField, DateField, SelectField, ComboboxField, MultiSelectField, FileUploadField, PolygonField, ImageField (S3 pre-signed)
- `<FormSection title description>`, `<FormGrid columns>`
- `<Dialog>`, `<Sheet>` (Vaul), `<Drawer>`, `<Popover>`, `<Tooltip>`
- `<Tabs>`, `<Accordion>`, `<Stepper>`
- `<Badge>`, `<StatusBadge>`, `<Avatar>`, `<AvatarGroup>`
- `<EmptyState>`, `<LoadingState>` (skeleton), `<ErrorState>` (retry)
- `<ConfirmDialog destructive>`
- `<Toast>` (sonner)
- `<CommandPalette>` (`cmdk` — `g f` jumps, `n` creates)
- `<CopyableCode>` chip for IDs
- `<QRPreview>` w/ download/share/open
- `<TimelineList>` (stage histories, audit trails)
- `<CalendarView>` (activity scheduling)
- `<HierarchyTree>` (FPO → Agent → Farmers)
- `<JsonViewer>` (sample results, debug)
- `<ExportDialog>` (queue export, polling)

**Total web pages: ~51 + ~40 reusable components.**

---

## C. QR Portal Pages (public)

| # | Page | Priority | Key UI elements |
|---|---|---|---|
| 1 | `/` | 🟢 | Marketing hero, "scan a code" CTA, sample trace link |
| 2 | `/[locale]/t/[code]` | 🟢 | Hero · Farmer card · Farm card · Crop card · Timeline · Certifications · Warehouse |
| 3 | `/[locale]/t/[code]/farmer` | 🟢 | Deeper farmer page (privacy-redacted) |
| 4 | `/[locale]/t/[code]/farm` | 🟢 | Farm w/ polygon map + practice |
| 5 | `/[locale]/t/[code]/timeline.json` | 🟡 | Raw JSON for retailers / auditors |
| 6 | `/i/[code]` | 🟢 | Short-link redirect to `/t/[code]` |
| 7 | `/[locale]/about` | 🟢 | What "verified by Nesso" means |
| 8 | `/[locale]/privacy` | 🟢 | Data handling and consent explainer |
| 9 | `/404` | 🟢 | Invalid code page w/ "scan another" CTA |

**Total portal pages: 9.**

---

## D. Cross-cutting UI surfaces

These are not pages but interactive surfaces that appear *across* screens:

- **Global toast region** (mobile bottom-center, web bottom-right)
- **Global error boundary** (per-app root + per-route)
- **Theme switcher** (Light / Dark / System)
- **Language switcher** (12-language dropdown)
- **Help affordance** (consistent location per WCAG 2.2 SC 3.2.6 — topbar on web, drawer on mobile)
- **Offline banner** (mobile)
- **Sync status chip** (mobile topbar)
- **Notification bell** (web topbar, mobile tab badge)
- **Command palette** (web, `Cmd/Ctrl+K`)
- **Keyboard shortcuts overlay** (web, `?`)
- **Update available banner** (mobile after EAS Update; web after deploy hash change)

---

## E. Build sequence (maps to phases in `11-implementation-phases.md`)

| Phase | Mobile screens | Web pages |
|---|---|---|
| **Phase 0 — Foundations** | 1 Splash, 2 Language, 36 Theme, 37 About, 38 Error Fallback, 39 No-Internet Banner; design system primitives | 48–51 system pages; Sidebar/Topbar shell; Login shell |
| **Phase 1 — Auth & Identity** | 3 Login, 4 OTP, 8 Profile/Settings, 35 Sync Health | 1 `/login`, 2 `/forgot`, 40 `/settings/users`, 41 new user, 45 prefs |
| **Phase 2 — Farmer & Farm core** | 5 Associations, 9–13 farmer, 14–17 farm | 4 `/`, 5–10 farmers, 11–13 farms |
| **Phase 3 — Crops, Activities, Pre-Harvest** | 18–22 | 14–21 |
| **Phase 4 — Quality, Procurement, Inventory** | 23–32 | 22–33 |
| **Phase 5 — QR Traceability, Notifications, Reports** | 24 weather (refine), notifications inbox refinements, QR refinements | 34–39, all portal pages |
| **Phase 6 — Hardening, Observability, GA** | accessibility audit pass, polish | accessibility audit, perf pass, `/health` |

---

## F. Quick totals

| Surface | Screens / Pages | Reusable components |
|---|---|---|
| Mobile | ~39 | ~30 |
| Web Dashboard | ~51 | ~40 |
| QR Portal | 9 | shares design-system |
| **Total** | **~99 screens** | **~70 components** |

Every entry has an owning module under `modules/*.md` — the build plan is to ship the screens phase-by-phase, never breadth-first across all of them. Cross-check each PR against this inventory.
