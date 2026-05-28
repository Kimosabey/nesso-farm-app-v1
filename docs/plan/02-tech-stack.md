# 02 — Tech Stack

Library decisions with rationale. When in doubt, prefer the option that minimizes operational surface area and keeps the codebase small.

## Mobile

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Expo SDK 54 + React Native 0.81** | Managed workflow + EAS Build. Used in FoodSign already; team familiarity. |
| Language | **TypeScript (strict)** | Catches null/undefined bugs that plagued the JS FoodSign codebase. |
| Navigation | **React Navigation 7** (native-stack + bottom-tabs) | Mature, well-supported, matches FoodSign nav model. |
| Styling | **NativeWind** (Tailwind for RN) | Consistent design tokens with web dashboard. |
| State | **Zustand** | Tiny, no boilerplate, plays well with persistence. |
| Server state | **TanStack Query v5** | Cache + retry + invalidation; pairs with optimistic offline updates. |
| Local DB | **Expo SQLite** | Real relational store for the outbox and read cache. |
| Local KV | **react-native-mmkv** | 10–30× faster than AsyncStorage; for tokens, prefs, small lookups. |
| Forms | **react-hook-form + Zod** | Same Zod schemas shared with backend. |
| Maps | **Leaflet inside react-native-webview** | Avoids the `react-native-maps` Expo Go crashes from FoodSign; OSM tiles are free. |
| Camera | **expo-camera** | KYC photos, QR/barcode scanning. |
| Image picker | **expo-image-picker** | Gallery fallback. |
| Location | **expo-location** | Foreground GPS for polygon mapping. |
| Network | **@react-native-community/netinfo** | Reconnect-triggered sync. |
| Auth | **Firebase Phone Auth** (`@react-native-firebase/auth`) | OTP delivery; backend verifies the Firebase ID token. |
| i18n | **i18next + react-i18next** | Same as FoodSign; 12 language packs reuseable. |
| Icons | **@expo/vector-icons** (Ionicons) | Already mapped in FoodSign. |
| Error boundary | **react-error-boundary** | Wrap stack root. |
| Crash/error reporting | **Sentry Expo** | |
| Push | **expo-notifications + FCM** | |

## Web Dashboard

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | RSC for fast data tables, server actions for mutations. |
| Language | **TypeScript (strict)** | |
| Styling | **Tailwind CSS** | |
| Components | **shadcn/ui** | Copy-in components, no runtime lock-in. |
| Tables | **TanStack Table v8** | Sortable, filterable, virtualized for large lists. |
| Charts | **Recharts** | Replaces FoodSign's Chart.js with a React-native API. |
| Forms | **react-hook-form + Zod** | Shared schemas with mobile and backend. |
| Maps | **react-leaflet** | Same Leaflet/OSM stack as mobile. |
| Auth | **NextAuth.js (Credentials provider)** OR custom JWT cookie | NextAuth for session ergonomics; custom JWT if we need full control. |
| QR generation | **qrcode** (npm) | Server-side PNG/SVG generation. |
| Data fetching | **Server Components + TanStack Query (client)** | RSC for initial; TanStack for client mutations. |
| Testing | **Playwright** (e2e) + **Vitest** (unit) | |

## QR Portal

Standalone Next.js app (separate Vercel project) so a public DDoS or scrape doesn't impact the admin dashboard.

| Concern | Choice |
|---|---|
| Framework | **Next.js 15** (mostly SSG/ISR) |
| Data fetching | Public read endpoints under `/api/public/trace/:qrCode` |
| Styling | **Tailwind** + shared `design-system` package |
| i18n | Same i18next dictionaries, but only public keys exposed |

## Backend

| Concern | Choice | Rationale |
|---|---|---|
| Runtime | **Node.js 20 LTS** | |
| Framework | **NestJS 10** | Module system, DI, decorators map cleanly to our 20+ feature modules. |
| Language | **TypeScript (strict)** | |
| DB | **MongoDB 7** (Atlas in prod) | Continues from FoodSign; document shape fits the variable-schema farm/activity data. |
| ODM | **Mongoose 8** | |
| Cache / queue / OTP store | **Redis 7** | |
| Job queue | **BullMQ** | Report exports, push notifications, image post-processing, sync replay. |
| Validation | **Zod** (`nestjs-zod` adapter) | Shared with frontends. |
| Auth | **@nestjs/jwt + Passport** (JWT strategy) | RS256 keypair. |
| RBAC | Custom `@Roles()` decorator + guard | |
| Logging | **Pino** (`nestjs-pino`) | Fast, structured, JSON. |
| Metrics | **prom-client** + `/metrics` endpoint | |
| Tracing | **OpenTelemetry** | |
| Errors | **Sentry** | |
| Object storage | **AWS S3** (or **Azure Blob**) | Replaces base64 image storage. |
| Email | **Resend** or **SES** | Transactional only (no marketing). |
| SMS | **Firebase Phone Auth** delivers OTPs; for non-OTP transactional SMS use **MSG91** (India-specific). |
| Push notifications | **Firebase Cloud Messaging (FCM)** via Admin SDK | |
| Geocoding (optional) | **Nominatim** (OSM) — rate-limited fallback | |
| IFSC lookup | **Razorpay IFSC API** (free) — proxied through backend with cache | |
| Weather | **Open-Meteo** — proxied through backend with cache (per-farm key) | |
| API docs | **Swagger / OpenAPI** via `@nestjs/swagger` | |
| Testing | **Jest** (unit) + **Supertest** (e2e) + **MongoMemoryServer** | |

## Shared

| Concern | Choice |
|---|---|
| Monorepo | **pnpm workspaces + Turborepo** |
| Code style | **ESLint + Prettier** (shared config package) |
| Commits | **Conventional Commits** + Changesets for versioning |
| API types | Generated from Zod schemas → published as `@nesso/shared-types` |

## DevOps

| Concern | Choice |
|---|---|
| Containerization | **Docker** (multi-stage builds) |
| Local dev | **docker-compose** with Mongo + Redis + Mailhog + Minio (S3 stub) |
| CI/CD | **GitHub Actions** (lint, typecheck, test, build, deploy) |
| Mobile builds | **EAS Build** + **EAS Submit** |
| Web hosting | **Vercel** (dashboard + QR portal) or self-host behind Nginx |
| Backend hosting | **AWS ECS / Fargate** OR **Azure App Service** (continuing FoodSign's Azure footprint is cheapest) |
| TLS / proxy | **Nginx** in front of API, **Cloudflare** in front of QR portal |
| Secrets | **AWS Parameter Store** / Azure Key Vault; **never** in env files in repo |
| Monitoring | **Grafana Cloud** or **Datadog** |
| Error tracking | **Sentry** (all three surfaces) |

## Repository layout (target)

```
nesso/
├── apps/
│   ├── api/                NestJS backend
│   ├── web/                Next.js admin dashboard
│   ├── portal/             Next.js public QR portal
│   └── mobile/             Expo TS app
├── packages/
│   ├── shared-types/       Zod schemas + generated TS types
│   ├── design-system/      Tailwind preset + shared UI primitives
│   ├── i18n/               12-language translation JSONs
│   └── config/             eslint, tsconfig, prettier shared
├── infra/
│   ├── docker/             Dockerfiles + compose
│   ├── nginx/              Reverse-proxy config
│   └── github/             reusable workflows
├── docs/
│   ├── plan/               (this folder)
│   ├── FoodSign_PRD.md
│   └── prdv1.txt.txt
├── package.json            pnpm workspace root
├── turbo.json
└── README.md
```
