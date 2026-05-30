<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Screen Parity Tracker

**Design source:** `docs/ui-ux-design-prototypes-flow/farmer-app-ui-ux-flow/design_handoff_nesso/`
**Rule:** A screen is ✅ only when it matches the design handoff at 100% — exact layout, colors, typography, animations, empty states.

Last updated: 2026-05-30

</div>

---

## Legend

| Symbol | Meaning |
|---|---|
| ✅ | 100% — exact spec parity |
| 🔨 | In progress |
| 🟡 | Partial — functional but visually incomplete |
| ❌ | Not started |

---

## 📱 Mobile (Expo — 32 screens total)

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| M1 | Splash — petal-bloom + progress | `SplashScreen.tsx` | ✅ | 5-petal stagger, yellow teardrop drop, NESSO rise-in, spinning golden ring, radial bg, tap-to-skip |
| M2 | Login — phone + OTP toggle | `LoginScreen.tsx` | ✅ | +91 prefix field, lang chip, theme toggle, logo tile, description, sticky CTA, T&C, password mode hidden behind long-press |
| M3 | OTP verify — 6-segment inputs | `OtpScreen.tsx` | ✅ | 42px circle back, masked +91 ••••• XXX mono, 6 aspect-1 boxes (2px ring filled / inset empty), auto-advance, backspace-prev, 0:30 countdown→resend, Verify & continue ✓ |
| M4 | Dashboard — hero + KPI + FAB | `DashboardScreen.tsx` | ✅ | DashHeader (avatar+role pill+theme+bell w/dot), sync chip, weather card w/4-day forecast + advisory, This season + 2×2 KPI grid (count-ups + sparklines + deltas), Quick actions 4-col, Jump-to pills, Recent activity feed. Real data wired. |
| M5 | Farmers list — cards + filter | `FarmersScreen.tsx` | ✅ | PageTop, search bar (search+filter icons), All/Approved/Pending/Rejected chips, avatar cards w/ village·crop + farmerId mono + status chip + chevron, live search/filter, tap→FarmerProfile |
| M6 | Verify — KYC approval flow | `VerifyScreen.tsx` | 🟡 | Functional, no spec visual polish |
| M7 | Register Farmer — 4-step wizard | `RegisterFarmerScreen.tsx` | 🟡 | Single form, no 4-step wizard |
| M8 | Farmer Profile — 5 tabs | `FarmerProfileScreen.tsx` | 🟡 | Structure done, tabs stub, needs real data in tabs |
| M9 | Add Farm — polygon editor | `AddFarmScreen.tsx` | 🟡 | Dev-build: full map. Expo Go: placeholder — needs spec border styles |
| M10 | Add Activity — input picker | `AddActivityScreen.tsx` | 🟡 | Category + fields done — needs exact spec field order |
| M11 | Accept GRN — QR scanner | `AcceptGRNScreen.tsx` | 🟡 | Scanner + confirm + success done — needs exact frame corner spec |
| M12 | Farm Details — tabs | ❌ | Not built | Crops/Activities/Weather/Certificates/Soil tabs |
| M13 | Settings hub | `SettingsScreen.tsx` | 🟡 | 4 sections done — needs exact row heights |
| M14 | Language picker — 12 langs | `LanguageScreen.tsx` | 🟡 | All 12 languages — needs exact native script fonts |
| M15 | Theme picker — L/D/System | `ThemeScreen.tsx` | 🟡 | Radio cards done — needs actual theme switching |
| M16 | Sync Health | `SyncScreen.tsx` | 🟡 | Exists, no spec visual polish |
| M17 | About | `AboutScreen.tsx` | 🟡 | Static done — needs exact layout from spec |
| M18 | Notifications | ❌ | Not built | |
| M19 | Crops list | ❌ | Not built | |
| M20 | Crop Detail | ❌ | Not built | |
| M21 | Weather screen | ❌ | Not built | |
| M22 | Harvest Board | ❌ | Not built | |
| M23 | Pre-harvest checklist | ❌ | Not built | |
| M24 | Samples list | ❌ | Not built | |
| M25 | Audit list | ❌ | Not built | |
| M26 | Procurement list | ❌ | Not built | |
| M27 | Inventory list | ❌ | Not built | |
| M28 | Batch detail | ❌ | Not built | |
| M29 | Location picker | ❌ | Not built | |
| M30 | Offline maps | ❌ | Not built | |
| M31 | Farms list | `FarmsPlaceholderScreen.tsx` | ❌ | Placeholder only |
| M32 | OTP (dedicated screen) | `OtpScreen.tsx` | 🟡 | Built, needs Firebase integration |

