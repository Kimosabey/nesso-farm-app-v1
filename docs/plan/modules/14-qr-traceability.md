# Module · QR Traceability

## Purpose
Generate QR codes for inventory batches, log scans, and serve a public farm-to-shelf timeline at `https://trace.nesso.example/t/:code`.

## Surfaces
- Backend `qr` module
- Web `/inventory/batches` (QR preview + download)
- Mobile `Batches.tsx` (QR scan FAB)
- Public **QR Portal** (Next.js, see `07-qr-portal.md`)

## Data
- `qrCodes` — schema in `03-database-schema.md`
- `qrScans` — time-series, TTL 365d, captures `{code, at, country, ua}`

## APIs
| Method | Path | Auth |
|---|---|---|
| POST | `/qr/generate` `{batchId}` → `{code, imageUrl}` | authed |
| POST | `/qr/scan` `{code}` → batch summary | authed |
| GET | `/qr/:code/png` → 302 to PNG | authed |
| GET | `/public/trace/:code` | **public** |
| POST | `/api/public/scan` `{code}` (beacon) | public |

## Code format
- URL-safe slug, 10 chars from base32, no ambiguous (`I`, `O`, `0`, `1`)
- Collision check on insert; max 3 retries before incrementing length
- QR payload URL: `https://trace.nesso.example/t/{code}` (canonical) — short-link `/i/{code}` on `qr.nesso.example` redirects

## Generation
- Triggered on inventory batch creation
- BullMQ `qr:generate` worker:
  1. Reserves `code` in `qrCodes`
  2. Renders 512×512 PNG via `qrcode` npm package
  3. Uploads to S3 (`qr/{code}.png`)
  4. Builds initial `payload` snapshot (denormalized trace timeline)
- Subsequent batch transitions enqueue `qr:refresh-payload` to update the snapshot

## Payload refresh
- Triggered by: inventory transitions, farmer profile changes, consent toggle, warehouse changes
- Idempotent: rebuilds from authoritative sources every time
- ISR revalidation on portal triggered automatically (next.js `revalidatePath` via webhook from backend)

## Consumer trace timeline
See `07-qr-portal.md` for the full UX. Sections come from the `payload` snapshot:
- Farmer card (privacy-aware)
- Farm card (polygon thumb, area, practice)
- Crop card
- Timeline of stages (Harvested → Received → … → Dispatched)
- Certifications
- Warehouse

## Scan logging
- Public beacon `POST /api/public/scan` fires on every `/t/:code` page render
- Backend increments `qrCodes.scanCount`, sets first/last scanned, writes a `qrScans` row
- Rate-limited per IP (100/hour); excess scans counted but not stored

## Permissions
- Generation: `admin`, `procurementManager`, `processor`
- Scan (authed): all internal users (for admin search)
- Public trace: anonymous (privacy-redacted per farmer consent)

## UX
- Web batch detail shows the QR PNG with download / copy-link / open-on-portal buttons
- Mobile batch screen shares the QR via OS share sheet
- QR portal page: < 2 s first paint on 3G; see `07-qr-portal.md`

## Privacy
- `farmers.publicTraceConsent: false` → portal redacts photo, exact GPS, full name (initials + village only)
- Consent toggle is reversible; payload refresh propagates within 5 minutes (ISR + revalidate)

## Edge cases
- Invalid `code`: portal 404 page with "scan another" CTA
- Code valid but batch deleted: payload retained but timeline shows last known stage with "archived" banner
- Mass scan-bot traffic: Cloudflare rate-limits; scan analytics still increments via a coalesced counter

## Acceptance criteria
- AC1: QR generated within 5 s of batch creation, available at the public URL.
- AC2: Inventory transition reflected in the public trace within 5 minutes (ISR revalidate window).
- AC3: A consumer scans the QR with any phone camera and lands on the trace page in ≤ 2 s on 3G.
- AC4: Privacy redaction is applied at the backend — never trusted to the client.
- AC5: Scan counter is approximately accurate (±1%) under bot pressure.
