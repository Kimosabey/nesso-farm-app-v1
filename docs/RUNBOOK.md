<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Nesso · Local Dev Runbook

**One-stop reference for running every service, watching every log, and
recovering from the bugs you actually hit.**

</div>

---

## TL;DR — what runs where

| Service | URL | Started by |
|---|---|---|
| MongoDB | `mongodb://nesso:nesso@localhost:27017` | Docker |
| Redis | `redis://localhost:6379` | Docker |
| MinIO (S3) | http://localhost:9000 (API) · http://localhost:9001 (console) | Docker |
| Mailhog (SMTP capture) | http://localhost:8025 | Docker |
| API (NestJS) | http://localhost:4000 · Swagger at `/api/docs` | `pnpm --filter @nesso/api dev` |
| Web (Dashboard) | http://localhost:3001 | `pnpm --filter @nesso/web dev` |
| Portal (QR public) | http://localhost:3002 | `pnpm --filter @nesso/portal dev` |
| Mobile (Expo) | Metro at http://localhost:8081 (open QR in Expo Go, NOT in a browser) | `pnpm --filter @nesso/mobile dev` |

> Credentials live in `docker-compose.yml` and per-app `.env` files. None of
> them are committed. See [DB_CONNECT.md](./DB_CONNECT.md) for browsing the
> stores from Compass / DBeaver / RedisInsight.

---

## 1 · Cold start (clean machine)

Top-to-bottom, in three terminals.

### Terminal 1 — infra (Docker)

```powershell
cd D:\Harshan\farmer-app\nesso-farm-app-v1
docker compose up -d
docker compose ps           # all 4 containers should be Up
```

What it brings up: mongo, redis, minio, mailhog.

### Terminal 2 — backend

```powershell
cd D:\Harshan\farmer-app\nesso-farm-app-v1
pnpm install                 # only the first time, or after pulling new deps
pnpm --filter @nesso/api dev
```

Wait for: `Nesso API listening on http://0.0.0.0:4000`.

First-run seed:

```powershell
pnpm --filter @nesso/api seed:admin      # creates 9066666481 / Nesso!Admin!2026
pnpm --filter @nesso/api seed:catalog    # crop catalog, units, etc.
```

### Terminal 3 — pick one frontend at a time (or use turbo to run all in one window)

```powershell
# all parallel
pnpm dev                     # turbo runs api+web+portal+mobile concurrently

# or one at a time:
pnpm --filter @nesso/web dev
pnpm --filter @nesso/portal dev
pnpm --filter @nesso/mobile dev
```

---

## 2 · Logs · where to watch what

| Where | Command | What you see |
|---|---|---|
| API request log | API terminal | `pino-pretty` per-request log (method · path · ms · userId) |
| Mongo queries (slow log) | `docker compose logs -f mongo` | DB-side warnings, ops over `slowms` |
| Redis | `docker compose logs -f redis` | Pub/sub, connection events |
| MinIO | http://localhost:9001 → Object Browser | Uploads in real time |
| Mailhog inbox | http://localhost:8025 | Every email the API sends (it never leaves your box) |
| Web SSR/edge | Web terminal | Server actions, RSC fetches, route hits |
| Mobile (JS console) | Mobile terminal (Metro) | `console.log`, errors, fast refresh |
| Mobile (device-side) | Shake device → Open JS Debugger (or `j` in Metro for Hermes) | Real stack traces, network |
| Sentry (all 4 apps) | https://sentry.io/organizations/harshimos-team/issues/ | Uncaught + captured events, ~30s delay |

### Following multiple Docker logs at once

```powershell
docker compose logs -f mongo redis minio mailhog
```

---

## 3 · Auth / Test accounts

| Role | Phone | Password | Created by |
|---|---|---|---|
| Bootstrap admin | `9066666481` | `Nesso!Admin!2026` | `pnpm seed:admin` |
| Firebase test number(s) | as configured in Firebase console | the static OTP you set there | Firebase console |

To **manually invalidate a refresh token** (test the new blacklist):

```powershell
# log in
curl -X POST http://localhost:4000/api/v1/auth/password `
  -H "Content-Type: application/json" `
  -d '{"username":"9066666481","password":"Nesso!Admin!2026"}'

# extract refreshToken from response, then:
curl -X POST http://localhost:4000/api/v1/auth/logout `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <accessToken>" `
  -d '{"refreshToken":"<refreshToken>"}'

# next refresh should now 401
curl -X POST http://localhost:4000/api/v1/auth/refresh `
  -H "Content-Type: application/json" `
  -d '{"refreshToken":"<same refreshToken>"}'
```

---

## 4 · Sentry / Firebase smoke tests

Both are wired but **not runtime-verified** by anyone yet.
Full step-by-step plan in [TESTING.md](./TESTING.md).

Fast-path entry points:

| App | URL / action |
|---|---|
| API | `curl http://localhost:4000/api/v1/debug/sentry/throw` |
| Web | http://localhost:3001/debug/sentry (3 buttons) |
| Portal | http://localhost:3002/debug/sentry (3 buttons) |
| Mobile | Long-press the "● Nesso" pill on Login → Debug screen |

