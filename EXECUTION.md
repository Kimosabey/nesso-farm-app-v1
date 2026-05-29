<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Execution Plan — Phase-by-Phase

**The "what to do today, this week, this phase" master checklist.**
Every step is a concrete action. Copy commands, do them, tick the box.

</div>

---

## How to use this doc

- **One phase at a time.** Don't skip ahead. Each phase has exit criteria — meet them before moving on.
- Tick boxes as you finish steps.
- If a command fails, fix the root cause; don't proceed with a red CI.
- Daily cadence: short standup at start of day, demo at end of phase.

## Plan summary

| Phase | Focus | Duration | Demo |
|---|---|---|---|
| **Phase −1** | Pre-flight (accounts, secrets, repo) | 1–2 days | Repo exists, CI green |
| **Phase 0** | Foundations (monorepo, design system, 4 shells) | 1 week | 4 "Hello Nesso" surfaces running with shared theme |
| **Phase 1** | Auth & Identity | 1 week | Login works on web + mobile |
| **Phase 2** | Farmer & Farm core | 2 weeks | Register farmer offline → sync → approve on web |
| **Phase 3** | Crops, Activities, Pre-Harvest | 2 weeks | Log activity offline with photos & cost |
| **Phase 4** | Quality, Procurement, Inventory | 2 weeks | Procurement → QR-scan → inventory batch |
| **Phase 5** | QR, Notifications, Reports | 2 weeks | Consumer scans QR → trace page in < 2s |
| **Phase 6** | Hardening & GA | 2 weeks | v1 live |

Full phase breakdown: [`docs/plan/11-implementation-phases.md`](docs/plan/11-implementation-phases.md).

---

# Phase −1 · Pre-flight (1–2 days)

> Goal: every account exists, every secret is parked safely, the repo is created.

## A · Verify your machine

Run these in PowerShell. Every one must print a version:

```powershell
node -v          # v20.x.x  (you should have this)
pnpm -v          # 9.x.x    (if missing: corepack enable; corepack prepare pnpm@latest --activate)
git --version
docker --version
java -version    # 17.x.x
adb version      # comes with Android Studio platform-tools
code -v
```

- [ ] All commands return a version (no errors)
- [ ] Android Studio opens, you've created at least one AVD (Pixel 7, API 34)
- [ ] Expo Go installed on phone (will replace with dev client later)
- [ ] USB debugging works: `adb devices` lists your phone

If any fail, fix in [`SETUP.md`](SETUP.md) before going further.

## B · Create accounts

Sign up for each. Use the same email everywhere.

- [ ] **GitHub** — create org `nesso-nrgroup` (or use existing). Create a new private repo `nesso`.
- [ ] **Firebase** — create project `nesso-prod`. Enable Phone Auth + Cloud Messaging.
  - Download `google-services.json` (Android) — save it; don't commit.
