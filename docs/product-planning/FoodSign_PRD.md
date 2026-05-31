# FoodSign – Product Requirements Document (PRD)

> A complete, replication-ready specification of the **FoodSign** agricultural traceability platform — including the Node/Express + MongoDB backend, the Vanilla-JS Admin Web Dashboard, and the Expo / React Native Mobile App for field officers and farmers.
>
> **Document version:** 1.0
> **Date:** 2026-05-28
> **Source repository:** `/Users/lt-developer/Desktop/FoodSign` (backend stub: `foodsignbe`, full stack: `foodsignfe`)
> **Live backend:** `https://foodsignbe.azurewebsites.net`
> **Brand:** Powered by **Lingotran / NESSO** (Android package `com.lingotran.nesso.farmer`)

---

## Table of Contents

1. [Product Vision & Personas](#1-product-vision--personas)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Domain Model & Database Schemas](#3-domain-model--database-schemas)
4. [Backend (Node + Express + MongoDB)](#4-backend-node--express--mongodb)
5. [REST API – Complete Endpoint Catalog](#5-rest-api--complete-endpoint-catalog)
6. [Web Admin Dashboard (Vanilla JS SPA)](#6-web-admin-dashboard-vanilla-js-spa)
7. [Mobile App (Expo / React Native)](#7-mobile-app-expo--react-native)
8. [Internationalization (12 Languages)](#8-internationalization-12-languages)
9. [Authentication, Authorization & Security](#9-authentication-authorization--security)
10. [Offline-First / Sync Architecture](#10-offline-first--sync-architecture)
11. [Maps, GPS & Polygon Field Mapping](#11-maps-gps--polygon-field-mapping)
12. [File / Image Handling](#12-file--image-handling)
13. [Third-Party Integrations](#13-third-party-integrations)
14. [Deployment & Hosting](#14-deployment--hosting)
15. [Environment Variables & Configuration](#15-environment-variables--configuration)
16. [Roles & Permissions](#16-roles--permissions)
17. [Validation Rules](#17-validation-rules)
18. [Branding & Design System](#18-branding--design-system)
19. [End-to-End User Flows](#19-end-to-end-user-flows)
20. [Step-by-Step Replication Plan](#20-step-by-step-replication-plan)
21. [Known Gaps / Improvement Backlog](#21-known-gaps--improvement-backlog)
22. [Appendix – Full Screen Inventory](#22-appendix--full-screen-inventory)

---

## 1. Product Vision & Personas

### 1.1 Vision
FoodSign is a **farm-to-warehouse traceability platform** for the Indian agriculture supply chain — with particular focus on the **scented-flower / horticulture** value chain (Tuberose, Jasmine, Marigold, Rose, Davana). It captures:

- Farmer onboarding & KYC (ID + bank)
- Farm registration with GPS polygon mapping
- Crop sowing / harvest planning
- Pre-harvest activities (Package of Practices, inputs, growth stages)
- Quality sampling, audits, certifications
- Procurement, GRN (Goods Receipt Note) batching, post-harvest inventory and QR-coded batch traceability

### 1.2 Target Personas

| Persona | Primary Surface | Key Goals |
|---|---|---|
| **Admin / Org MD (NESSO)** | Web Dashboard | Approve farmers, view KPIs, export reports, manage users & warehouses |
| **Field Officer (Org Field Officer / Org Field Assistant)** | Mobile App | Onboard farmers, map fields, log activities |
| **Flower Agent / FPO** | Mobile + Web | Manage a cluster of farmers, approve harvest plans |
| **Farmer** | Mobile App | View harvest alerts, log self-reported activities (read-mostly) |
| **Tech Support / Procurement Manager / Processor** | Web | Scan batches, manage post-harvest inventory |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Mobile App (Expo / RN 0.81, React 19)                          │
│  • i18next (12 langs) • AsyncStorage cache                      │
│  • Firebase Phone Auth • Expo Camera + Location                 │
│  • WebView-based Leaflet map (no react-native-maps)             │
└────────────────────────┬────────────────────────────────────────┘
                         │ axios → Bearer JWT
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Express 5 Server (server.js, ~1,800 LoC)                       │
│  • JWT auth (HS256, 8h) • CORS open • 50 MB JSON                │
│  • Local + DB user lookup • Soft-delete cascades                │
│  • Fallback proxy → Azure if local Mongo down                   │
└──────────────┬───────────────────────────────┬──────────────────┘
               │                                │
               ▼                                ▼
   MongoDB Atlas (12 collections)     Static /public assets
   foodsign_nesso, _farms, _crops,    index.html, app.js (8 KLoC),
   _activities, _preharvest,          styles.css (5 KLoC),
   _samples, _audits, _procurements,  Leaflet, Chart.js, FA icons,
   _warehouses, _locations,           db_architecture.html
   inventory, users
                         ▲
                         │
┌────────────────────────┴────────────────────────────────────────┐
│  Web Admin Dashboard (Vanilla JS SPA, hash-routed)              │
│  Login → Sidebar Nav → 10 pages → CRUD + Leaflet + Chart.js     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Repository Layout

```
FoodSign/
├── foodsignbe/                     # Backend repo stub (README only — Azure-deployed)
│   └── README.md
└── foodsignfe/                     # Full source (mobile + web + dev server)
    ├── server.js                   # Express server (~67KB, ~1800 lines)
    ├── apply_i18n.js               # i18n helper
    ├── check_corruption.js         # i18n integrity scan
    ├── repair_i18n.js              # i18n repair tool
    ├── repair_remaining.js         # secondary i18n repair
    ├── quick_scan.js / true_scan.js
    ├── azure-pipelines.yml         # CI for Azure App Service
    ├── public/                     # Admin Web Dashboard (vanilla JS SPA)
    │   ├── index.html              # 981 lines — login + app shell
    │   ├── app.js                  # 8,113 lines — all SPA logic
    │   ├── styles.css              # 5,356 lines
    │   ├── fix.css / fix_index.js  # late patches
    │   ├── db_architecture.html    # static schema doc
    │   ├── ph_modal_content.txt    # post-harvest modal HTML
    │   ├── farm_bg.jpg / new_farm_bg.png
    │   ├── nessologo.webp / nslogo.jfif
    │   └── downloads/FS_may19th.apk
    └── MobileApp/                  # Expo / React Native
        ├── App.js                  # Stack + BottomTab + FAB
        ├── app.json (Expo config)  # scheme:foodsign, bundleId com.lingotran.nesso.farmer
        ├── eas.json                # build profiles
        ├── google-services.json    # Firebase: food-sign-e5c42
        ├── api/api.js              # Axios + endpoint mapping
        ├── components/             # Map, Toast, themed-text, etc.
        ├── constants/theme.ts
        ├── firebase/phoneAuth.js
        ├── hooks/                  # color scheme, theme
        ├── i18n/i18n.js + translations/{en,hi,kn,bn,te,ta,ml,mr,tr,or,gu,vi}.json
        ├── screens/                # 26 screens
        ├── utils/                  # SyncManager, validators, ifscValidator
        ├── scripts/reset-project.js
        ├── android/                # Native Android (Gradle)
        └── assets/                 # Logos, splash, icons
```

---

## 3. Domain Model & Database Schemas

MongoDB Atlas, accessed via **Mongoose 9**. Twelve collections; the **FARMER** doc (`foodsign_nesso`) is the root entity that everything else FK-references.

### 3.1 Entity-Relationship (textual ER)

```
USER (admin/officer) ─┐
                       │ (auth)
FARMER  1───*  FARM  1───*  CROP  1───*  ACTIVITY
   │                                   1───*  PRE-HARVEST  (also FK Farmer, Farm)
   ├──*  SAMPLE
   ├──*  AUDIT
   ├──*  PROCUREMENT ──*  INVENTORY (batch-level)
   └──*  LOCATION (GPS waypoints)
WAREHOUSE (master data, referenced by inventory)
```

Sub-type: **Flower Agent** = a FARMER doc with `isFlowerAgent: true` (or `role/groupAssociation = "Flower Agent"`).

### 3.2 Collection Schemas

> All collections include `createdAt`, `updatedAt`, soft-delete `isDeleted` (Boolean, default `false`).
> Field names below are exact.

#### `foodsign_nesso` (FARMER)
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | PK |
| `firstName`, `lastName` | String | |
| `mobileNumber` | String | **UNIQUE** primary identifier (or `FA-{timestamp}` for flower-agents w/o phone) |
| `gender`, `dob`, `email` | String | |
| `groupAssociation` | String | `INDEPENDENT` \| `FLOWER_AGENT` \| `FPO` |
| `totalLandHolding`, `noOfFarms` | Number | |
| `address`, `district`, `taluka`, `hobli`, `state`, `city`, `village`, `town`, `pincode` | String | |
| `idProofType` | String | Aadhaar / Voter ID / PAN / Passport / DL / Ration / MNREGA / National ID |
| `idProofNumber`, `idProofImageUri` | String | Image stored **base64 data URI** |
| `bankAcc`, `bankIfsc`, `bankName`, `bankImageUri` | String | |
| `profileImageUri` | String | base64 |
| `farmerId` | String | Auto: `NES-F-{YYYY}-{NNNNN}` |
| `approvalStatus` | String | `pending` \| `approved` \| `rejected` (default `pending`) |
| `isFlowerAgent` | Boolean | |
| `role` | String | (see Roles table §16) |
| `selectedCrops` | [String] | |
| `preferredLanguage` | String | one of 12 supported |
| `productionPractice` | String | Organic / Conventional / Natural Farming / GAP Certified |
| `variety` | String | |
| `activitiesDone/Planned/Overdue` | Number | denormalized counts |
| `managedBy`, `managingEntity`, `fpoId`, `flowerAgentId`, `parentAssociationId`, `farmGroup` | String | hierarchy |
| `isDeleted` | Boolean | soft-delete |

#### `foodsign_farms` (FARM)
| Field | Type |
|---|---|
| `farmerId` | String/ObjectId FK |
| `farmId`, `farmName`, `surveyNumber` | String |
| `farmArea`, `growingArea` | Number (acres) |
| `organicStage` | String — Certified / In-transition / Conventional |
| `previousPractice`, `waterSource`, `soilType`, `ownership`, `fieldType` | String |
| `latitude`, `longitude`, `accuracy` | Number |
| `polygonPoints` | [{lat, lng}] |
| `mapScreenshotUri` | base64 |
| `district`, `taluka`, `hobli`, `city`, `pincode`, `state` | String |
| `farmerName`, `flowerAgentId`, `flowerAgentName`, `associationName`, `associationType` | String (denorm) |
| `status`, `farmStatus`, `approvalStatus` | String |
| `crop`, `cropName`, `cropStatus`, `cropYear`, `year`, `dimension` | String |
| `activitiesDone/Planned/Overdue` | Number |

#### `foodsign_crops` (CROP)
| Field | Type |
|---|---|
| `farmId`, `farmerId` | FK |
| `cropName` | String |
| `cropType` | `Main` \| `Inter` \| `Border Crop` |
| `cropVariety`, `unit` (kg/quintal/tonne/nos) | String |
| `acre`, `mappedAcre`, `estHarvest` | Number/String |
| `waterType` | `RAINFED` \| `IRRIGATION` |
| `method` | `SOWING` \| `PLANTING` |
| `practice` | `CONVENTIONAL` \| `ORGANIC` |
| `sowingDate`, `harvestDate` | YYYY-MM-DD |
| `multipleHarvest` | Boolean |
| `activitiesDone/Planned/Overdue` | Number |

#### `foodsign_activities` (ACTIVITY)
| Field | Type |
|---|---|
| `farmId`, `cropId` | FK |
| `activity` | String (e.g. Watering, Spraying, Harvest, Land Prep) |
| `cropAge` | String (days since sowing) |
| `scheduledOn`, `completedDate`, `enteredDate` | Date |
| `status` | `Pending` \| `Completed` \| `Overdue` \| `Cancelled` |
| `popCompliance` | String |
| `notes` | String — composed of all inputs + costs |

#### `foodsign_preharvest` (PRE-HARVEST)
| Field | Type |
|---|---|
| `farmerId`, `farmId`, `cropId` | FK |
| `cropName`, `cropVariety`, `farmerName`, `farmName` | denorm |
| `cropCategory` | `Scented Flowers` \| `Vegetables` \| `Fruits` \| `Cereals` \| `Other` |
| `activityType` | `Farm Activity` \| `Crop Growth` \| `Weather Alert` |
| `title` | String (required) |
| `growthStage` | `Germination` \| `Vegetative` \| `Flowering` \| `Harvest Ready` \| `Harvested` |
| `season` | `Kharif` \| `Rabi` \| `Summer` \| `Perennial` \| `Anytime` \| `All` |
| `status` | `Pending` \| `In Progress` \| `Completed` |
| `sowingDate`, `scheduledDate`, `completedDate` | Date |
| `postedBy` | `farmer` \| `admin` |
| `notes` | String |

#### `foodsign_samples` (SAMPLE)
| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | |
| `crop`, `variety` | String (req) |
| `sampleCode` | String **UNIQUE** |
| `season` | Kharif/Rabi/Summer |
| `status` | `Queue` \| `Sent` |
| `sentDate`, `notes` | |

#### `foodsign_audits` (AUDIT)
| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | |
| `auditType`, `description`, `remarks` | String |
| `status` | `Pending` \| `Approved` \| `Rejected` |
| `auditDate`, `reviewedBy` | |

#### `foodsign_procurements` (PROCUREMENT)
| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | |
| `crop`, `variety` | |
| `quantity`, `pricePerUnit`, `totalAmount` | Number (auto: qty × price) |
| `unit` | kg/quintal |
| `procurementDate` | Date (req) |
| `status` | `Pending` \| `Completed` \| `Cancelled` |
| `paymentStatus` | `Unpaid` \| `Partial` \| `Paid` |

#### `inventory` (INVENTORY — batch-level)
| Field | Type |
|---|---|
| `batchId` | **UNIQUE** |
| `productName`, `variant`, `grade`, `supplier`, `warehouse`, `type`, `currentStage` | |
| `status` | `AVAILABLE` \| `PROCESSING` \| `SOLD` \| `TRANSFERRED` |
| `quantity`, `unit` | |
| `incomingDate`, `expiryDate` | Date |
| `qrCode` | String (QR payload) |

#### `foodsign_warehouses` (WAREHOUSE)
| Field | Type |
|---|---|
| `warehouseName`, `type` (Storage / Food Processing) | |
| `availableFacility`, `primaryContactName`, `mobileNumber`, `email` | |
| `incorporationDate`, `ownership` (Own/Leased) | |
| `capacity`, `totalArea` | |
| `certificationStatus` (Applied / Conventional), `certifyingAgency` | |
| `latitude`, `longitude`, `country`, `state`, `district`, `taluka`, `hobli`, `city`, `pincode`, `addressLine1` | |

#### `users` (admin/staff)
| Field | Type |
|---|---|
| `firstName`, `lastName`, `name` | |
| `phone` | **UNIQUE** (login key) |
| `email`, `password` (plain, ⚠️ to be hashed), `otp` | |
| `role` | one of 15 (see §16) |
| `participantId/Name/Type` | ORG/FPO/Flower Agent/Field Officer/Procurement Manager/Processor |
| `fpoId/Name`, `flowerAgentId/Name` | |
| `activeStartDate`, `activeEndDate` | |
| `gender`, `preferredLanguage`, `country`, `state`, `district`, `city`, `pincode`, `addressLine1` | |
| `status` | `active` \| `inactive` |

Dual-source: lookup falls back to local `settings-users.local.json` when DB is unavailable.

#### `foodsign_locations` (GPS waypoints)
| Field | Type |
|---|---|
| `farmerId`, `farmerName`, `association` | |
| `label` (req) | "Home" / "Field A" |
| `latitude`, `longitude`, `altitude`, `accuracy` | Number |
| `type` | `Farm` \| `Home` \| `Other` |
| `addedBy` | |

> A static, dark-themed schema reference is published at **`/db_architecture.html`** (color-coded by domain: blue=auth, green=core, teal=preharvest, orange=activities, purple=quality, red=supply chain).

---

## 4. Backend (Node + Express + MongoDB)

### 4.1 Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 18 |
| Framework | **Express 5.2.1** |
| ODM | **Mongoose 9.5** |
| Auth | **jsonwebtoken 9** (HS256, 8h TTL) |
| Config | `dotenv 17` |
| CORS | `cors 2.8` (open) |
| Body limit | `express.json({ limit: '50mb' })` (base-64 images) |

The entire backend lives in a single file **`server.js`** (~1,800 LoC). Mongoose models are imported from `./backend/models/*` (to be implemented per §3.2) and connection from `./backend/config/db.js`.

### 4.2 Bootstrap & Connection
```js
require('dotenv').config({ path: './backend/.env' });
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

connectDB();                                       // Mongo Atlas
app.listen(process.env.PORT || 3000, process.env.HOST || '0.0.0.0');
```

### 4.3 Middleware

- **`authMiddleware`** – verifies `Authorization: Bearer <token>` → 401 if missing/invalid.
- **`adminOnlyMiddleware`** – same plus a hook for role-check (currently passes-through).

### 4.4 Fallback Proxy

If `mongoose.connection.readyState !== 1` **and** the JWT can't be verified locally, requests to `/admin/*` are **proxied to `https://foodsignbe.azurewebsites.net`**. This makes local dev resilient and provides a hot-failover path.

### 4.5 Static + SPA Fallback
```js
app.use(express.static('public'));
app.get('*', (req, res) => res.sendFile('public/index.html'));   // SPA
```
Defined **after** all `/admin/*` API routes to avoid interception.

---

## 5. REST API – Complete Endpoint Catalog

Base URL local: `http://<host>:3000` • Production: `https://foodsignbe.azurewebsites.net`
All non-auth endpoints require `Authorization: Bearer <JWT>`.

### 5.1 Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/admin/login` | `{username, password}` | Accepts phone or email. Issues JWT 8h. Hard-coded admin: `admin` / `Admin@2026` (or `9066666481` / `12345678`/`password`). Falls back to local users JSON → DB. |

### 5.2 Settings
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/settings/options` | Returns dropdowns: roles, participantTypes, languages, locations, warehouse facets |
| GET / POST | `/admin/settings/users` | List / create staff users |
| PUT / DELETE | `/admin/settings/users/:id` | Update / soft-deactivate |
| GET / POST | `/admin/settings/warehouses` | |
| PUT / DELETE | `/admin/settings/warehouses/:id` | Soft delete (`isDeleted:true`) |

### 5.3 Farmers
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/farmers` | Active, image URIs excluded |
| GET | `/admin/farmers/:id` | Full doc incl. images |
| POST | `/admin/farmers` | Auto-assigns `farmerId` `NES-F-YYYY-NNNNN`, `approvalStatus: pending` |
| PUT | `/admin/farmers/:id` | |
| POST / PUT | `/admin/farmers/:id/approve` | Body `{approved: true\|false}` → sets `approved`/`rejected` |
| DELETE | `/admin/farmers/:id` | Soft-delete + cascade-soft-delete all farms |
| GET | `/admin/pending-approvals` | Farmers w/o approval set |
| GET | `/admin/flower-agents` | Farmers where `isFlowerAgent` true |
| PUT | `/admin/flower-agents/:id/approve` | Body `{action: "approve"\|"reject"}` |

### 5.4 Dashboard / Stats
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | `{totalFarmers, totalFarms, totalCrops, recent:[5]}` |

### 5.5 Farms
| Method | Path |
|---|---|
| GET | `/admin/farms` (enriched w/ farmer name & mobile) |
| GET | `/admin/farms/:id` |
| POST | `/admin/farms` |
| PUT | `/admin/farms/:id` |
| DELETE | `/admin/farms/:id` (soft) |

### 5.6 Crops
| Method | Path | Filters |
|---|---|---|
| GET | `/admin/crops` | `farmId, farmerId, flowerAgentId, year` |
| POST / PUT / DELETE | `/admin/crops[/:id]` | |

### 5.7 Activities (Package-of-Practices)
| Method | Path | Filters |
|---|---|---|
| GET | `/admin/activities` | `farmId` |
| POST / PUT / DELETE | `/admin/activities[/:id]` | |

### 5.8 Pre-Harvest
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/pre-harvest` | `farmerId`, `farmId` filters |
| GET | `/admin/pre-harvest/farmers` | Dropdown source |
| GET | `/admin/pre-harvest/farms/:farmerId` | Lookup by `_id` / `farmerId` / `farmId` / name |
| GET | `/admin/pre-harvest/crops/:farmId` | |
| POST | `/admin/pre-harvest` | Auto-denorms farmer/farm names, normalizes category |
| PUT / DELETE | `/admin/pre-harvest/:id` | |

### 5.9 Reports
| Method | Path |
|---|---|
| GET | `/admin/reports/preharvest?approvalStatus&status&growthStage&includeMissingFarm&includeFlowerAgents&onlyPreHarvest` |

Returns `{ generatedAt, ms, filters, totals:{farmersAll,farmersInScope,farmersMissingFarm,farms,crops,preHarvestRecords}, rows:[…] }`. Each row joins farmer → farm → crop → pre-harvest + activity rollup (`pending/completed/overdue/total/lastDate`).

### 5.10 Sampling & Quality
- `GET /admin/samples` (filters: `status`, `crop`, `variety`, `association`)
- `GET /admin/samples/crops`, `GET /admin/samples/varieties` (distinct lists)
- `DELETE /admin/samples/:id`
- `GET /admin/harvest-plans` – derived unique `(crop, variety, association, year)` tuples
- `GET /admin/pop-list` – hard-coded POP catalog: *Tuberose-Hybrid POP 2022, Jasmine-Sambac POP 2022, Rose-Hybrid Tea POP 2023, Davana-Bangalore POP 2023, Beet Root-INDAM RUBY QUEEN POP 2023, Marigold-Pusa Narangi POP 2023*, …

### 5.11 Audits
- `GET /admin/audits?status&auditType&association`
- `PUT /admin/audits/:id`

### 5.12 Procurement
- `GET /admin/procurement?status`
- `GET /admin/procurement/stats` → `{total, pending, completed, totalValue}`

### 5.13 Inventory
- `GET /admin/inventory`

### 5.14 Public
- `GET /downloads/FS_may19th.apk` – APK download
- `GET /mobile-app` – "Coming soon" landing
- `GET /db_architecture.html` – schema reference

---

## 6. Web Admin Dashboard (Vanilla JS SPA)

### 6.1 Stack
- **No framework.** Vanilla JS (`public/app.js` – 8,113 lines, ~185 named fns, ~102 listeners), HTML (`public/index.html` – 981 lines), CSS (`public/styles.css` – 5,356 lines).
- **CDN libs:** Leaflet 1.9.4 (maps), Chart.js 4.4.0, Font Awesome 6.4.0, Google Inter font.
- **No build step** – served as plain static files by `server.js`.
- **State**: window-level globals + DOM data-attributes; **JWT in `localStorage['admin_token']`**; all fetches via custom `authFetch()` wrapper.

### 6.2 Pages / Views

Hash-based switching of `<section>`s under `<main class="main-content">`:

| Page | DOM ID | Entry fn | Notes |
|---|---|---|---|
| Login | `#login-view` | (default) | glass-card with bg image; password + OTP toggle |
| Dashboard | `#main-dashboard-scroll` | `showApp()` / `loadDashboardData()` | KPI cards + 3 Chart.js charts + Leaflet farm map |
| Onboarding | `#onboarding-page` | `showOnboarding()` | Farmer & Flower Agent tabs |
| Approvals | `#approvals-page` | `showApprovals()` | Sidebar badge counter |
| Pre-Harvest | `#preharvest-page` | `showPreHarvest()` | Crops / Farms / Activities sub-tabs |
| PH Activity Detail | `#ph-crop-activity-page` | `showCropActivityPage(cropId)` | Per-crop activity log |
| PH Add Activity | `#ph-add-activity-page` | uses `ph_modal_content.txt` HTML | hierarchical pickers |
| PH Nutrition | `#ph-nutrition-page` | | fertilizer log |
| Reports | `#reports-page` | `showReports()` / `loadReportsData()` | filter builder |
| Settings | `#settings-page` | `showSettings(mode)` | Users + Warehouses |
| Farm Details | `#farm-details-view` | `showFarmDetails(farmId)` | full farmer profile panel |

### 6.3 CRUD Functions (representative)
| Op | Functions |
|---|---|
| Create | `saveFarmModal()`, `saveOnboardingActivity()`, `savePHActivity()`, `saveSettingsUser()`, `saveSettingsWarehouse()` |
| Read | `loadAdminFarmsSafe()`, `loadOnboardingData()`, `loadPreHarvestData()`, `loadFlowerAgentApprovals()` |
| Update | same save fns (POST → PUT when `_id` present), `editPreHarvest(id)` |
| Delete | `deleteFarm(id)`, `deletePreHarvest(id)`, `deleteSettingsUser(id)`, `deleteSettingsWarehouse(id)` |

### 6.4 Charts (Chart.js)
1. **Activity Progress** doughnut — Overdue / Completed / Planned / Cancelled
2. **Practices Breakdown** pie — Organic vs Conventional
3. **Farmer Groups** pie — Flower Agent vs Other

### 6.5 Map (Leaflet)
- `#farm-map` interactive map with farm markers
- Per-farm popup: farm name + farmer name
- 60×60 inline thumbnails (`renderFarmMapPreview()`) in farm cards (uses static `mapScreenshotUri` if available else mini-Leaflet)

### 6.6 Web Theme
Custom CSS – no Bootstrap/Tailwind.

```css
--primary:#4CAF50;   --primary-dark:#388E3C;  --primary-light:#C8E6C9;
--c-blue:#00BCD4;    --c-yellow:#FFC107;      --c-red:#F44336;
--c-gray:#B0BEC5;
--text-main:#333;    --text-muted:#666;
--bg-main:#F4F7F6;   --white:#FFF;            --border:#E0E0E0;
```
Mobile uses brighter `#0FA039`; web uses corporate `#4CAF50`.

### 6.7 Login Logic
1. POST `/admin/login` with username/password
2. On 200 → store `admin_token` in `localStorage`
3. `authFetch()` injects `Authorization`; on 401 → return to login
4. If host is `*.azurewebsites.net`, point at remote; else point at `/admin/*` on same origin.

---

## 7. Mobile App (Expo / React Native)

### 7.1 Tech Stack

```
Expo SDK ~54  •  React 19  •  React Native 0.81.5
React Navigation 7 (native-stack + bottom-tabs)
@react-native-async-storage/async-storage
@react-native-community/netinfo
@react-native-firebase/{app,auth} 23.8.8  (Phone OTP)
expo-camera, expo-image-picker, expo-location, expo-haptics
expo-localization, i18next, react-i18next  (12 langs)
expo-linear-gradient, expo-symbols, @expo/vector-icons (Ionicons)
react-native-svg, react-native-webview        (Leaflet inside WebView)
axios 1.15
```

**Bundle id (both iOS + Android):** `com.lingotran.nesso.farmer`
**Scheme:** `foodsign://`
**EAS Project ID:** `fc2595c6-479c-48a5-81d9-802978cdf679`
**Firebase project:** `food-sign-e5c42` (Project # 936782920188)

### 7.2 Navigation (`App.js`)

- **Root:** `NavigationContainer` → `Stack.Navigator`.
- **Initial route** decided by `AsyncStorage.userToken` (Login vs `MainApp`).
- **`MainApp`** = `Bottom Tab Navigator` with **5 tabs + center FAB**:
  1. Dashboard (home)
  2. Farmer (people)
  3. **RegisterFarmer** — center floating **+** FAB (60×60, GREEN `#0FA039`)
  4. VerifyFarmer (checkmark-circle)
  5. Farm (map)
- **Stack screens** (pushed): SplashLoading, SelectAssociations, Location, HarvestBoard, Activities, SampleBoard, Audit, Procurement, OfflineMap, PostHarvestDashboard, InventoryDashboard, Batches, AcceptGRN, SelectLanguage, AddNewFarm, FarmerProfile, FarmDetails, AddNewCrop, AddActivity, PreHarvest, WeatherAlerts.
- Wrapped in a custom **`ErrorBoundary`** → friendly error UI.

### 7.3 API Client (`api/api.js`)

```js
function getDefaultBaseUrl() {
  if (window.location?.hostname && isLocalHost(host))
      return `http://${host}:3000`;
  return 'https://foodsignbe.azurewebsites.net';
}
// `EXPO_PUBLIC_API_URL` overrides on native builds (set in eas.json)
```
- Two axios instances: `api` (30 s) and `apiWithImage` (20 s).
- **Endpoint mapping interceptor** translates legacy mobile paths (`/farmers`, `/farms`, `/auth/verify`) to `/admin/*` server routes.
- **`attachAuth()`** interceptor: reads `userToken` from AsyncStorage; if `'dev-web-token'` runs a one-time login as `9066666481 / password` and persists role/name.

### 7.4 Theme & Components
- Brand green `#0FA039`.
- `constants/theme.ts` exports light/dark color tokens.
- Components:
  - `Toast.js` – animated top/bottom toast with imperative ref.
  - `MapComponent.js` + `WebViewMap.js`/`.web.js` – Leaflet inside a WebView (avoids `react-native-maps` crashes).
  - `NessoLogo.js`, themed-text/view, parallax-scroll-view, haptic-tab, external-link.
  - `ui/` – `collapsible.tsx`, `icon-symbol.tsx` (Ionicons + expo-symbols mapping).

### 7.5 i18n
- `i18n/i18n.js` uses custom language detector: AsyncStorage (`@app_language`) → device locale → `en`.
- Caches selection back to AsyncStorage.
- 12 JSON resource files under `i18n/translations/{en,hi,kn,bn,te,ta,ml,mr,tr,or,gu,vi}.json`.
- Keys are dot-namespaced (`sidebar.*`, `dashboard.*`, `tabs.*`, …).

### 7.6 Firebase Phone Auth (`firebase/phoneAuth.js`)
```js
sendPhoneOtp(phone) → auth().signInWithPhoneNumber('+91…')
verifyPhoneOtp(confirmation, otp) → { firebaseIdToken, firebaseUid, firebasePhone }
formatIndianPhoneNumber()   // 10-digit → +91XXXXXXXXXX
```

### 7.7 Utilities

- **`SyncManager.js`** – on NetInfo connect, flushes `offline_farmers` queue via `POST /farmers/sync`.
- **`validators.js`** – Aadhaar (12), Voter ID (`ABC1234567`), PAN (`ABCDE1234F`), Passport, DL, Pincode (6), Mobile (`/^[6-9]\d{9}$/`), Email, Account No (9-18), **IFSC `[A-Z]{4}0[A-Z0-9]{6}`**.
- **`ifscValidator.js`** – calls free **Razorpay IFSC API** `https://ifsc.razorpay.com/{IFSC}`, 600 ms debounce. Auto-fills bank/branch.

### 7.8 Build & Run

```
npm install                     # MobileApp/
npx expo start                  # dev (Expo Go or dev-client)
npm run android                 # expo run:android
npm run ios                     # expo run:ios
npm run web                     # expo start --web
eas build --profile preview     # APK
eas build --profile production
```

`eas.json` declares env `EXPO_PUBLIC_API_URL=https://foodsignbe.azurewebsites.net/api` for non-dev profiles.

---

## 8. Internationalization (12 Languages)

| Code | Language | Sample script |
|---|---|---|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `kn` | Kannada | ಕನ್ನಡ (most complete – 26 KB) |
| `bn` | Bengali | বাংলা |
| `te` | Telugu | తెలుగు |
| `ta` | Tamil | தமிழ் |
| `ml` | Malayalam | മലയാളം |
| `mr` | Marathi | मराठी |
| `tr` | Turkish | Türkçe |
| `or` | Odia | ଓଡ଼ିଆ |
| `gu` | Gujarati | ગુજરાતી |
| `vi` | Vietnamese | Tiếng Việt |

Keys are organized under `sidebar`, `dashboard`, `tabs`, `forms`, `errors`, etc. The repo ships helper scripts `apply_i18n.js`, `repair_i18n.js`, `repair_remaining.js`, `check_corruption.js`, `quick_scan.js`, `true_scan.js` for translation integrity (likely created to recover after corrupted batch translations).

The web admin offers the **same 12 languages** via `/admin/settings/options` payload.

---

## 9. Authentication, Authorization & Security

### 9.1 JWT
- Algorithm **HS256**, secret `JWT_SECRET` (default `foodsign_admin_secret_2026`)
- Expiry **8 h**
- Payload `{ username, role, id }`
- Sent as `Authorization: Bearer <token>`

### 9.2 Login Resolution Order
1. Local file `settings-users.local.json`
2. `User` collection (`users`)
3. Hard-coded admin credentials
4. Status check (≠ `inactive`)
5. Password OR OTP match

### 9.3 Hard-coded Admin (initial bootstrap)
```
username: "admin" or "9066666481"
password: "Admin@2026" or "12345678" or "password" or "admin"
```

### 9.4 Known Security Caveats (intentional doc – do **not** ship as-is)
- Passwords stored **plain-text** → must move to bcrypt
- CORS wildcard `*`
- No rate-limit on `/admin/login`
- No request audit trail
- All admin routes share one middleware (role check is currently a no-op)
- Image payloads up to 50 MB JSON → consider object-storage replacement
- Firebase phone token is **not** currently re-verified server-side (the mobile flow merges Firebase OTP UX with username/password login)

---

## 10. Offline-First / Sync Architecture

| Layer | Mechanism |
|---|---|
| **Cache** | `cached_farms`, `cached_farm_records`, `farms` keys in AsyncStorage; reads are render-then-refresh |
| **Queue** | `offline_farmers` – any farmer registration that fails (network / validation on image) pushed locally |
| **Network watcher** | `NetInfo.addEventListener` in `SyncManager.js` |
| **Flush** | On reconnect → `POST /farmers/sync` with full queue, then clear |
| **Conflict resolution** | none – server is authoritative; client merges by `_id` |

The Dashboard and FarmList screens explicitly **merge** API results with `offline_farmers` so the user always sees own pending records.

---

## 11. Maps, GPS & Polygon Field Mapping

- **Mobile:** Leaflet rendered inside `react-native-webview` (`WebViewMap.js`). Avoids the historic crashes of `react-native-maps` on Expo Go.
  - GPS via **`expo-location`** (foreground only); `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` permissions on Android, `NSLocationWhenInUseUsageDescription` on iOS.
  - Polygon mode: tap to add vertex, Undo, Clear, Calculate Area (Haversine → acres).
  - Accuracy badge + "Locate Me" button + Standard/Satellite layer toggle.
  - Map screenshot saved as base64 (`mapScreenshotUri`).
- **Web:** Leaflet directly; refresh control + mini-thumbnail per farm.
- **Google Maps**: an `app.json` placeholder key (`PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE`) is wired for native Android in case the platform later migrates from WebView Leaflet.

---

## 12. File / Image Handling

- **Storage:** base-64 `data:image/...` strings persisted inside the MongoDB document. No multer / no object storage currently.
- **Fields:** `profileImageUri`, `idProofImageUri`, `bankImageUri` (Farmer); `mapScreenshotUri` (Farm).
- **Capture:** `expo-image-picker` with quality `0.4` to keep payload small.
- **List endpoints exclude image URIs** (e.g. `/admin/farmers` strips `idProofImageUri`, `bankImageUri`) – detail endpoints (`/admin/farmers/:id`) return them.
- **Body limit:** `50 MB` JSON (`express.json({limit:'50mb'})`).

---

## 13. Third-Party Integrations

| Service | Where | Purpose |
|---|---|---|
| **Firebase Auth (Phone)** | Mobile | OTP login; `food-sign-e5c42` |
| **Razorpay IFSC API** | Mobile | `https://ifsc.razorpay.com/{IFSC}` → bank name/branch (free) |
| **Open-Meteo** | Mobile (Dashboard/Weather) | `https://api.open-meteo.com/v1/forecast?…` (Mysuru 12.2958 N, 76.6394 E by default) |
| **Leaflet (OSM tiles)** | Mobile + Web | Map rendering |
| **Chart.js** | Web | Dashboard analytics |
| **Font Awesome** | Web | Iconography |
| **Google Fonts (Inter)** | Web | Typography |
| **Azure App Service** | Backend host | `foodsignbe.azurewebsites.net` |

No Twilio / no SendGrid / no Google Maps tile billing.

---

## 14. Deployment & Hosting

### 14.1 Backend
- **Azure App Service** at `https://foodsignbe.azurewebsites.net`
- **`azure-pipelines.yml`** in `foodsignfe/` configures Azure DevOps CI
- Mongo Atlas connection from `process.env`
- Process listens on `process.env.PORT` (Azure injects this)

### 14.2 Web Admin
- Served as static files from same Express server (`/public/*`)
- SPA fallback (`*` → `public/index.html`)

### 14.3 Mobile
- **EAS Build** profiles: development / preview (APK) / production
- iOS bundle: `com.lingotran.nesso.farmer`; supports tablet
- Android package: same, with adaptive + monochrome icons
- New Architecture **enabled** (`newArchEnabled: true`)
- Expo plugins: `expo-router`, `expo-splash-screen`, `@react-native-firebase/{app,auth}`, `@react-native-community/datetimepicker`, `expo-localization`, `expo-location`
- APK auto-served at `/downloads/FS_may19th.apk` (env `MOBILE_APK_PATH`)

---

## 15. Environment Variables & Configuration

### 15.1 Backend `.env` (`./backend/.env`)
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@2026
JWT_SECRET=foodsign_admin_secret_2026
MOBILE_APK_PATH=./public/downloads/FS_may19th.apk
PORT=3000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://…           # used inside backend/config/db.js
```

### 15.2 Mobile (EAS / `eas.json`)
```
EXPO_PUBLIC_API_URL=https://foodsignbe.azurewebsites.net/api    # preview & production
```

### 15.3 Mobile native config (`app.json`)
- `scheme: "foodsign"`
- iOS info plist:
  - `NSLocationWhenInUseUsageDescription: "Food Sign uses your location to place farms accurately on the map."`
  - `ITSAppUsesNonExemptEncryption: false`
- Android permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

---

## 16. Roles & Permissions

Returned by `/admin/settings/options`:

| value | label |
|---|---|
| `admin` | Admin |
| `farmer` | Farmer |
| `fpo` | FPO |
| `flowerAgent` | Flower Agent |
| `fieldOfficer` | Field Officer |
| `orgFieldOfficer` | (ORG) Field Officer |
| `orgTechSupport` | (ORG) Tech Support |
| `orgAgent` | (ORG) Agent |
| `orgMD` | (ORG) MD |
| `orgFieldAssistant` | (ORG) Field Assistant |
| `orgFarmer` | (ORG) Farmer |
| `orgNESSO` | (ORG) NESSO |
| `orgSouhardha` | (ORG) Souhardha |
| `orgFPO` | (ORG) FPO |
| `orgFPO1` | (ORG) FPO1 |

`participantTypes`: ORG, FPO, Flower Agent, Field Officer, Procurement Manager, Processor.
`participants`: `[{id:'ORG', name:'ORG', type:'ORG'}, …]` (org list grows from DB).

**Enforcement state:** roles are stored & echoed in JWT but server middleware currently does not gate routes by role. Replication should implement this.

---

## 17. Validation Rules

| Field | Rule |
|---|---|
| Mobile number | `/^[6-9]\d{9}$/` (10 digits) |
| Pincode | `/^\d{6}$/` |
| Email | RFC-compliant simple regex |
| IFSC | `/^[A-Z]{4}0[A-Z0-9]{6}$/` |
| Account number | 9-18 digits |
| Aadhaar | 12 digits |
| PAN | `/^[A-Z]{5}\d{4}[A-Z]$/` |
| Voter ID | `/^[A-Z]{3}\d{7}$/` |
| Passport | `/^[A-Z]\d{7}$/` |
| Driving Licence | 15 alnum (`AA0000000000000`) |
| `cropCategory` (server normalizes) | one of "Scented Flowers", "Vegetables", "Fruits", "Cereals", "Other" |
| `farmerId` (server-generated) | `NES-F-<YYYY>-<NNNNN>` |
| MongoDB ObjectId regex (lookup) | `/^[a-f\d]{24}$/i` |

---

## 18. Branding & Design System

| Asset | Value |
|---|---|
| Mobile brand color | `#0FA039` (bright green) |
| Web brand color | `#4CAF50` / dark `#388E3C` / light `#C8E6C9` |
| Status colors | red `#F44336` overdue, yellow `#FFC107` planned/in-progress, green `#4CAF50` done, gray `#B0BEC5` cancelled, blue `#00BCD4` info |
| Logo | `nessologo.png` / `nslogo.jfif` / `nessologo.webp` |
| Splash bg | `farm_bg.jpg` / `new_farm_bg.png` |
| Typography (web) | Inter (Google Fonts) |
| Typography (mobile) | system fonts via `constants/theme.ts` |
| Icon set (mobile) | Ionicons (`@expo/vector-icons`) + `expo-symbols` |
| Icon set (web) | Font Awesome 6 |
| FAB style | 60×60, radius 30, GREEN, white 3px border, elevation/shadow |
| Tab bar | 58 + insets.bottom; active green, inactive `#999`; 10 px / 600 weight labels |
| Toasts | success/error/info, animated, top or bottom anchor |

---

## 19. End-to-End User Flows

### Flow A — Farmer Onboarding (Mobile Field Officer)
1. **Login** (`/admin/login`) → JWT cached.
2. **Dashboard** → tap "Register Farmer" FAB.
3. Fill personal info; pick role; choose `INDEPENDENT / FLOWER_AGENT / FPO`; pick managing FPO / Flower Agent (dropdown filtered by `participantType`).
4. Add **ID Proof** modal (type + number + photo, validated against type).
5. Add **Bank Details** modal (IFSC → Razorpay autofill, type, account no, passbook photo).
6. **Save** → `POST /farmers/register` → server auto-assigns `NES-F-YYYY-NNNNN`, `approvalStatus: pending`.
7. If offline → queued in `offline_farmers`; SyncManager flushes on reconnect via `/farmers/sync`.
8. Admin sees row in `/admin/pending-approvals` page; clicks Approve → `POST /admin/farmers/:id/approve {approved:true}`.

### Flow B — Farm Mapping
1. From FarmerProfile → "Add New Farm".
2. Map opens with current GPS (`expo-location`), satellite layer toggleable.
3. Tap to draw polygon vertices; Calculate Area → autofills `farmArea` (acres).
4. Pick crop year (2024/25/26 pills); choose `organicStage`, `previousPractice`, `waterSource`, `soilType`, `ownership`, `fieldType`.
5. Save → `POST /farms/new`.

### Flow C — Crop & Activity Logging
1. FarmDetails → Add New Crop → form (name, type Main/Inter/Border, acre, est harvest+unit, water/method/practice toggles, sowing/harvest date, multiple-harvest checkbox).
2. `POST /crops`.
3. FarmDetails → ADD ACTIVITY → pick activity type (10 options); fill harvest- or land-prep-specific sub-forms; open Input Picker (Chemical/Organic/Inventory/Other – ~180 catalog items, searchable); enter quantity/unit/cost; system composes `notes`.
4. `POST /activities`.

### Flow D — Pre-Harvest & Reporting
1. Dashboard → Pre-Harvest sidebar item.
2. Tabs Report / Activities / Crop History; donut chart of statuses; bar charts of activity & crop counts.
3. Add activity modal (hierarchical Agent → Farmer → Farm → Crop pickers; category; season; growth stage if Crop History).
4. `POST /pre-harvest`.
5. Admin Web → Reports → choose filters (`approvalStatus`, `status`, `growthStage`, include/exclude flower agents, missing farm, only pre-harvest) → `GET /admin/reports/preharvest` → row-level join with farmer-farm-crop-activity rollup → export.

### Flow E — Post-Harvest, GRN & Inventory
1. Mobile → PostHarvestDashboard → Batches (BatchesScreen).
2. ORDER VIEW / BATCH VIEW; filter by association/supplier/grade/crop/dates.
3. SCAN QR FAB → `AcceptGRNScreen` (`expo-camera` reads QR/EAN13/EAN8/PDF417/Aztec/DataMatrix; 2 s debounce; manual entry fallback).
4. On accept → server registers `inventory` doc with `batchId` UNIQUE.
5. InventoryDashboardScreen → SELL / TRANSFER / PROCESS FABs change `status`.

### Flow F — Sampling & Audits
1. Mobile SampleBoardScreen / Web Onboarding tabs.
2. Sample status `Queue` → `Sent` (lab); auditor reviews `AuditScreen` PENDING tab → approve/reject → `PUT /admin/audits/:id`.

---

## 20. Step-by-Step Replication Plan

A team can re-build FoodSign in roughly the following order:

### 20.1 Backend
1. `npm init -y` → install `express mongoose jsonwebtoken cors dotenv`.
2. Create `backend/config/db.js` (Mongoose connect from `MONGODB_URI`).
3. Create models for the 12 collections per §3.
4. Implement `server.js`:
   - JWT helpers + `authMiddleware` + `adminOnlyMiddleware`.
   - `/admin/login` flow with local-file → DB → hardcoded fallback.
   - CRUD routes per §5.
   - Soft-delete cascade (farmer → farms).
   - Pre-harvest report aggregation pipeline (per §5.9).
   - Static + SPA fallback last.
   - 50 MB JSON limit.
5. Set up Azure pipeline (`azure-pipelines.yml`) → Azure App Service.

### 20.2 Web Admin
6. Author `public/index.html` with login + app shell (sidebar + topbar + main).
7. Write `public/app.js` (vanilla JS) – view switching, `authFetch()` wrapper, CRUD modals, Chart.js dashboard, Leaflet farm map.
8. Style with `styles.css` using the design tokens in §18.
9. Wire `db_architecture.html` static reference + post-harvest modal HTML.

### 20.3 Mobile
10. `npx create-expo-app MobileApp --template`.
11. Install dependency set from §7.1.
12. Configure `app.json` (bundleId `com.lingotran.nesso.farmer`, scheme `foodsign`, splash, icons, Firebase plugins).
13. Drop `google-services.json` from `food-sign-e5c42` Firebase project.
14. Implement `api/api.js` with base-URL detection + endpoint mapping + dev-web-token fallback.
15. Set up i18n with 12 language JSONs + AsyncStorage detector.
16. Implement `SyncManager` (NetInfo + `offline_farmers` queue).
17. Build screens per §22 in this order:
    - Login → SplashLoading → SelectLanguage → SelectAssociations
    - Dashboard → FarmList → FarmerProfile → FarmDetails
    - RegisterFarmer → VerifyFarmer
    - AddNewFarm → AddNewCrop → AddActivity → PreHarvest → HarvestBoard
    - WeatherAlerts → ActivitiesScreen → SampleBoard → Audit
    - PostHarvestDashboard → Batches → AcceptGRN → InventoryDashboard → Procurement
    - LocationScreen → OfflineMapScreen
18. Wire navigation per `App.js` (Stack + bottom tabs + center FAB).
19. EAS build profiles (dev / preview APK / production).

### 20.4 Hardening Backlog (apply post-MVP)
- Hash passwords (bcrypt) on user save / login.
- Tighten CORS to known origins.
- Rate-limit `/admin/login`.
- Move base64 images to Azure Blob / S3 + signed URLs.
- Server-side verify Firebase ID token on phone login.
- Role-based route guards.
- Audit trail of admin actions.

---

## 21. Known Gaps / Improvement Backlog

| # | Gap | Recommendation |
|---|---|---|
| 1 | Plaintext passwords | bcrypt + login-attempt throttle |
| 2 | No multer / object storage | Move images off-DB to Azure Blob |
| 3 | Open CORS | Restrict to admin domain + native scheme |
| 4 | `backend/models/*` referenced but not committed in repo stub | Add models matching §3 |
| 5 | Mobile dependency list contains backend libs (`express, mongoose, jsonwebtoken`) | Clean dev-only artifacts |
| 6 | Web app monolithic 8 K-line `app.js` | Modularize (ESM modules / Vite) |
| 7 | `tmp-expo-postharvest.log` (45 KB) committed | Add to `.gitignore` |
| 8 | Hard-coded "Mysuru" weather coords | Use farm lat/lon |
| 9 | No automated tests | Add Jest + Detox / Cypress |
| 10 | i18n repair scripts indicate translation corruption history | Maintain canonical English keys + auto-translation pipeline |

---

## 22. Appendix – Full Screen Inventory

26 React Native screens (all under `MobileApp/screens/`). Sizes give an idea of complexity.

| # | File | Size | Purpose (1-liner) |
|---|---|---|---|
| 1 | `LoginScreen.js` | 15 KB | Username/phone + password OR OTP login |
| 2 | `SplashLoadingScreen.js` | 11 KB | App boot splash & initial data prefetch |
| 3 | `SelectLanguageScreen.js` | 5 KB | Pick 1 of 12 languages, persists `@app_language` |
| 4 | `SelectAssociationsScreen.js` | 12 KB | Multi-select associations the user manages |
| 5 | `LocationScreen.js` | 7 KB | Manual location entry / picker |
| 6 | `DashboardScreen.js` | 74 KB | Main hub – sidebar drawer, KPIs, charts, year filter, flower-agent filter, weather widget |
| 7 | `FarmListScreen.js` | 41 KB | Farmer / Farm tab with search, cache, swipe nav |
| 8 | `FarmerProfileScreen.js` | 35 KB | Farmer detail with tabs FARM/FACILITIES/PRODUCE/FINANCIAL/INVENTORY/AGREEMENTS/TOKENS |
| 9 | `FarmDetailsScreen.js` | 33 KB | Per-farm tabs Crops/Activities/Weather/Certificates/Soil/Crop History |
| 10 | `RegisterFarmerScreen.js` | 63 KB | Full farmer registration form (personal+ID+bank+address) |
| 11 | `VerifyFarmerScreen.js` | 13 KB | Approve / reject pending farmers |
| 12 | `AddNewFarmScreen.js` | 41 KB | Map polygon farm registration |
| 13 | `AddNewCropScreen.js` | 37 KB | Per-farm crop add/edit with calendar pickers |
| 14 | `AddActivityScreen.js` | 35 KB | Log activity + 180-item input picker + cost composition |
| 15 | `ActivitiesScreen.js` | 56 KB | Activity board (PENDING/APPROVED, calendar view, filters) |
| 16 | `PreHarvestScreen.js` | 54 KB | Report / Activities / Crop History tabs + add-activity modal |
| 17 | `HarvestBoardScreen.js` | 27 KB | Upcoming harvest alerts (TODAY/TOMORROW/PLANNED) |
| 18 | `WeatherAlertsScreen.js` | 15 KB | Open-Meteo forecast + activity tips |
| 19 | `SampleBoardScreen.js` | 18 KB | Sampling queue management |
| 20 | `AuditScreen.js` | 12 KB | Audit PENDING/APPROVED tabs |
| 21 | `PostHarvestDashboardScreen.js` | 7 KB | Hub → Batches & Inventory |
| 22 | `BatchesScreen.js` | 22 KB | ORDER/BATCH view + filters + QR scan |
| 23 | `AcceptGRNScreen.js` | 9 KB | Camera-based GRN scanner (QR/EAN/PDF417/Aztec/DataMatrix) |
| 24 | `InventoryDashboardScreen.js` | 17 KB | Inventory with SELL/TRANSFER/PROCESS actions |
| 25 | `ProcurementListScreen.js` | 11 KB | Procurement orders list |
| 26 | `OfflineMapScreen.js` | 7 KB | Download map tiles for offline use |

---

## END OF DOCUMENT

This PRD is a faithful, end-to-end specification of the FoodSign platform. Combined with the supplied source files it should be sufficient to **replicate the product from scratch** — including data model, REST surface, web SPA structure, mobile screen inventory, i18n, offline strategy, and hosting topology.
