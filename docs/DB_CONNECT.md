<div align="center">

<img src="nesso___nr_group_logo.jpeg" alt="Nesso" width="120" />

# Database Connection Guide

**MongoDB Compass + DBeaver + Minio + Redis — how to point each at our local Docker stack.**

</div>

---

## TL;DR

| Tool | URL / connection string | User | Pass |
|---|---|---|---|
| **MongoDB Compass** | `mongodb://nesso:nesso@localhost:27017/?authSource=admin` | — | — |
| **DBeaver (MongoDB)** | host `localhost`, port `27017`, db `nesso`, auth db `admin` | `nesso` | `nesso` |
| **Minio console** | http://localhost:9001 | `nesso` | `nessoadmin` |
| **Redis** (any CLI / RedisInsight) | `redis://localhost:6379` | — | — |
| **Mailhog UI** | http://localhost:8025 | — | — |

> All credentials come from `docker-compose.yml`. **They are local-only**. Phase 6 uses Atlas + real secrets — see `docs/plan/10-deployment.md`.

---

## 1 · MongoDB Compass

Compass is the friendliest way to browse our data.

### Connect

1. Open **MongoDB Compass**
2. Click **New Connection**
3. Paste this connection string:

```
mongodb://nesso:nesso@localhost:27017/?authSource=admin
```

4. Click **Connect**

### Where to look

| Database | Collections | Notes |
|---|---|---|
| `nesso` | `users`, `farmers`, `farms`, `crops`, `activities`, `counters`, `inputCatalog`, `popCatalog`, `samples`, `audits`, `procurements`, `warehouses`, `inventory`, `qrCodes`, `notifications`, `devices` | The main app database |
| `admin` | system collections + `users` (admin) | The auth database; Compass shows this too — leave it alone |

### Tips

- **Sort by `createdAt: -1`** in the toolbar to see newest records first
- **Indexes tab** on each collection — useful when checking why a query is slow. Most collections have a few indexes already (look for `farmerId_1`, `2dsphere` on `farms.location`, etc.)
- **Explain Plan** to debug filters before you write code
- **Aggregations** tab — paste pipelines from `docs/plan/04-backend-api.md`'s example aggregations

### Common quick filters

```javascript
// All pending farmers
{ approvalStatus: "pending", isDeleted: false }

// Approved farmers in Mysuru
{ approvalStatus: "approved", "address.district": "Mysuru" }

// Activities done in the last 7 days
{ status: "Completed", completedDate: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }

// Inventory not yet sold/transferred
{ status: { $in: ["AVAILABLE", "PROCESSING"] }, isDeleted: false }

// QR codes scanned at least once
{ scanCount: { $gt: 0 } }
```

---

## 2 · DBeaver (MongoDB driver)

DBeaver isn't Mongo-first but it works fine for browsing + raw queries.

### One-time driver install

1. **Database → Driver Manager**
2. Search **MongoDB** → **Edit**
3. Click **Download / Update** under the **Libraries** tab to fetch the Mongo driver JARs
4. Close the dialog

### New connection

1. **Database → New Connection**
2. Pick **MongoDB** → **Next**
3. Fill in:

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `27017` |
| Database | `nesso` |
| Authentication Database | `admin` |
| Username | `nesso` |
| Password | `nesso` |

4. **Driver properties** tab → set `authSource` to `admin` (some DBeaver builds need this even when the Auth DB is set above)
5. **Test Connection** → should print server info + version
6. **Finish**

### What you can do in DBeaver

- **Database Navigator** (left panel) → expand the connection → `nesso` database → each collection appears as a table
- **Right-click a collection → View Data** to see documents in a tabular view
- **SQL Editor** doesn't apply for Mongo (it's a document store), but DBeaver offers a **MongoDB script** editor:
  - Right-click connection → **MongoDB Script**
  - Run shell-style queries:

```javascript
db.farmers.find({ approvalStatus: "pending" }).limit(20)

db.farmers.aggregate([
  { $match: { isDeleted: false } },
  { $group: { _id: "$approvalStatus", count: { $sum: 1 } } }
])

db.inventory.find({ status: "AVAILABLE" }).sort({ incomingDate: -1 }).limit(10)
```

### Caveat

DBeaver's Mongo support is read-mostly. For deep editing or aggregation tweaks, **Compass is better**. Use DBeaver if you already live in it and just want a quick peek.

---

## 3 · Redis (optional, no GUI required)

Redis stores: throttle counters, idempotency keys, refresh-token blacklist, and (later) BullMQ queues.

### From inside the container (no install needed)

```powershell
docker exec -it nesso-redis redis-cli
# Then in the prompt:
KEYS *
PING
INFO keyspace
```

### From a GUI

Install **RedisInsight** (free) → New Database → host `localhost`, port `6379`, no password.

---

## 4 · Minio (S3-compatible object storage)

Where farmer photos, KYC docs, farm map screenshots, and (later) audit attachments live.

### Web console (recommended)

http://localhost:9001 → login `nesso` / `nessoadmin` → **Buckets** → `nesso-dev`

You'll see folders like:
```
profile/2026-05-29/<uuid>.jpg
id-proof/...
bank-passbook/...
farm-map/...
farm-photo/...
activity-photo/...
```

### S3 SDK / CLI

```
Endpoint:     http://localhost:9000
Region:       us-east-1
Access key:   nesso
Secret key:   nessoadmin
Bucket:       nesso-dev
Path-style:   true (required for Minio)
```

Works with `aws s3 --endpoint-url http://localhost:9000`, `mc`, `rclone`, etc.

---

## 5 · Mailhog (email testing)

Open http://localhost:8025 — shows every email the API ever sends. No SMTP setup, no real provider.

When we wire transactional emails (password reset, weather digests, exports) in Phase 5.x / Phase 6, they all land here in dev.

---

## 6 · Quick sanity checklist

After `docker compose up -d`, run these in PowerShell to confirm everything is reachable:

```powershell
# Mongo
docker exec nesso-mongo mongosh -u nesso -p nesso --authenticationDatabase admin --quiet --eval "db.runCommand({ ping: 1 })"

# Redis
docker exec nesso-redis redis-cli ping

# Minio
curl -s http://localhost:9000/minio/health/live -o $null -w "HTTP %{http_code}`n"

# Mailhog
curl -s http://localhost:8025/api/v2/messages -o $null -w "HTTP %{http_code}`n"

# API
curl -s http://localhost:4000/api/v1/health
```

All four should respond cleanly. If any fail, see `CONFIG.md` §7 (Quick troubleshooting).

---

## 7 · Wipe & start over

```powershell
docker compose down -v          # nukes Mongo, Redis, Minio volumes
docker compose up -d            # fresh containers
pnpm --filter @nesso/api seed:admin    # re-create the admin
pnpm --filter @nesso/api seed:catalog  # re-seed POP + inputs
```

---

<div align="center">

<sub>Bookmark this file alongside <code>CONFIG.md</code> — together they cover every connection you'll need locally.</sub>

<br /><br />

<sub>Nesso · © 2026 Harshan Aiyappa</sub>

</div>