The `/debug/*` routes are intentionally unauth'd — remove before
production (see [TESTING.md](./TESTING.md) §6).

---

## 5 · Known issues + their fixes

### 5.1 `Cannot find module 'react-native-worklets/plugin'`

`nativewind/babel` references it for forward-compat with reanimated 4.
Reanimated 3.16 doesn't run it, but the require still has to resolve.

```powershell
pnpm --filter @nesso/mobile add react-native-worklets
```

### 5.2 ~~`TerminalReporter` not defined by "exports"~~ — fixed by SDK 54 upgrade

Was a Node 22 × Expo SDK 52 incompatibility. Resolved by upgrading the
project to SDK 54 (see [SDK_UPGRADE_NOTES.md](./SDK_UPGRADE_NOTES.md)).
The metro `overrides:` block is gone from `pnpm-workspace.yaml`.

### 5.3 ~~`Project is incompatible with this version of Expo Go — SDK 54 vs SDK 52`~~ — fixed

The project is now on SDK 54. Use the standard Play Store Expo Go.

### 5.4 `Native module RNFBAppModule not found` in Expo Go

Expo Go can't load `@react-native-firebase/*` (native code). The
`apps/mobile/src/firebase/auth.ts` guard already prevents the require
in Expo Go, but any code that touches Firebase will crash there. To
actually exercise Phone OTP you need a **dev build**:

```powershell
# fastest if you have Android Studio (compiles locally in 5-10 min)
cd D:\Harshan\farmer-app\nesso-farm-app-v1\apps\mobile
npx expo run:android

# or cloud build via EAS (no local Android SDK needed, ~15-20 min)
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

Full walkthrough in [MOBILE_SETUP.md §6](./MOBILE_SETUP.md#6--dev-client-required--we-have-native-modules).

### 5.4 `Could not parse Expo config: android.googleServicesFile`

You used to see this when `apps/mobile/google-services.json` didn't exist.
`apps/mobile/app.config.js` now guards the field with `existsSync` — the
field is only emitted when the file is on disk. Drop the file in (or its
iOS sibling `GoogleService-Info.plist`) and restart Metro.

### 5.5 `Unable to resolve asset "./assets/icon.png"`

Same fix as 5.4 — `app.config.js` only emits asset paths when the files
are present. Until you add real icons, Expo's default placeholder is used.

### 5.6 Mongo: `Authentication failed`

Reseat the password from `docker-compose.yml` into the API's `MONGO_URL`.
Don't forget `?authSource=admin` at the end.

### 5.7 `EADDRINUSE :::4000` on API start

```powershell
# find the orphan
netstat -ano | findstr :4000
taskkill /PID <pid> /F
```

### 5.8 Sentry events not arriving

1. Confirm the DSN is set in the right `.env` (`SENTRY_DSN` for API,
   `NEXT_PUBLIC_SENTRY_DSN` for web/portal, `EXPO_PUBLIC_SENTRY_DSN` for
   mobile).
2. Restart the dev server AFTER editing `.env` — Next.js reads it once.
3. Check the project filter on sentry.io — events go to whichever project
   the DSN belongs to, not the one in the URL.

---

## 6 · Stop / clean / fresh start

```powershell
# stop dev servers: Ctrl+C in each terminal

# stop infra
docker compose down                  # keeps volumes (data survives)
docker compose down -v               # NUKES mongo/redis/minio data

# nuke pnpm install (then re-run pnpm install)
Remove-Item -Recurse -Force node_modules, pnpm-lock.yaml

# nuke Expo build cache
cd apps/mobile
Remove-Item -Recurse -Force .expo, .expo-shared -ErrorAction SilentlyContinue
pnpm dev -c                          # -c = clear metro cache

# nuke Next.js build cache
cd apps/web; Remove-Item -Recurse -Force .next
cd apps/portal; Remove-Item -Recurse -Force .next

# nuke NestJS build output
cd apps/api; Remove-Item -Recurse -Force dist
```

---

## 7 · Useful one-liners

```powershell
# typecheck a single app
pnpm --filter @nesso/api    exec tsc --noEmit -p .
pnpm --filter @nesso/web    exec tsc --noEmit -p .
pnpm --filter @nesso/portal exec tsc --noEmit -p .
pnpm --filter @nesso/mobile exec tsc --noEmit -p .

# tail the API request log only
pnpm --filter @nesso/api dev | Select-String -Pattern 'req'

# show every package version that's hoisted twice
pnpm why <package>

# rerun a seed
pnpm --filter @nesso/api seed
```

---

## 8 · Cheatsheet — port → service

```
3001 → web (Next.js dashboard)
3002 → portal (Next.js QR trace)
4000 → api (NestJS)
6379 → redis
8025 → mailhog UI
8081 → metro bundler (mobile — NOT a browser-viewable URL)
9000 → minio S3 API
9001 → minio console
27017 → mongo
```
