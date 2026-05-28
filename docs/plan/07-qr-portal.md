# 07 — Public QR Traceability Portal

A standalone Next.js 15 app that renders the **farm-to-shelf timeline** for a scanned batch. No login. Optimized for fast first paint on cheap phones.

## Goals

- A consumer scans a QR → lands on a page in < 2 s.
- The page shows: farmer face/name (with consent), village & district, farm photo & polygon thumbnail, crop & variety, harvest date, batch journey (received → cleaned → packed → dispatched), warehouse, certifications.
- Works on 3G; weight budget below.
- SEO-friendly for `https://trace.nesso.example/t/:code` so retailers can deep-link.

## Routes

```
/                         # marketing splash + "scan a code" CTA
/t/[code]                 # main trace page (ISR)
/t/[code]/farmer          # deeper farmer profile
/t/[code]/farm            # deeper farm + map page
/t/[code]/timeline.json   # raw JSON timeline (for retailers / auditors)
/api/public/scan          # POST { code } — records analytics scan event
/i/[code]                 # short-link redirect (qr.nesso.example/i/:code) → /t/:code
/about, /privacy          # static
```

## Rendering strategy

- **`/t/[code]`** uses **ISR** with `revalidate = 300` (5 minutes).
- On request, calls public endpoint `GET /api/v1/public/trace/:code` which returns the denormalized `qrCodes.payload`.
- Backend regenerates the payload whenever the linked inventory batch transitions stages, so ISR + payload denorm = always fresh within 5 min.
- Static elements (header, footer, marketing copy) come from the layout shell.

## Page sections (per `/t/[code]`)

1. **Hero**: product name, variant, harvest date, "Verified by Nesso" badge.
2. **Farmer card**: photo (or initials avatar if consent not granted), name, village, district, "since YYYY" enrollment year.
3. **Farm card**: thumbnail of polygon, area in acres, production practice (Organic / Conventional), soil type.
4. **Crop card**: crop, variety, sowing date, harvest date.
5. **Timeline** (vertical): each row = a stage with timestamp & location:
   - Harvested
   - Received at warehouse X
   - Cleaned / Sorted / Graded
   - Packed
   - Dispatched
6. **Certifications**: badges (organic, GAP, audit-passed).
7. **Warehouse card**: warehouse name, type, certification status.
8. **Footer**: Nesso branding, "Scan another code", share buttons.

## Data shape (`qrCodes.payload`)

```ts
type TracePayload = {
  code: string;
  product: { name: string; variant?: string; grade?: string };
  batch: { batchId: string; harvestDate: string; expiryDate?: string };
  farmer: {
    farmerId: string;
    displayName: string;          // first name + last-initial
    village: string;
    district: string;
    state: string;
    photoUrl?: string;            // null if consent withdrawn
    enrolledYear: number;
  };
  farm: {
    farmId: string;
    name: string;
    areaAcres: number;
    practice: 'Organic' | 'Conventional' | 'NaturalFarming' | 'GAPCertified';
    polygonThumbUrl: string;      // S3 PNG
  };
  crop: { name: string; variety: string; sowingDate: string; harvestDate: string };
  timeline: Array<{
    stage: string;
    at: string;                   // ISO
    location?: { name: string; lat: number; lng: number };
    notes?: string;
  }>;
  certifications: Array<{ kind: string; agency?: string; validUntil?: string }>;
  warehouse: { name: string; type: string; certificationStatus: string };
  generatedAt: string;
};
```

## Privacy & consent

- Farmer photo, exact GPS, and full name appear only if the farmer (or onboarding officer on their behalf) ticked "Show in public trace".
- Default fallback: initials avatar, village + district only, polygon shown without coordinates labels.
- Configurable per farmer in `farmers.publicTraceConsent` (boolean, default false).
- `GET /api/v1/public/trace/:code` redacts at the backend, so the portal never sees suppressed fields.

## Performance

- HTML ≤ 30 KB gzipped per page.
- Single hero image preloaded.
- Fonts: system-ui stack (no Google Fonts) to skip third-party fetch.
- Total transfer ≤ 250 KB on first paint.
- Lighthouse Performance ≥ 95 on the trace page.

## Analytics

- Each render triggers a beacon to `/api/public/scan` with `{code, ua, country (via CDN header)}`.
- Backend increments `qrCodes.scanCount`, sets first/last scanned, and writes a row to a `qrScans` time-series collection (TTL 365 d).
- No PII; only aggregate scan counts surface in admin reports.

## CDN & hosting

- Vercel project, deployed on `trace.nesso.example`.
- Cloudflare in front for caching `/t/:code` HTML and `/_next/static/*`.
- Public read-API responses also CDN-cached with 5-minute TTL (matching ISR).

## i18n

- Path-based locale: `/en/t/:code`, `/hi/t/:code`, etc.
- Same 12 dictionaries as the rest of the app, filtered down to the public namespace (`portal.*`).
- Default locale negotiated from `Accept-Language`, falling back to English.

## Design

Same Nesso brand tokens (`09-design-system.md`), dark theme with glassmorphism cards. Cleaner / less dense than the admin dashboard — this is a public, consumer-facing surface.

## Failure modes

| Case | UX |
|---|---|
| Invalid code | 404 page with "this batch isn't recognized" + scan-another CTA |
| Code valid but payload missing fields | Show what we have; collapse missing sections; never show "undefined" |
| Backend unavailable | Stale ISR cache served (last good render up to 24 h); shows "last verified" timestamp |
| Farmer consent withdrawn after publication | ISR revalidate triggered on consent change; portal updates within 5 min |
