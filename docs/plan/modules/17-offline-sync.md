# Module · Offline-First Sync

## Purpose
Mobile must work for hours without connectivity. All reads come from a local cache, all writes hit a local outbox first; a background manager drains the outbox when the network returns.

## Surfaces
Mobile only (SQLite + MMKV). Backend exposes idempotent sync endpoints.

## Local stores

### SQLite (Expo SQLite)

| Table | Use |
|---|---|
| `mutation_outbox` | one row per pending mutation |
| `farmers_cache` | read cache mirroring API response shape |
| `farms_cache` | |
| `crops_cache` | |
| `activities_cache` | |
| `preharvest_cache` | |
| `samples_cache` | |
| `audits_cache` | |
| `procurements_cache` | |
| `inventory_cache` | |
| `notifications_cache` | |
| `inputs_catalog` | last-synced input catalog |
| `pop_catalog` | last-synced POP catalog |
| `locations_catalog` | states/districts/talukas master |
| `meta` | `lastSyncAt`, schema version, user id |

Schema is versioned; migrations live in `apps/mobile/src/db/migrations/`.

### MMKV
- `auth.accessToken`, `auth.refreshToken` (encrypted)
- `prefs.language`, `prefs.theme`
- `tanstack.cache.v1` (TanStack Query persistor blob)
- `network.lastOnlineAt`

## `mutation_outbox` schema

```sql
CREATE TABLE mutation_outbox (
  id TEXT PRIMARY KEY,
  clientRequestId TEXT NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,                -- POST | PATCH | DELETE
  payload TEXT NOT NULL,               -- JSON
  attachments TEXT,                    -- JSON: pre-signed upload jobs
  retries INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | uploading | done | failed
  lastError TEXT,
  createdAt INTEGER NOT NULL,
  nextAttemptAt INTEGER NOT NULL
);
```

## Write path

1. UI submits form
2. Client computes `clientRequestId = uuidv4()`
3. **Insert outbox row** + apply optimistic update to the relevant `*_cache` table
4. Trigger `syncStore.kickOnce()`

`SyncManager.drain()`:
- Sort outbox by `createdAt` (FIFO with same-resource ordering)
- For each row:
  - If `attachments` not yet uploaded → request pre-signed URLs, upload to S3, update payload with keys
  - Call the API endpoint with the payload + `Idempotency-Key: clientRequestId`
  - On 2xx → mark `done`, refresh `*_cache` from response, delete row
  - On 4xx (validation) → mark `failed`, surface error in Settings → Sync health
  - On 5xx / network → increment retries, exponential backoff (1s, 5s, 30s, 2m, 10m, 1h, cap at 4h)

Triggers:
- `NetInfo` `isConnected = true`
- `AppState` change to `active`
- 60s periodic tick (foreground only)
- Manual "Sync now" in Settings

## Read path

1. Hook subscribes to TanStack Query
2. Query function reads from SQLite cache first → returns immediately
3. Same hook fetches network (if online); replaces cache on success
4. UI re-renders with fresh data

For lists: paginated cache uses `cursor` and `lastUpdatedAt`; the API supports `?since=ISO` to deliver deltas.

## Conflict resolution

- **Server wins** for fields that overlap (last-write-wins by `updatedAt`)
- **Append-only resources** (activities, samples, audits, payments, stageHistory): no conflicts by design
- **Detectable conflicts** (e.g., farmer mobile number duplicate after offline create): server returns 409 with the conflicting record; client moves outbox row to `failed` and surfaces a "Resolve" UI prompting the user to merge

## Endpoints that accept `Idempotency-Key`

All write endpoints (`POST`, `PATCH`, `DELETE`) honor `Idempotency-Key`. Redis stores `idem:<key> → {status, response}` for 24h.

## Bulk sync endpoints

- `POST /farmers/sync` — array of up to 200 farmers
- `POST /farms/sync` — array of up to 500 farms
- `POST /activities/sync` — array of up to 500 activities

Used when an officer comes back online with many queued items.

## Health & observability

- Outbox count surfaced in app top bar (chip "3 pending sync")
- `Settings → Sync` shows last sync time, error list with retry/resolve actions
- Failed rows older than 7 days prompt "Export & send" (zip → email/Whatsapp)
- Telemetry events: `sync.start`, `sync.success`, `sync.fail`, `sync.bulkBatch`

## Hard limits

- Outbox max rows: 5,000 (warn at 4,000)
- Per-attempt batch size: 50 mutations
- Total local DB cap: 200 MB (eject oldest cache rows beyond)

## Edge cases

- Token expired while draining: refresh once; if refresh fails, pause drain and surface re-login banner
- Conflict on mobile number uniqueness: surface a merge UI; never silently overwrite server data
- Mutation references a resource that was deleted server-side: server returns 410; client deletes the local cache row and surfaces a one-time notice
- Device-clock skew: client compares server `Date` header on every sync, warns user if drift > 5 min (affects `scheduledOn` heuristics)

## Acceptance criteria
- AC1: 100 offline activities sync within 30 s of reconnect on a stable 4G.
- AC2: Two devices editing the same farmer offline → server wins, client surfaces a resolve prompt; no silent data loss.
- AC3: Idempotency: replaying the same outbox row twice produces a single server record.
- AC4: App restart preserves the outbox 1:1.
- AC5: Outbox > 4,000 rows shows a warning and offers "Export & send" emergency path.