- [ ] **Expo** — sign up at https://expo.dev. Note your username — we'll use it in `app.json`.
- [ ] **Sentry** — create org. Create 4 projects: `nesso-api`, `nesso-web`, `nesso-portal`, `nesso-mobile`. Save each DSN.
- [ ] **MongoDB Atlas** — sign up. Don't create a cluster yet (we'll use local Docker first).
- [ ] **Vercel** — sign up. Link to your GitHub. (Don't deploy yet.)

## C · Park your secrets

Create a password manager entry "Nesso secrets":

| Key | Where it comes from |
|---|---|
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → PAT (repo + workflow scope) |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase → Project Settings → Service accounts → Generate new private key |
| `EXPO_TOKEN` | https://expo.dev/accounts/[you]/settings/access-tokens |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth tokens (project:read, project:write, org:read) |
| `SENTRY_DSN_*` | One per project (4 total) |
| `MONGODB_URI_LOCAL` | `mongodb://nesso:nesso@localhost:27017/nesso?authSource=admin` (we'll set this up in Phase 0) |
| `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY` | We'll generate in Phase 0 |
| `BOOTSTRAP_ADMIN_PHONE` | `9066666481` (or your number) |
| `BOOTSTRAP_ADMIN_PASSWORD` | something long, e.g. via `openssl rand -base64 24` |

## D · Repo init

```powershell
# In your projects folder (e.g. d:/Harshan/)
git clone https://github.com/<your-org>/nesso.git
cd nesso

# Copy in the docs from the planning folder
# (manually copy d:/Harshan/farmer-app/nesso-farm-app-v1/* into the new nesso/ repo,
#  including: README.md, SETUP.md, DESIGN_BRIEF.md, EXECUTION.md, docs/, .gitignore (later))

git add .
git commit -m "chore: import planning docs from nesso-farm-app-v1"
git push origin main
```

- [ ] Repo created on GitHub, planning docs pushed
- [ ] All secrets stored in password manager (never in repo)
- [ ] **Definition of done for Phase −1:** every checkbox in A, B, C, D ticked.

---

# Phase 0 · Foundations (1 week)

> Goal: monorepo scaffolded, design tokens shipping, 4 "Hello Nesso" surfaces run locally with the shared brand theme.

> ## ✅ Already scaffolded for you
>
> The full monorepo is already laid out — every config, every shell, every Hello-Nesso screen. You don't need to run `create-next-app`, `nest new`, or `create-expo-app`. Just `pnpm install` + `pnpm dev` and you're up.
>
> ### What's in place
>
> ```
> nesso-farm-app-v1/
> ├── package.json                # pnpm workspace root
> ├── pnpm-workspace.yaml
> ├── turbo.json                  # turbo task pipelines
> ├── tsconfig.base.json
> ├── .gitignore, .npmrc, .nvmrc, .editorconfig, .prettierrc
> ├── .env.example                # root env (docker-compose values)
> ├── .vscode/extensions.json     # recommended IDE extensions
> ├── docker-compose.yml          # Mongo + Redis + Minio + Mailhog
> ├── .github/workflows/ci.yml    # lint + typecheck + test + build
> │
> ├── packages/
> │   ├── config/                 # shared eslint + tsconfig (base/next/nest/expo) + prettier
> │   ├── design-system/
> │   │   ├── tokens.json         # ← W3C tokens FROM design handoff
> │   │   ├── tailwind-preset.js  # ← single source of truth for both web & mobile
> │   │   └── src/theme.css       # CSS vars · light + dark · reduced-motion
> │   ├── i18n/                   # 12-language scaffold (EN seeded)
> │   └── shared-types/           # Zod schemas (mobile/PAN/IFSC/Aadhaar + Role enum)
> │
> ├── apps/
> │   ├── api/                    # NestJS 10: main.ts, app.module, health controller, Swagger
> │   ├── web/                    # Next.js 15 + Tailwind: brand aurora home + login placeholder
> │   ├── portal/                 # Next.js 15 public: /t/[code]/page.tsx mock trace (ISR 5min)
> │   └── mobile/                 # Expo 52 + RN 0.76 + NativeWind: Splash → Home, tablet-aware
> │
> └── docs/                       # (planning) — unchanged
> ```
>
> ### Day 1–6 of Phase 0 → collapsed into **one install + dev step**
>
> ```powershell
> cd d:\Harshan\farmer-app\nesso-farm-app-v1
> pnpm install                          # ~3–5 min first time
> docker compose up -d                  # start Mongo + Redis + Minio + Mailhog
>
> # Run everything in parallel
> pnpm dev
> ```
>
> | URL | What you'll see |
> |---|---|
> | http://localhost:3000/api/v1/health | `{"status":"ok",…}` |
> | http://localhost:3000/api/docs | Swagger (NestJS) |
> | http://localhost:3001 | Web dashboard — "Hello Nesso" with brand aurora |
> | http://localhost:3001/login | Glass login card (placeholder) |
> | http://localhost:3002 | QR portal landing |
> | http://localhost:3002/en/t/SAMPLE12 | Mock trace page |
> | Expo dev server | Scan QR with Expo Go → splash → Hello Nesso (tablet-aware) |
> | http://localhost:9001 | Minio console (user `nesso` / pass `nessoadmin`) |
> | http://localhost:8025 | Mailhog UI |
>
> ### Phase 0 remaining tasks (after install + dev works)
>
> - [ ] Generate icon + splash PNGs from `docs/nesso___nr_group_logo.jpeg` into `apps/mobile/assets/`
> - [ ] Configure Ladle / Storybook in `packages/design-system` for component previews
> - [ ] Open a PR to verify GitHub Actions CI is green
> - [ ] Theme toggle UI on web (we have `next-themes` wired; needs a switcher component)
> - [ ] Record the demo: all 4 surfaces with brand applied, both themes
>
> Skip ahead to **Phase 1** below once the demo is recorded.

## Day 1–2 · Monorepo scaffold

### 1. Initialize pnpm workspace

```powershell
# At repo root
pnpm init
# Edit package.json: add "name":"nesso", "private":true, "packageManager":"pnpm@9.x.x"
```

Create `pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

Create `.npmrc`:
```
auto-install-peers=true
strict-peer-dependencies=false
```

Create `.gitignore` (Node + Expo + Next standard):
```
node_modules
.next
.turbo
.expo
dist
build
*.log
.env*
!.env.example
.DS_Store
.idea
.vscode/*
!.vscode/extensions.json
android/build
android/app/build
ios/build
ios/Pods
ios/DerivedData
```

### 2. Add Turborepo

```powershell
pnpm add -Dw turbo
```

Create `turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev":      { "cache": false, "persistent": true },
    "build":    { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "build/**"] },
    "lint":     {},
    "typecheck":{},
    "test":     { "dependsOn": ["^build"] }
  }
}
```

### 3. Shared config packages

```powershell
mkdir packages\config
mkdir packages\design-system
mkdir packages\i18n
mkdir packages\shared-types
```

**`packages/config/package.json`** — exports `eslint-config`, `tsconfig`, `prettier-config`.
**`packages/design-system/package.json`** — exports tokens + tailwind preset.
**`packages/i18n/package.json`** — 12-language JSON dictionaries.
**`packages/shared-types/package.json`** — Zod schemas + generated TS types.

### 4. Drop in design tokens

```powershell
copy "docs\ui-ux-design-prototypes-flow\farmer-app-ui-ux-flow\design_handoff_nesso\design-system.tokens.json" "packages\design-system\tokens.json"
```

Create `packages/design-system/tailwind-preset.js` — read `tokens.json` and export Tailwind config (colors, spacing, radii, shadows, fontFamily, motion). This is the **single source of truth** for visual style across all apps.

- [ ] `pnpm install` from root works
- [ ] `pnpm tsc --version` works (TS resolved from workspace)

## Day 3 · API skeleton (NestJS)

```powershell
mkdir apps\api
cd apps\api
pnpm dlx @nestjs/cli new . --package-manager pnpm --skip-git
```

Install dependencies:
```powershell
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger @nestjs/throttler
pnpm add @nestjs/mongoose mongoose
pnpm add ioredis bullmq
pnpm add passport passport-jwt bcrypt
pnpm add nestjs-pino pino-http pino-pretty
pnpm add zod nestjs-zod
pnpm add helmet compression
pnpm add -D @types/bcrypt @types/passport-jwt
```

Set up:
- [ ] `.env.example` with all required env vars
- [ ] `src/main.ts` — Helmet + compression + Pino + Swagger at `/api/docs`
- [ ] `src/app.module.ts` — `ConfigModule`, `MongooseModule`, `ThrottlerModule`
- [ ] `src/health/health.controller.ts` — `GET /health` returns `{status:'ok', uptime, version}`
- [ ] Run `pnpm --filter api start:dev` — server up on `:3000`
- [ ] Visit `http://localhost:3000/health` — returns 200

## Day 4 · Web skeleton (Next.js 15)

```powershell
cd ..\..
pnpm dlx create-next-app@latest apps/web --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
cd apps\web
```

Install:
```powershell
pnpm add @tanstack/react-query @tanstack/react-table zustand react-hook-form zod sonner cmdk lucide-react
pnpm add framer-motion next-themes
pnpm add @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-slot
pnpm add -D @types/node
```

Set up:
- [ ] Extend Tailwind with `presets: [require('@nesso/design-system/tailwind-preset')]`
- [ ] Add Inter + Montserrat via `next/font` (self-hosted)
- [ ] Build the auth layout shell + sidebar shell (just placeholders)
- [ ] `src/app/page.tsx` shows "Hello Nesso" centered with the brand gradient backdrop
- [ ] `src/app/(auth)/login/page.tsx` shows the glass login card (static, no logic yet)
- [ ] `pnpm --filter web dev` → `http://localhost:3001` renders with the brand

## Day 5 · QR Portal skeleton (Next.js)

```powershell
pnpm dlx create-next-app@latest apps/portal --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
cd apps\portal
```

Install:
```powershell
pnpm add framer-motion next-themes lucide-react
```

Set up:
- [ ] Tailwind preset from `@nesso/design-system`
- [ ] `src/app/[locale]/t/[code]/page.tsx` renders a mock trace page using sample data
- [ ] Self-hosted fonts (no Google Fonts on hot path)
- [ ] `pnpm --filter portal dev` → `http://localhost:3002`

## Day 6 · Mobile skeleton (Expo TS)

```powershell
cd ..\..
pnpm dlx create-expo-app@latest apps/mobile --template blank-typescript
cd apps\mobile
```

Install:
```powershell
npx expo install expo-splash-screen expo-font expo-localization expo-camera expo-location expo-image expo-haptics expo-blur expo-notifications
npx expo install react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens
pnpm add nativewind tailwindcss
pnpm add zustand @tanstack/react-query react-hook-form zod
pnpm add @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
pnpm add react-native-mmkv
pnpm add -D @types/react
```

Set up:
- [ ] Configure NativeWind v4 (`tailwind.config.js` with `presets: [require('@nesso/design-system/tailwind-preset')]`)
- [ ] `app.json`: `scheme: "nesso"`, bundle id `ai.graylinx.nesso.farmer`, brand splash colors
- [ ] `App.tsx`: NavigationContainer → Stack → SplashLoading → MainTabs (placeholder)
- [ ] Splash screen with logo
- [ ] `pnpm --filter mobile start` → open in Expo Go via QR or `a` for Android emulator
- [ ] **You see "Hello Nesso" on your phone**

## Day 7 · Local infra + CI

### docker-compose.yml

```yaml
services:
  mongo:
    image: mongo:7
    ports: ["27017:27017"]
    environment:
      MONGO_INITDB_ROOT_USERNAME: nesso
      MONGO_INITDB_ROOT_PASSWORD: nesso
    volumes: ["mongo:/data/db"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  minio:
    image: minio/minio
    ports: ["9000:9000","9001:9001"]
    environment:
      MINIO_ROOT_USER: nesso
      MINIO_ROOT_PASSWORD: nessoadmin
    command: server /data --console-address ":9001"
    volumes: ["minio:/data"]
  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025","8025:8025"]
volumes:
  mongo:
  minio:
```

```powershell
docker compose up -d
```

- [ ] All 4 services up; visit Minio console at http://localhost:9001 (user: nesso, pass: nessoadmin)

### Storybook for design system

```powershell
mkdir packages\design-system\stories
# Set up Ladle (faster than Storybook) for design-system package:
pnpm --filter @nesso/design-system add -D @ladle/react
```

- [ ] Render Button / Card / Toast / Input primitives in light + dark on Ladle

### GitHub Actions CI

`.github/workflows/ci.yml`:
```yaml
name: CI
on: [pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

- [ ] Open a PR, CI runs green

## Phase 0 · Definition of Done

- [ ] `pnpm install` works from a fresh clone
- [ ] `docker compose up -d` starts Mongo/Redis/Minio/Mailhog
- [ ] `pnpm dev` runs api, web, portal, mobile in parallel
- [ ] All 4 surfaces render "Hello Nesso" with the brand theme
- [ ] Light + dark theme toggle works on web and mobile
- [ ] Design-system Ladle shows ≥ 5 primitives in both themes
- [ ] CI is green on `main`
- [ ] **Demo recorded:** screen recording showing all 4 surfaces with brand applied

---

# Phase 1 · Auth & Identity (1 week)

> Goal: users can log in everywhere; RBAC enforced.

## Day 1 · JWT + bcrypt + auth module

```powershell
# Generate RS256 keypair
cd apps\api
mkdir keys
# Use openssl (Git Bash) or:
node -e "const crypto=require('crypto');const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});require('fs').writeFileSync('keys/private.pem',privateKey);require('fs').writeFileSync('keys/public.pem',publicKey);"
```

- [ ] Add `JWT_PRIVATE_KEY_PATH` + `JWT_PUBLIC_KEY_PATH` to `.env`
- [ ] Implement `auth.module.ts` with `JwtModule.registerAsync` (RS256, 15min access, 30d refresh)
- [ ] `POST /auth/password` — bcrypt(12) compare
- [ ] `POST /auth/refresh` — refresh token rotation with Redis blacklist
- [ ] `POST /auth/logout` — blacklist current refresh
- [ ] `GET /auth/me` — return current user

## Day 2 · Firebase OTP + users module

- [ ] Initialize Firebase Admin SDK in NestJS (`firebase-admin`)
- [ ] `POST /auth/otp/send` — client calls Firebase Phone Auth directly; backend optional log
- [ ] `POST /auth/otp/verify` — verify Firebase ID token, look up user in `users` or `farmers`, issue our tokens
- [ ] `users` module CRUD with bcrypt
- [ ] Bootstrap admin seed script: `pnpm --filter api seed:admin` — creates the one admin user from `.env`

## Day 3 · RBAC + audit log

- [ ] `JwtAuthGuard` (global) + `@Public()` opt-out decorator
- [ ] `@Roles()` decorator + `RolesGuard`
- [ ] `@Permission()` decorator + scope filter helper `buildScopeFilter(user)`
- [ ] `AuditLogInterceptor` writes `{actorId, action, resource, before, after, ip, at}` to `auditLogs`
- [ ] Rate limit `/auth/*` to 5/min/IP via `@nestjs/throttler`

## Day 4 · Web login + session

- [ ] `src/app/(auth)/login/page.tsx` — server action `POST /auth/password` → set `nesso_session` HttpOnly cookie
- [ ] `middleware.ts` — redirect to `/login` if no cookie
- [ ] `lib/api.ts` server fetch helper attaches Bearer token from cookie
- [ ] `useCurrentRole()` hook reads claim from `/auth/me`
- [ ] `<RequireRole>` wrapper hides UI affordances
- [ ] Test: bootstrap admin logs in and lands on `/`

## Day 5 · Mobile login (phone + OTP)

- [ ] Install `@react-native-firebase/app` + `@react-native-firebase/auth`
- [ ] **Switch from Expo Go to dev client** (Firebase needs native code):
  ```powershell
  pnpm --filter mobile dlx eas login
  pnpm --filter mobile dlx eas build --profile development --platform android
  ```
- [ ] Install dev client APK on phone
- [ ] Build `LoginScreen.tsx` (phone input) + `OtpScreen.tsx` (6-digit)
- [ ] Firebase signs in → get `firebaseIdToken` → POST to `/auth/otp/verify` → store tokens in MMKV (encrypted)
- [ ] Splash → `authStore.token` check → Login OR MainTabs

## Phase 1 · Definition of Done

- [ ] Admin logs in on web with password
- [ ] Field officer logs in on mobile with phone + OTP
- [ ] Tokens rotate transparently
- [ ] Refresh-token reuse triggers all-session logout
- [ ] Rate limit blocks > 5 login attempts / min / IP
- [ ] Every login + logout writes to `auditLogs`
- [ ] **Demo recorded**

---

# Phase 2 · Farmer & Farm core (2 weeks)

> Goal: register farmer offline → sync → approve on web.

## Week 1 · Backend + S3 + sync infrastructure

### Day 1–2: Files module + S3
- [ ] Install `@aws-sdk/client-s3 @aws-sdk/s3-request-presigner` in api
- [ ] Configure Minio as local S3 (endpoint `http://localhost:9000`, bucket `nesso-dev`)
- [ ] `POST /files/sign-upload` returns `{uploadUrl, key, expiresAt}`
- [ ] `GET /files/sign-read/:key` returns 15-min URL

### Day 3–4: Farmers module
- [ ] Mongoose schema (per `docs/plan/03-database-schema.md`)
- [ ] CRUD + approval (`POST /farmers/:id/approve`)
- [ ] Auto-assign `farmerId NES-F-YYYY-NNNNN`
- [ ] Soft-delete + cascade (transaction across farms/crops/activities)
- [ ] Idempotency middleware reading `Idempotency-Key`

### Day 5–6: Farms module
- [ ] Mongoose schema with 2dsphere index on `location`
- [ ] CRUD + `GET /farms/nearby?lat&lng&radiusKm`
- [ ] Polygon area helper (Haversine spherical-excess) — shared lib

### Day 7: Sync endpoints
- [ ] `POST /farmers/sync` batch upsert (up to 200, idempotent)
- [ ] `POST /farms/sync` similar
- [ ] Geo module: `GET /geo/ifsc/:ifsc` (proxy + 30d Redis cache); `GET /geo/reverse?lat&lng`

## Week 2 · Mobile + Web UI

### Day 8–9: Mobile SQLite outbox
- [ ] `apps/mobile/src/db/migrations/001_init.sql` creates all `*_cache` + `mutation_outbox`
- [ ] `db/index.ts` opens SQLite + runs migrations on app start
- [ ] `sync/SyncManager.ts` — listens to NetInfo, drains outbox with exp backoff
- [ ] Outbox status surfaced in `Settings → Sync Health`

### Day 10–11: Mobile farmer screens
Recreate from `docs/ui-ux-design-prototypes-flow/.../app/screens_create.jsx`:
- [ ] `screens/RegisterFarmer.tsx` — 4-step form, S3 image upload via pre-signed URLs
- [ ] `screens/FarmerList.tsx` with SQLite-backed read + offline merge
- [ ] `screens/FarmerProfile.tsx` (tabs: Farm/Facilities/Produce/Financial/Inventory/Agreements/Tokens)
- [ ] `screens/VerifyFarmer.tsx` — approve/reject (if scope allows)

### Day 12–13: Mobile farm screens
Recreate from prototype:
- [ ] `screens/AddNewFarm.tsx` — Leaflet WebView, tap-to-add polygon, undo/clear, area calc, satellite layer toggle
- [ ] `screens/FarmList.tsx` + `screens/FarmDetails.tsx`

### Day 14: Web farmer + farm pages
Recreate from `docs/ui-ux-design-prototypes-flow/.../web/web_pages.jsx`:
- [ ] `/farmers` list (TanStack Table + URL-state filters)
- [ ] `/farmers/[id]` detail (server component)
- [ ] `/approvals` queue (inline approve/reject)
- [ ] `/farms` list (table ↔ map toggle via react-leaflet)

## Phase 2 · Definition of Done

- [ ] Mobile: register a farmer offline (KYC + bank + photos) → reconnect → record appears in web `/farmers/pending`
- [ ] Admin approves → mobile gets a push (we'll improve in Phase 5; for now poll)
- [ ] Add a farm with a 5-vertex polygon → area matches expected within ±2%
- [ ] Soft-delete a farmer → all their farms also marked deleted
- [ ] No base64 images anywhere — all blobs in S3 with pre-signed URLs
- [ ] Idempotent sync: replaying the same outbox row twice creates one record
- [ ] **Demo recorded**

---

# Phase 3 · Crops, Activities, Pre-Harvest (2 weeks)

> Goal: the day-to-day operational loop.

## Week 1 · Backend + catalog

- [ ] `crops` module CRUD
- [ ] `activities` module CRUD + `POST /activities/sync` (batch up to 500, idempotent)
- [ ] `preHarvest` module CRUD with denormalization
- [ ] `catalog` module: `popCatalog`, `inputCatalog` collections + seed scripts
- [ ] Seed ~180 inputs from FoodSign references
- [ ] BullMQ worker + Redis queue: `activities:reminder` schedules at scheduledOn − 24h

## Week 2 · UI

### Mobile (recreate from prototypes)
- [ ] `AddNewCrop.tsx` — autocomplete crop, variety, calendar pickers
- [ ] `AddActivity.tsx` — 10 activity types + full-screen input picker modal (search the 180-item catalog, multilingual tokens, recents) + photos + geotag + cost composer
- [ ] `Activities.tsx` — Pending/Done tabs, calendar ↔ list views, filters, swipe-actions
- [ ] `PreHarvest.tsx` — Report / Activities / Crop History tabs with the hierarchical picker

### Web (recreate from prototypes)
- [ ] `/crops` filterable list
- [ ] `/activities` calendar + list views + filter builder + bulk reschedule
- [ ] `/pre-harvest` sub-tabs (Report / Activities / Crop History / Nutrition)

## Phase 3 · Definition of Done

- [ ] Log a watering activity offline with 2 inputs + 1 photo + cost in ≤ 60 s
- [ ] Photo uploads to S3 in parallel without blocking save
- [ ] Activity appears on web list + cost shows correctly
- [ ] POP compliance auto-flags on matched activities
- [ ] Reminder push fires 24h before `scheduledOn`
- [ ] **Demo recorded**

---

# Phase 4 · Quality, Procurement, Inventory (2 weeks)

> Goal: post-onboarding supply chain.

## Week 1 · Backend

- [ ] `samples` module + status machine (Queue → Sent → Received → Tested → Approved/Rejected)
- [ ] `audits` module + approve/reject with reason + separation of duties
- [ ] `procurement` module + payment tracking + `/procurement/stats`
- [ ] `warehouses` module + 2dsphere
- [ ] `inventory` module:
  - `POST /inventory/grn/accept` — atomic
  - `POST /inventory/:batchId/transition` (status machine)
  - `POST /inventory/:batchId/sell|transfer|process`
  - `stageHistory[]` append-only

## Week 2 · UI

### Mobile (recreate from prototypes)
- [ ] `SampleBoard.tsx` — Queue/Sent tabs
- [ ] `Audit.tsx` — Pending/Approved/Rejected tabs
- [ ] `Procurement.tsx` — list + payment recorder sheet
- [ ] `PostHarvestDashboard.tsx`
- [ ] `Batches.tsx` — ORDER/BATCH toggle + scan FAB
- [ ] `AcceptGRN.tsx` — multi-format scanner (`expo-camera` configured for QR, EAN-13, EAN-8, PDF417, Aztec, DataMatrix, Code 128) + manual fallback
- [ ] `InventoryDashboard.tsx` — SELL / TRANSFER / PROCESS actions

### Web (recreate from prototypes)
- [ ] `/samples`, `/samples/[id]`
- [ ] `/audits`
- [ ] `/procurement`, `/procurement/[id]`, `/procurement/new`
- [ ] `/warehouses`, `/warehouses/[id]`
- [ ] `/inventory/batches`, `/inventory/batches/[batchId]` (timeline of stageHistory)
- [ ] `/inventory/grn`, `/inventory/movements`

## Phase 4 · Definition of Done

- [ ] Procurement order → accept via QR scan on mobile → inventory batch created
- [ ] Transition batch through Cleaned → Packed on web → stageHistory captures every step
- [ ] Concurrent transitions fail-safe (optimistic concurrency via `updatedAt`)
- [ ] Multi-format scan supports all 7 listed formats
- [ ] **Demo recorded**

---

# Phase 5 · QR Traceability, Notifications, Reports (2 weeks)

> Goal: consumer-facing trace + reporting + notifications.

## Week 1

- [ ] `qr` module:
  - `POST /qr/generate` (renders 512×512 PNG via `qrcode`, uploads to S3, denormalizes `payload`)
  - `POST /qr/scan` (authed)
  - `GET /public/trace/:code` (**public**, no auth, privacy redaction)
- [ ] BullMQ `qr:refresh-payload` worker triggered by inventory transitions
- [ ] Portal: `/t/[code]` ISR page rendering the design prototype, with `revalidate: 300`
- [ ] Privacy: `farmers.publicTraceConsent` toggle on profile, redacts at backend

## Week 2

- [ ] `notifications` module: push (FCM via Expo), in-app inbox, `register-device`
- [ ] BullMQ `notifications:dispatch` + `notifications:schedule` workers
- [ ] `weather:advisories` daily job (Open-Meteo → preHarvest WeatherAlert)
- [ ] Mobile inbox + push tap deep-links
- [ ] Web notification bell + drawer
- [ ] `reports` module: pre-harvest aggregation, queued exports via BullMQ → S3 XLSX/CSV
- [ ] Web `/reports` page: filter builder + export queue + result table

## Phase 5 · Definition of Done

- [ ] Scan any batch QR with a phone camera → trace page loads in < 2s on 3G
- [ ] Inventory transition reflected in public trace within 5 min
- [ ] Privacy redaction correctly applied (no PII when consent is off)
- [ ] Push notification fires on farmer approval within 30s
- [ ] Pre-harvest report (10k rows) p95 < 1.5s
- [ ] XLSX export (25k rows) ≤ 60s
- [ ] **Demo recorded**

---

# Phase 6 · Hardening & GA (2 weeks)

> Goal: production-ready.

## Hardening checklist

- [ ] Field-level encryption for Aadhaar + bank account numbers (envelope via KMS data keys)
- [ ] CORS allowlist locked down (no `*` in prod)
- [ ] Rate limits tuned per route
- [ ] CSP headers on web/portal
- [ ] Pen test of staging (external firm, 1 week)
- [ ] OWASP Top 10 sweep
- [ ] Dependency audit (`pnpm audit --prod`)
- [ ] Secrets rotation procedure documented
- [ ] PII data-flow diagram + retention policy

## Performance

- [ ] List virtualization everywhere (TanStack Virtual)
- [ ] Image lazy-loading + AVIF + blurhash placeholders
- [ ] Route prefetch (Next.js `<Link prefetch>`)
- [ ] Bundle-size budget enforced in CI

## Accessibility

- [ ] Axe sweep on every page → zero AA violations
- [ ] Manual screen-reader pass on auth + critical flows
- [ ] Reduced-motion verification
- [ ] Color-contrast script in CI

## i18n

- [ ] `i18n:check` ≥ 95% key parity for all 12 languages
- [ ] Real translation review by native speakers for top-5 languages

## Load test

- [ ] k6 script: 1,000 concurrent clients, 1M activities baseline
- [ ] Mongo replica + auto-scale tested

## Observability

- [ ] Grafana dashboards: API latency, queue depth, sync success rate, scan counts
- [ ] PagerDuty alerts wired

## Deploy

- [ ] Backend → AWS ECS / Azure App Service (≥ 2 replicas)
- [ ] Web → Vercel
- [ ] Portal → Vercel (separate project) + Cloudflare in front
- [ ] Mobile → EAS Submit to Play Store + App Store
- [ ] DNS, TLS, WAF
- [ ] DR drill (Atlas PITR restore into staging)
- [ ] Runbook + on-call docs

## Phase 6 · Definition of Done

- [ ] v1 LIVE — all surfaces in production
- [ ] Lighthouse perf ≥ 85 on web `/` and `/login`; ≥ 95 on portal `/t/[code]`
- [ ] Zero P0/P1 Sentry issues in the last 7 days
- [ ] Smoke tests pass against production
- [ ] **Launch demo recorded**

---

# Daily / Weekly cadence

## Daily (every dev)
- Pull `main`, branch `feat/<scope>-<short>` or `fix/<scope>-<short>`
- Work in small commits (Conventional Commits style)
- Open PR before 5pm; CI must be green before merge
- Mark today's EXECUTION.md boxes when done

## Weekly
- Monday: phase milestone check — are we on track for this week's exits?
- Wednesday: design ↔ engineering sync (review prototypes vs implementation)
- Friday: demo of what landed this week + Sentry/perf review

## Branch / merge rules
- `main` is always shippable
- Feature branches off `main`, squash-merge after one CODEOWNER review
- Never push to `main` directly
- `feat/*` for features, `fix/*` for bugs, `chore/*` for tooling
- Tags `v0.1.0`, `v0.2.0`, … per phase exit

---

# Quick command reference

```powershell
# Spin up everything
docker compose up -d
pnpm dev

# Per app
pnpm --filter api dev
pnpm --filter web dev
pnpm --filter portal dev
pnpm --filter mobile start

# Lint / typecheck / test
pnpm lint
pnpm typecheck
pnpm test

# Mobile build
pnpm --filter mobile dlx eas build --profile development --platform android
pnpm --filter mobile dlx eas build --profile preview     --platform android  # APK for QA
pnpm --filter mobile dlx eas build --profile production  --platform all      # store-ready

# Generate JWT keypair
node -e "..."   # see Phase 1 Day 1

# Seed admin
pnpm --filter api seed:admin

# i18n parity
pnpm i18n:check
pnpm i18n:scan
```

---

# Right now — your immediate next 5 actions

1. ☐ Run the verification commands from **Phase −1 · A**
2. ☐ Create the 6 accounts from **Phase −1 · B**
3. ☐ Park all secrets from **Phase −1 · C**
4. ☐ Create the GitHub repo and push the planning docs (**Phase −1 · D**)
5. ☐ Ping me when done — we start **Phase 0 · Day 1** together

---

<div align="center">

<sub><strong>One phase at a time. Don't skip. Tick the boxes.</strong></sub>

<br /><br />

<img src="docs/nesso___nr_group_logo.jpeg" alt="NR Group" width="60" />

<br />

<sub>NESSO · NR Group · © 2026</sub>

</div>
