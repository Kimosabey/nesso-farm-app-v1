# Module · Inventory & GRN

## Purpose
Goods Receipt Note (GRN) workflow: accept a procurement into a warehouse as a uniquely identified batch, then move that batch through processing stages with status transitions and full audit history.

## Surfaces
Mobile (`AcceptGRN.tsx`, `Batches.tsx`, `InventoryDashboard.tsx`), Web (`/inventory` sections).

## Data
- `inventory` collection — schema in `03-database-schema.md`
- `qrCodes` collection — generated on batch creation
- `stageHistory[]` append-only audit trail on each inventory doc

## APIs
| Method | Path |
|---|---|
| GET | `/inventory?status&warehouseId&grade&supplier&from&to` |
| GET | `/inventory/:batchId` |
| POST | `/inventory/grn/accept` — `{qrPayload OR manualEntry, procurementId, warehouseId, quantity, unit, grade?}` |
| POST | `/inventory/:batchId/transition` — `{toStatus, toStage?, notes?}` |
| POST | `/inventory/:batchId/sell` — `{quantity, buyer}` |
| POST | `/inventory/:batchId/transfer` — `{toWarehouseId, quantity}` |
| POST | `/inventory/:batchId/process` — `{toStage, notes}` |

## Status machine
```
            ┌── SELL ──► SOLD
AVAILABLE ──┼── TRANSFER ──► TRANSFERRED
            └── PROCESS ──► PROCESSING ──► AVAILABLE (next stage)
```
Soft transitions: AVAILABLE ↔ PROCESSING (many cycles). Terminal: SOLD, TRANSFERRED.

## Screens

### Mobile — `AcceptGRN.tsx`
- Full-screen camera (expo-camera) with multi-format scan support:
  - QR, EAN-13, EAN-8, PDF417, Aztec, DataMatrix, Code 128
- Visual reticle + haptic on detect
- 2s debounce so a single barcode isn't read 30 times
- Manual entry fallback (free-text batch code or procurement ID)
- After scan/manual: confirm screen shows linked procurement + quantity + warehouse picker → **Accept** creates the inventory batch and shows the generated QR

### Mobile — `Batches.tsx`
- Two views: **ORDER** (grouped by procurement) and **BATCH** (flat)
- Filters: association, supplier, grade, crop, date range, status
- FAB: "Scan QR" → `AcceptGRN`

### Mobile — `InventoryDashboard.tsx`
- Cards per batch with status chip, quantity, warehouse, latest stage
- Action bar: **SELL** / **TRANSFER** / **PROCESS** (gated by role)
- Each action opens a sheet with required fields

### Web — `/inventory/batches`
- Table view with bulk filters; QR preview column; status badges
- Detail page: batch info + stageHistory timeline + linked procurement + QR PNG download

### Web — `/inventory/grn`
- Pending procurements awaiting GRN; quick-accept inline

### Web — `/inventory/movements`
- Append-only ledger of all transitions across batches; CSV export

## UX
- `batchId` shown as `NES-B-2026-00042` — copyable chip
- Status uses color + icon + label
- Quantity unit is enforced consistent with the procurement source (no kg→quintal conversion automatically — must transfer-with-rebatch if changed)
- Camera screen has clear "Manual entry" CTA bottom-left (low-light fallback)

## Validation
- `quantity` ≤ available quantity (server-enforced, atomic decrement)
- `toWarehouseId` must be active
- `toStage` must be in the configured stage order (Received → Cleaned → Sorted → Graded → Packed → Dispatched)
- Transitions append to `stageHistory` with `{stage, at, by, notes}` — never overwrite

## QR linkage
- On batch creation, server calls `qr.generate(batchId)`:
  - Creates a `qrCodes` doc with the trace `payload` snapshot
  - Uploads PNG to S3
  - Stores `qrCodes.code` on the inventory doc
- Subsequent inventory transitions enqueue a BullMQ `qr:refresh-payload` job that re-snapshots the trace timeline

## Permissions
- `procurementManager`, `processor`, `admin` only for write actions
- Read for `admin`, `orgMD`, `procurementManager`, `processor`, `qualityAuditor`

## Edge cases
- Split batches: SELL of partial quantity creates a child batch with `parentBatchId` and reduces source quantity atomically
- Transfer creates a new batch at the destination warehouse with `sourceBatchId`; source is marked `TRANSFERRED` if fully transferred, else reduced
- Concurrent transitions: optimistic concurrency via `updatedAt` (`If-Match`); 409 with current doc on conflict

## Acceptance criteria
- AC1: Scanning a recognized QR fills the GRN form and accepts in ≤ 5 s.
- AC2: A failed accept (e.g. quantity > available) rolls back atomically — no orphan rows.
- AC3: Status transitions preserve full `stageHistory` and update the linked QR payload within 30 s.
- AC4: Multi-format scan supports all 7 listed formats with no library swap.
- AC5: Camera UI is operable with one hand on a 5.5" device — primary CTA reachable by thumb.
