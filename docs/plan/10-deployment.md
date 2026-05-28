# 10 — Deployment & DevOps

## Environments

| Env | Purpose | Hosts |
|---|---|---|
| `local` | Developer machines | docker-compose: Mongo, Redis, Minio, Mailhog |
| `dev` | Integration / preview | Each PR gets a Vercel preview + ephemeral ECS task |
| `staging` | UAT for stakeholders | Mirrors prod sizing scaled down |
| `prod` | Live | Multi-AZ, monitored, alerting on |

## Local development

```
nesso/
├── docker-compose.yml     # mongo, redis, minio, mailhog
├── .env.example
└── scripts/
    ├── dev.sh             # docker-compose up + pnpm dev
    └── seed.sh            # seeds bootstrap admin + sample farmer/farm
```

`docker-compose up` starts:
- **Mongo** 7 on `:27017`
- **Redis** 7 on `:6379`
- **Minio** on `:9000` (S3 stub)
- **Mailhog** on `:1025/8025`

Each app:
- `apps/api`: `pnpm --filter api dev` → NestJS on `:3000`
- `apps/web`: `pnpm --filter web dev` → Next.js on `:3001`
- `apps/portal`: `pnpm --filter portal dev` → Next.js on `:3002`
- `apps/mobile`: `pnpm --filter mobile start` → Expo dev server

Hot reload across all four; `turbo run dev --parallel` runs them together.

## Containerization

Each app has a multi-stage Dockerfile:

```dockerfile
# api/Dockerfile (example)
FROM node:20-alpine AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter api build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json .
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Image targets:
- `nesso/api:<sha>`
- `nesso/web:<sha>`
- `nesso/portal:<sha>` (or deploy to Vercel directly)

Workers run from the same `nesso/api` image with a different command:
```
CMD ["node", "dist/workers/main.js"]
```

## Reverse proxy

Nginx in front of the API (and optionally web) container:

```nginx
upstream nesso_api { server api:3000; }

server {
  listen 443 ssl http2;
  server_name api.nesso.example;

  client_max_body_size 5m;     # most uploads go via S3 pre-signed; small payloads only here
  proxy_read_timeout 60s;

  location / {
    proxy_pass http://nesso_api;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /metrics {
    allow 10.0.0.0/8;
    deny all;
    proxy_pass http://nesso_api/metrics;
  }
}
```

## Hosting choices

| Component | Host | Notes |
|---|---|---|
| Backend API | **AWS ECS Fargate** (or **Azure App Service** if continuing FoodSign's footprint) | ≥ 2 replicas, autoscale on CPU 60% |
| Background workers | Same image, separate ECS service | autoscale on queue depth |
| MongoDB | **Atlas M30+** | enable point-in-time backups |
| Redis | **Elasticache** (or managed) | persistent for OTP store |
| Object storage | **S3** (or **Azure Blob**) | lifecycle: KYC docs 7y, map exports 1y |
| Web dashboard | **Vercel** | preview URLs per PR |
| QR portal | **Vercel** | separate project + Cloudflare in front |
| Mobile | **EAS Build + EAS Submit** | OTA updates for non-native changes via `expo-updates` |

## CI/CD (GitHub Actions)

```
.github/workflows/
├── ci.yml                # PR: lint + typecheck + unit + e2e
├── deploy-api.yml        # main: build image, push, deploy ECS service
├── deploy-web.yml        # main: Vercel deploy
├── deploy-portal.yml     # main: Vercel deploy
├── eas-preview.yml       # PR with `mobile` label: EAS preview build
└── eas-release.yml       # tag v*: EAS production submit
```

### `ci.yml`

```yaml
on: [pull_request]
jobs:
  setup:
    uses: ./.github/workflows/_setup.yml   # pnpm install with cache
  lint:
    needs: setup
    steps:
      - run: pnpm lint
  typecheck:
    needs: setup
    steps:
      - run: pnpm typecheck
  test-api:
    needs: setup
    services:
      mongo: { image: mongo:7 }
      redis: { image: redis:7 }
    steps:
      - run: pnpm --filter api test
  test-web:
    needs: setup
    steps:
      - run: pnpm --filter web test
      - run: pnpm --filter web exec playwright test
  test-mobile:
    needs: setup
    steps:
      - run: pnpm --filter mobile typecheck
      - run: pnpm --filter mobile test
```

### Deployment gates

- `main` branch deploys to `dev` automatically.
- `staging` deploy requires manual approval from a CODEOWNER.
- `prod` deploy requires a release tag `v*` + manual approval.

## Secrets

- **AWS:** Parameter Store + IAM role per ECS task
- **Azure:** Key Vault + managed identity
- **Vercel:** Project env vars (encrypted at rest)
- **EAS:** `EAS_SECRET_*` in `eas.json` references
- **Local:** `.env.local` (gitignored), `.env.example` checked in

Never commit:
- DB connection strings
- JWT signing keys
- Firebase service account JSON (download once, store in Parameter Store)
- S3 credentials
- Sentry DSNs (technically public but kept env-scoped)

## Database migrations

- **Mongo:** schemaless, but we use `migrate-mongo` for one-off transforms (base64 → S3, denorm backfills).
- Migrations live in `apps/api/migrations/` and run on deploy via `node dist/migrations/run.js up`.
- Each migration is idempotent and records its result in `_migrations` collection.

## Observability stack

- **Logs:** stdout JSON → CloudWatch / Azure Monitor → optional ship to Grafana Loki
- **Metrics:** Prometheus scrape `/metrics` → Grafana
- **Traces:** OpenTelemetry → Tempo or Honeycomb
- **Errors:** Sentry (api, web, portal, mobile)
- **Uptime:** Better Uptime or UptimeRobot pinging `/health`

### Alerts (PagerDuty)

- API p95 > 1s for 5 min
- API error rate > 2% for 5 min
- Worker queue depth > 1000 for 10 min
- Mongo replication lag > 30s
- ECS service unhealthy task count > 0

## Backup & DR

- Mongo Atlas continuous backup, 7-day PITR, weekly snapshot retention 90 days
- S3 versioning enabled; lifecycle moves old versions to Glacier after 30 days
- Quarterly restore drill into a staging cluster
- RTO 4h, RPO 1h

## Rollback strategy

- ECS: roll back to previous task definition (one click in console / `aws ecs update-service`)
- Vercel: instant rollback to previous deployment
- Mobile: EAS Update channel rollback for OTA-fixable changes; for native changes, ship a hotfix build
- Database migrations: every `up` has a corresponding `down`; we rehearse rollback on staging before prod
