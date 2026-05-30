<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso · NR Group" width="120" />

# Sentry · End-to-End Setup

**Crash & error reporting across all 4 surfaces (API · Web · Portal · Mobile). Free Developer tier — no card required.**

</div>

---

## TL;DR — where we are right now

| App | Project on Sentry | DSN | Stored in `.env`? | Wired in code? |
|---|---|---|---|---|
| **API** (NestJS) | `nesso-api` | ✅ | ✅ `apps/api/.env` | ❌ pending |
| **Web** (Next.js) | `nesso-web` | ✅ | ✅ `apps/web/.env` | ❌ pending |
| **Portal** (Next.js) | `nesso-portal` | ✅ | ✅ `apps/portal/.env` | ❌ pending |
| **Mobile** (Expo) | `nesso-mobile` | ✅ | ✅ `apps/mobile/.env` | ❌ pending |
| **Sentry CLI** (releases + sourcemaps) | — | — | not yet | not yet |

**Org:** `harshimos-team` · **URL:** https://harshimos-team.sentry.io · **Plan:** Developer (free, 5,000 errors/mo, 10k perf traces, 7-day retention)

---

## 1 · Create the 4 Sentry projects (one-time)

If you've already done some of these, skip — only do the missing ones.

### From https://harshimos-team.sentry.io/projects/new/

For each project below:

| Field | Pick |
|---|---|
| Platform | (see table) |
| Project name | `nesso-api`, `nesso-web`, `nesso-portal`, `nesso-mobile` |
| Team | `#harshimos-team-team` |
| Alert frequency | Defaults are fine |

| App | Platform to pick | Done? |
|---|---|---|
| `nesso-api` | **Node.js → NestJS** (or just **Node.js**) | ✅ |
| `nesso-web` | **JavaScript → Next.js** | ✅ |
| `nesso-portal` | **JavaScript → Next.js** | ✅ |
| `nesso-mobile` | **Mobile → React Native** (Expo subtype if shown) | ❌ |

After **Create Project**, Sentry shows you a **DSN** — copy it and add to the matching `.env` (see §2).

---

## 2 · DSNs into `.env` files

All `.env` files are **gitignored** — they never leave your machine.

### `apps/api/.env`

```
# Sentry — NestJS
SENTRY_DSN=https://53361862628c3de5d8db89d5f9ee2b7b@o4511477308260352.ingest.us.sentry.io/4511477364097024
SENTRY_ORG=harshimos-team
SENTRY_PROJECT=nesso-api
SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### `apps/web/.env`

```
NEXT_PUBLIC_SENTRY_DSN=https://50114920b32392b7d6fc61adbffcd618@o4511477308260352.ingest.us.sentry.io/4511477401583616
SENTRY_ORG=harshimos-team
SENTRY_PROJECT=nesso-web
SENTRY_ENVIRONMENT=development
```

### `apps/portal/.env`

```
NEXT_PUBLIC_SENTRY_DSN=https://f4f87d73bb310a2080ae252e7d29a62b@o4511477308260352.ingest.us.sentry.io/4511477384019968
SENTRY_ORG=harshimos-team
SENTRY_PROJECT=nesso-portal
SENTRY_ENVIRONMENT=development
```

### `apps/mobile/.env` (after the 4th project is created)

```
EXPO_PUBLIC_SENTRY_DSN=<paste 4th DSN here>
SENTRY_ORG=harshimos-team
SENTRY_PROJECT=nesso-mobile
SENTRY_ENVIRONMENT=development
```

---

## 3 · Code wiring — what gets installed + where

### 3.1 · API (NestJS) — `apps/api/`

```powershell
cd apps/api
pnpm add @sentry/nestjs @sentry/profiling-node
```

Files I'll create / modify:

| File | What it does |
|---|---|
| `src/instrument.ts` | `Sentry.init({ dsn, environment, tracesSampleRate, sendDefaultPii, integrations: [nodeProfilingIntegration()] })` |
| `src/main.ts` | First line: `import './instrument';` so Sentry initializes before NestJS bootstraps |
| `src/app.module.ts` | Add `SentryModule.forRoot()` to imports; add `{ provide: APP_FILTER, useClass: SentryGlobalFilter }` to providers |
| (optional) `src/common/filters/sentry-catchall.filter.ts` | Custom `@SentryExceptionCaptured()` filter for tagged categories |

### 3.2 · Web Dashboard (Next.js) — `apps/web/`

```powershell
cd apps/web
pnpm add @sentry/nextjs
```

Files I'll create / modify:

| File | What it does |
|---|---|
| `instrumentation.ts` | Next.js OTel hook; calls `Sentry.init` on server boot |
| `instrumentation-client.ts` | Browser-side init |
| `sentry.server.config.ts` | Server runtime config (Node) |
| `sentry.edge.config.ts` | Edge runtime config |
| `next.config.mjs` | Wrap export with `withSentryConfig(nextConfig, { silent: true, org, project, authToken })` |
| `src/app/global-error.tsx` | Sentry-capturing global error boundary (Next.js 15 pattern) |
| `.sentryclirc` | (gitignored) auth-token snippet so CI can upload source maps |

### 3.3 · QR Portal (Next.js) — `apps/portal/`

Same as web — exact same set of files with `project: nesso-portal`.

### 3.4 · Mobile (Expo) — `apps/mobile/`

```powershell
cd apps/mobile
npx expo install sentry-expo
```

Files I'll create / modify:

| File | What it does |
|---|---|
| `App.tsx` | Top-of-file `import * as Sentry from 'sentry-expo'` + `Sentry.init({ dsn, enableInExpoDevelopment: true, debug: __DEV__ })` |
| `app.json` | Add `sentry-expo` plugin to the `plugins` array + EAS hooks for source-map upload |
| `metro.config.js` | Wrap with `getSentryExpoConfig(...)` so source maps work in EAS |

**Note:** Mobile Sentry works in Expo Go but **source-mapping** for production builds requires a dev client + EAS plugin. Will work end-to-end after the dev-client build.

---

## 4 · Sentry CLI — when we install it

`@sentry/cli` is **not** the wizard. It's the lightweight tool used in CI to:

- Upload source maps after `next build` / `expo build`
- Create releases tagged by git SHA
- Associate commits with releases
- Promote releases through environments

```powershell
# Add it as a workspace dev dep (one time, root level)
pnpm add -Dw @sentry/cli
```

Auth token comes from https://harshimos-team.sentry.io/settings/account/api/auth-tokens/ with scopes:
- `project:read`
- `project:releases`
- `org:read`

Save as `SENTRY_AUTH_TOKEN` in each app's `.env` (gitignored). In GitHub Actions, save it as a **repo secret** with the same name.

### Typical CI step (Phase 6)

```yaml
- name: Sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  run: |
    pnpm dlx @sentry/cli releases new "$GITHUB_SHA"
    pnpm dlx @sentry/cli releases set-commits "$GITHUB_SHA" --auto
    # source-map upload happens automatically via withSentryConfig() / sentry-expo
    pnpm dlx @sentry/cli releases finalize "$GITHUB_SHA"