---

## 🖥 Web Dashboard (Next.js — 21 screens)

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| W1 | Landing page | `app/page.tsx` | 🟡 | Basic card exists — needs aurora blobs, stat chips, feature cards, CTA band |
| W2 | Login | `(auth)/login/` | 🟡 | Functional — needs glass card, aurora bg |
| W3 | Dashboard — bento + charts | `(dashboard)/dashboard/page.tsx` | 🟡 | 4 flat tiles — needs bento grid, recharts, map card |
| W4 | App shell — sidebar + topbar | `Sidebar.tsx`, `Topbar.tsx` | 🟡 | Fixed sidebar — needs collapse, ⌘K, theme toggle, breadcrumbs |
| W5 | Approvals | `(dashboard)/approvals/page.tsx` | 🟡 | Route exists, no split master-detail |
| W6 | Farmers — DataTable | `(dashboard)/farmers/page.tsx` | 🟡 | List exists, no @tanstack/react-table |
| W7 | Farmer Profile — 5 tabs | `(dashboard)/farmers/[id]/page.tsx` | 🟡 | 4 info cards, no tabs, no avatar |
| W8 | Farms list | `(dashboard)/farms/page.tsx` | 🟡 | List exists, no polygon previews |
| W9 | Farm detail — tabbed | `(dashboard)/farms/[id]/page.tsx` | 🟡 | Basic detail, no tabs |
| W10 | Activities — calendar + list | `(dashboard)/activities/page.tsx` | 🟡 | List only, no calendar |
| W11 | Add Activity | `(dashboard)/activities/new/page.tsx` | 🟡 | Form exists |
| W12 | Pre-harvest report | `(dashboard)/reports/page.tsx` | 🟡 | Minimal |
| W13 | Quality — Samples + Audits | `(dashboard)/samples/` + `(dashboard)/audits/` | 🟡 | Routes exist, basic |
| W14 | Procurement | `(dashboard)/procurement/page.tsx` | 🟡 | Basic list |
| W15 | Warehouses | `(dashboard)/warehouses/page.tsx` | 🟡 | Basic list |
| W16 | Inventory | `(dashboard)/inventory/page.tsx` | 🟡 | Basic list |
| W17 | Crops | `(dashboard)/crops/page.tsx` | 🟡 | Basic list |
| W18 | Notifications | `(dashboard)/notifications/page.tsx` | 🟡 | Basic list, no mark-read inline |
| W19 | Settings hub | ❌ | Not built | Users, Catalogs, Preferences, Audit log, Org |
| W20 | Error pages 403/404/500 | ❌ | Not built | |
| W21 | QR generator | ❌ | Not built | |

---

## 🌐 Portal (Next.js — 7 screens)

| # | Screen | File | Status | Notes |
|---|---|---|---|---|
| P1 | Landing — scan card | `app/page.tsx` | 🟡 | Glass card exists — needs aurora hero |
| P2 | Trace — full journey | `app/[locale]/t/[code]/page.tsx` | 🟡 | Blocks render — needs photo hero, scroll-linked timeline, shimmer |
| P3 | Farmer profile | ❌ | Not built | `/farmer/[id]` |
| P4 | Farm detail | ❌ | Not built | `/farm/[id]` |
| P5 | About | ❌ | Not built | `/about` |
| P6 | Privacy | ❌ | Not built | `/privacy` |
| P7 | Raw JSON | ❌ | Not built | `/raw/[code]` |

---

## Summary

| Surface | Total | ✅ Done | 🟡 Partial | ❌ Missing |
|---|---|---|---|---|
| Mobile | 32 | 0 | 18 | 14 |
| Web | 21 | 0 | 17 | 4 |
| Portal | 7 | 0 | 2 | 5 |
| **Total** | **60** | **5** | **32** | **23** |

---

## Build order (one screen to 100% before next)

### Mobile first
1. 🔨 **M1 Splash** — in progress
2. **M2 Login**
3. **M3 OTP**
4. **M4 Dashboard**
5. **M5 Farmers list**
6. **M7 Register Farmer 4-step**
7. **M8 Farmer Profile**
8. **M9 Add Farm**
9. **M10 Add Activity**
10. **M11 Accept GRN**

### Web next
11. **W4 App shell** (sidebar + topbar — everything depends on it)
12. **W3 Dashboard bento + charts**
13. **W1 Landing page**
14. **W2 Login polish**
15. **W6 Farmers DataTable**
16. **W7 Farmer Profile**

### Portal last
17. **P2 Trace journey**
18. **P1 Landing**
19. **P3-P7 missing routes**
