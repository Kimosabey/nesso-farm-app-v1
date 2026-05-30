<div align="center">

<img src="docs/nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Local Configuration Reference

**Everything you need to connect to running services right now (Phase 0–2).**

All values below are `$0 NOW` — local Docker + localhost. Phase 6 paid cloud values are in [`docs/plan/10-deployment.md`](docs/plan/10-deployment.md).

</div>

---

## 1 · URLs you can open in the browser right now

### Web Dashboard (Next.js · :3001)

| URL | What you'll see |
|---|---|
| http://localhost:3001 | Public home → "Sign in" CTA |
| http://localhost:3001/login | Glass card form (the only public page besides `/`) |
| http://localhost:3001/dashboard | KPI tiles + recent farmers + Add Farmer CTA |
| http://localhost:3001/farmers | Searchable / filterable table |
| http://localhost:3001/farmers/new | Full registration form |
| http://localhost:3001/farmers/{id} | Detail with approve/reject inline |
| http://localhost:3001/approvals | Pending farmers queue |
| http://localhost:3001/activities | Day-grouped timeline + status tiles |
| http://localhost:3001/activities/new | Farmer→Farm→Crop + input picker form |
| http://localhost:3001/samples | 6-tile state machine + table |
| http://localhost:3001/audits | Pending/Approved/Rejected stats + table |
| http://localhost:3001/procurement | 4-tile stats (incl. ₹ total) + status filter |
| http://localhost:3001/warehouses | Card grid |
| http://localhost:3001/inventory | Batch table + status tiles |
| http://localhost:3001/reports | Pre-harvest aggregation with filter form |
| http://localhost:3001/notifications | Inbox + mark-all-read |
| http://localhost:3001/farms · /crops · /settings | (placeholder routes — content in 5.x) |

### Public QR Portal (Next.js · :3002)

| URL | What you'll see |
|---|---|
| http://localhost:3002 | Public landing |
| http://localhost:3002/en/t/{code} | **Live** consumer-facing trace page (calls real API, ISR 5min) |

### NestJS API (:4000)

| URL | What you'll see |
|---|---|
| http://localhost:4000/api/v1/health | `{"status":"ok",…}` (public) |
| http://localhost:4000/api/docs | **Live Swagger** — all 60+ routes interactively |

### Docker tooling

| URL | Credentials |
|---|---|
| http://localhost:9001 | Minio console — `nesso` / `nessoadmin` |
| http://localhost:8025 | Mailhog UI — no auth |

## 2 · Bootstrap admin login

| Field | Value |
|---|---|
| Phone | `9066666481` |
| Password | `Nesso!Admin!2026` |
| Role | `admin` |

> The first login flags `mustChangePassword: true`. We'll wire the change-password flow in Phase 3.

## 3 · Service ports

| Service | Port | Health check |
|---|---|---|
| NestJS API | `4000` | `curl http://localhost:4000/api/v1/health` |
| Next.js Web | `3001` | open in browser |
| Next.js QR Portal | `3002` | open in browser |
| MongoDB | `27017` | `docker ps \| grep nesso-mongo` |
| Redis | `6379` | `docker exec nesso-redis redis-cli ping` |
| Minio S3 API | `9000` | `curl http://localhost:9000/minio/health/live` |
| Minio console | `9001` | open in browser |
| Mailhog SMTP | `1025` | `nc -z localhost 1025` |
| Mailhog UI | `8025` | open in browser |

## 4 · Connection strings

### MongoDB

```
mongodb://nesso:nesso@localhost:27017/nesso?authSource=admin
```

Open in **MongoDB Compass** with that exact URL. You'll see the `nesso` database with collections:
- `users` (admin staff — bcrypt hashes)
- `farmers` (Ravi + Lakshmi after Phase 2 smoke test)
- `farms`
- `counters` (auto-increment seeds for `farmer:2026` etc.)

### Redis

```
redis://localhost:6379
```

Connect with **RedisInsight** (optional).

### Minio (S3-compatible)

| Field | Value |
|---|---|
| Endpoint | `http://localhost:9000` |
| Console | http://localhost:9001 |
| Access key | `nesso` |
| Secret key | `nessoadmin` |
| Bucket | `nesso-dev` (already created) |
| Region | `us-east-1` (placeholder; Minio ignores it) |
| Force path style | `true` (required for Minio) |

### Mailhog

| Use | Value |
|---|---|
| SMTP host | `localhost` |
| SMTP port | `1025` |
| Auth | none |
| Web inbox | http://localhost:8025 |

## 5 · API authentication

### Get a token

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/password \
  -H "Content-Type: application/json" \
  -d '{"username":"9066666481","password":"Nesso!Admin!2026"}' \
  | python -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
```

### Use the token

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/auth/me
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/farmers
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/farmers/stats
```

### Token TTLs

| Token | Lifetime |
|---|---|
| Access | 15 min |
| Refresh | 30 days |

Refresh via `POST /api/v1/auth/refresh { refreshToken }`.

## 6 · Mobile app — API base URL

The `.env` lives in `apps/mobile/.env`. Pick one based on how you run the app:

| Where you run the app | `EXPO_PUBLIC_API_URL` |
|---|---|
| Android emulator (AVD) | `http://10.0.2.2:4000/api/v1`  ← default |
| iOS simulator | `http://localhost:4000/api/v1` |
| Real Android phone over USB | `http://<your-pc-LAN-IP>:4000/api/v1` |
| Real iPhone | `http://<your-pc-LAN-IP>:4000/api/v1` |