```

---

## 5 · Verify it works (after wiring is done)

Once code is wired, trigger a fake error in each app. The error should appear at https://harshimos-team.sentry.io/issues/ within 30 seconds.

### API

```powershell
TOKEN=$(...)   # admin token; see CONFIG.md
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/dev/throw
# (we'll add a hidden /dev/throw endpoint in dev mode only)
```

### Web / Portal

Add a button on `/dashboard` (web) or `/` (portal) that calls `throw new Error('Sentry sanity check')`. Click it.

### Mobile

`Sentry.captureException(new Error('Sentry sanity check'))` in DashboardScreen.

### What you should see

| Sentry view | What it shows |
|---|---|
| Issues | The thrown error grouped by stack |
| Releases | Tagged with git SHA |
| Performance | API request traces with spans |
| Projects → nesso-* | Per-app dashboard |

---

## 6 · What's left to do (pending checklist)

### One-time setup
- [x] Create `nesso-api` project + DSN in `apps/api/.env`
- [x] Create `nesso-web` project + DSN in `apps/web/.env`
- [x] Create `nesso-portal` project + DSN in `apps/portal/.env`
- [ ] **Create `nesso-mobile` project + DSN in `apps/mobile/.env`** ← you do this next
- [ ] Generate `SENTRY_AUTH_TOKEN` and save to all 4 `.env` files
- [ ] Add the same token as a GitHub Actions repo secret (Phase 6)

### Code wiring (I do these after you confirm)
- [ ] API: install `@sentry/nestjs`, create `instrument.ts`, wire main.ts + AppModule
- [ ] Web: install `@sentry/nextjs`, create 4 config files + global error boundary + wrap next.config
- [ ] Portal: same as web
- [ ] Mobile: install `sentry-expo`, wire App.tsx + app.json plugin
- [ ] Add `@sentry/cli` to workspace dev deps (root)
- [ ] Add hidden `/dev/throw` endpoint to API (dev-only) for sanity checking

### Production hardening (Phase 6)
- [ ] Source-map upload from GitHub Actions
- [ ] Release tagging by git SHA
- [ ] PII scrubbing rules in Sentry dashboard (Settings → Data Scrubbers)
- [ ] Alert rules: email on new error type, page on 50+ events/hr
- [ ] Slack integration (optional)
- [ ] Bump `SENTRY_TRACES_SAMPLE_RATE` to 0.05–0.10 in production (currently 0.10 in dev)

---

## 7 · Quick reference — useful URLs

| | URL |
|---|---|
| Sentry org dashboard | https://harshimos-team.sentry.io |
| All projects | https://harshimos-team.sentry.io/projects/ |
| New project | https://harshimos-team.sentry.io/projects/new/ |
| Auth tokens | https://harshimos-team.sentry.io/settings/account/api/auth-tokens/ |
| Issues feed | https://harshimos-team.sentry.io/issues/ |
| Releases | https://harshimos-team.sentry.io/releases/ |
| Sentry NestJS skill | https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nestjs-sdk/SKILL.md |
| Sentry Next.js skill | https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-nextjs-sdk/SKILL.md |
| Sentry React Native skill | https://github.com/getsentry/sentry-for-ai/blob/main/skills/sentry-react-native-sdk/SKILL.md |

---

## 8 · Troubleshooting

| Symptom | Fix |
|---|---|
| `Sentry was initialized too late` warning in API logs | `import './instrument';` must be the **first line** of `main.ts`, before any other imports |
| Errors not appearing in Sentry | Check `SENTRY_DSN` env var is loaded — `console.log(process.env.SENTRY_DSN)` at boot |
| Web/portal source maps unreadable | Verify `SENTRY_AUTH_TOKEN` was set during `next build` so `withSentryConfig` could upload |
| Mobile errors don't appear in Expo Go | `enableInExpoDevelopment: true` in `Sentry.init` (set by default in `sentry-expo`) |
| Too many events in dev | Lower `SENTRY_TRACES_SAMPLE_RATE` (env var), or filter in `beforeSend` |

---

<div align="center">

<sub>NESSO · NR Group · © 2026</sub>

</div>