> To find your LAN IP on Windows: `ipconfig` → look for IPv4 under your active adapter (usually `192.168.x.x`).
> Make sure Windows Firewall allows inbound on `:4000` from your local network.

## 7 · Env files at a glance

| File | What it controls | Status |
|---|---|---|
| `apps/api/.env` | API runtime: Mongo URI, Redis URL, JWT keys, S3, bootstrap admin | created ✓ |
| `apps/api/.env.example` | Template — committed to git | ✓ |
| `apps/web/.env.example` | Web `NEXT_PUBLIC_API_URL`, Sentry DSN | ✓ |
| `apps/portal/.env.example` | Portal API base, portal base, Sentry | ✓ |
| `apps/mobile/.env.example` | `EXPO_PUBLIC_API_URL`, Sentry DSN | ✓ |
| `.env.example` (root) | Docker-compose values + port assignments | ✓ |

**To customize:** copy `apps/<app>/.env.example` to `apps/<app>/.env` (gitignored) and edit.

## 8 · Start / stop everything

### Start

```powershell
cd d:\Harshan\farmer-app\nesso-farm-app-v1

# Infrastructure
docker compose up -d

# All four apps in parallel (in three separate PowerShell windows or via turbo)
pnpm dev                              # all in one terminal (turbo run dev --parallel)

# OR run individually:
pnpm --filter @nesso/api dev          # :4000
pnpm --filter @nesso/web dev          # :3001
pnpm --filter @nesso/portal dev       # :3002
pnpm --filter @nesso/mobile start     # Expo dev server (scan QR)
```

### Stop

```powershell
# Stop the app processes: Ctrl+C in each terminal

# Stop infra (preserves data in volumes)
docker compose down

# Nuke infra AND data (start completely fresh)
docker compose down -v
```

### Reset the database

```powershell
docker compose down -v
docker compose up -d
pnpm --filter @nesso/api seed:admin   # re-seed the bootstrap admin
```

## 9 · Where the JWT keys live

| File | Purpose | Committed? |
|---|---|---|
| `apps/api/keys/private.pem` | Signs access + refresh tokens (RS256) | ❌ gitignored |
| `apps/api/keys/public.pem` | Verifies tokens (could be shipped to portal later) | ❌ gitignored |

If you ever delete `keys/`, regenerate with:

```powershell
cd apps\api
mkdir keys 2>$null
node -e "const crypto=require('crypto');const {privateKey,publicKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048,privateKeyEncoding:{type:'pkcs8',format:'pem'},publicKeyEncoding:{type:'spki',format:'pem'}});require('fs').writeFileSync('keys/private.pem',privateKey);require('fs').writeFileSync('keys/public.pem',publicKey);console.log('Keys written.');"
```

**Important:** if you regenerate the keypair, all existing JWTs become invalid and users must log in again.

## 10 · S3 / Minio bucket lifecycle

The `nesso-dev` bucket is created automatically by the docker-compose setup script:

```powershell
docker exec nesso-minio mc alias set local http://localhost:9000 nesso nessoadmin
docker exec nesso-minio mc mb local/nesso-dev --ignore-existing
```

If you ever `docker compose down -v` (wiping volumes), re-run the two `mc` lines above to recreate the bucket.

To inspect uploaded files in the browser:
1. Open http://localhost:9001
2. Login `nesso` / `nessoadmin`
3. Click `nesso-dev` → browse `profile/`, `id-proof/`, `bank-passbook/` folders

## 11 · Sample API calls (copy-paste)

```bash
# Create a farmer
curl -s -X POST http://localhost:4000/api/v1/farmers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Suresh",
    "lastName":"P",
    "mobileNumber":"9988776655",
    "gender":"M",
    "groupAssociation":"INDEPENDENT",
    "address":{"state":"Karnataka","district":"Mysuru","village":"Belavadi","pincode":"570016"},
    "productionPractice":"Organic",
    "selectedCrops":["Tuberose","Jasmine"]
  }'

# List farmers (paginated)
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/v1/farmers?page=1&pageSize=10&approvalStatus=pending"

# Stats
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/farmers/stats

# Approve a farmer
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"approved":true}' \
  http://localhost:4000/api/v1/farmers/<id>/approve

# Reject with reason
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"approved":false,"reason":"Duplicate of existing farmer"}' \
  http://localhost:4000/api/v1/farmers/<id>/approve

# Pre-signed upload URL for a profile photo
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"kind":"profile","contentType":"image/jpeg"}' \
  http://localhost:4000/api/v1/files/sign-upload
```

## 12 · Phase 6 / paid services (NOT now — reference only)

When we go live, these placeholders in env get real values. **Do not configure any of them yet.**

| Env var | Service | Cost tier |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas | M0 free → M30+ paid |
| `S3_ENDPOINT` / keys | AWS S3 | per-GB |
| `REDIS_URL` | AWS ElastiCache / managed Redis | per-hour |
| Mobile app keys | Apple Developer ($99/yr) + Google Play ($25 one-time) | one-time + annual |
| `SENTRY_DSN` (prod project) | Sentry team plan | $26/mo+ when scale demands |
| Vercel project | Web + Portal | free hobby → Pro $20/mo |
| Cloudflare | DNS + WAF | free → Pro $20/mo |

All of these are documented in [`docs/plan/10-deployment.md`](docs/plan/10-deployment.md) for Phase 6.

---

<div align="center">

<sub><strong>Bookmark this file</strong> — every URL, port, credential, and command you need to interact with the running system.</sub>

<br /><br />

<sub>Nesso · © 2026 Harshan Aiyappa</sub>

</div>
