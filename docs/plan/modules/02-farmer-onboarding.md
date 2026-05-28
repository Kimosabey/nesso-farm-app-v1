# Module · Farmer Onboarding

## Purpose
Field officers (and self-onboarding farmers, where permitted) capture a farmer's personal info, KYC (ID + bank), and address; the record is queued for admin approval.

## Surfaces
Mobile (primary), Web (read + approve + edit).

## Data
- `farmers` (root entity) — schema in `03-database-schema.md`
- `files` (S3) — `profileImageUrl`, `idProof.imageUrl`, `bank.passbookImageUrl`
- `auditLogs` — `farmer.create`, `farmer.approve`, `farmer.reject`

## APIs
| Method | Path | Notes |
|---|---|---|
| POST | `/farmers` | auto-assign `farmerId NES-F-YYYY-NNNNN`, `approvalStatus: pending` |
| GET | `/farmers?status&association&q` | list (image URLs excluded) |
| GET | `/farmers/:id` | full doc with pre-signed image URLs |
| PATCH | `/farmers/:id` | edit |
| POST | `/farmers/:id/approve` | `{approved, reason?}` |
| GET | `/farmers/pending` | shortcut |
| DELETE | `/farmers/:id` | soft + cascade |
| POST | `/farmers/sync` | offline batch upsert with `clientRequestId` |
| POST | `/files/sign-upload` | obtain S3 PUT URL before submitting form |

## Screens

### Mobile — `RegisterFarmer.tsx`
Sectioned form, single column, progress indicator at top.

1. **Personal**: first/last name, gender, DOB, email (optional), preferred language
2. **Contact**: mobile number (UNIQUE; validated `/^[6-9]\d{9}$/`), profile photo
3. **Address**: state → district → taluka → hobli → city/village → pincode (`/^\d{6}$/`); pickers cascade from `catalog/locations`
4. **Association**: groupAssociation, FPO, Flower Agent (filtered list)
5. **ID Proof modal**: type picker (Aadhaar/Voter/PAN/Passport/DL/Ration/MNREGA/NationalID), number with type-specific regex, photo capture via expo-camera
6. **Bank modal**: IFSC (`/^[A-Z]{4}0[A-Z0-9]{6}$/`) → auto-fill bank/branch via `/geo/ifsc/:ifsc`; account number 9-18 digits; passbook photo
7. **Crop preferences**: selectedCrops multi-pick, productionPractice, variety
8. **Public trace consent** (new): `publicTraceConsent` boolean — explained inline; defaults off

Sticky bottom CTA: **Save & Submit for Approval**.

### Mobile — `VerifyFarmer.tsx`
- Tabbed list (Pending / Approved / Rejected) for officers with approval scope
- Inline approve/reject with reason picker

### Mobile — `FarmerProfile.tsx`
- Read view with tabs: FARM / FACILITIES / PRODUCE / FINANCIAL / INVENTORY / AGREEMENTS / TOKENS
- "Edit" goes back into `RegisterFarmer` pre-filled

### Web — `/farmers`
- TanStack Table: name, farmerId, mobile, district, association, status, last activity, actions
- Filters: status, association, district, language, only-flower-agents
- Bulk approve

### Web — `/farmers/[id]`
- Profile panel (left) + activity feed (right)
- Tabs: Profile · Farms · Crops · Activities · Samples · Audits · Procurements · Documents · Audit log
- Approve / Reject modal with mandatory reason field on reject

## UX flow (happy path)
1. Officer opens FAB → RegisterFarmer
2. App pre-fills state/district from current GPS reverse-geocode (`/geo/reverse`)
3. Officer fills sections; can save **Draft** anytime (drafts persisted in SQLite)
4. On submit, image uploads run in parallel via pre-signed URLs; finally `POST /farmers`
5. If offline, the record goes to outbox; UI shows "Pending sync" chip
6. Admin sees the row in `/farmers/pending`, approves → mobile notification fires to the officer
7. Farmer doc transitions to `approved`; UI updates via push + refetch

## Validation
- Server-side Zod re-validates client rules
- Idempotency: `clientRequestId` prevents dup creates from offline replay
- Mobile/email uniqueness checked client-side via `/farmers?q=` debounced lookup, then server-enforced
- Voter ID / PAN / Passport / DL / Aadhaar regex per `17-validation` (in PRD)

## Edge cases
- Flower-agent w/o phone: server assigns `FA-{ts}` as `mobileNumber`
- Duplicate mobile number: 409 with friendly "this number is already registered to X"
- Rejected farmer can be edited and re-submitted; rejection reason retained as history
- Cascading soft-delete: deleting a farmer soft-deletes their farms/crops/activities/etc. via a transaction

## Acceptance criteria
- AC1: Offline registration succeeds; record syncs within 5 s of reconnection.
- AC2: All 9 ID-proof types validate correctly per type-specific regex.
- AC3: IFSC autofill returns bank/branch in < 1 s online; cached for 30 days.
- AC4: A rejected farmer can be re-submitted without losing previously entered data.
- AC5: Approval triggers a push notification to the onboarding officer within 30 s online.
- AC6: WCAG: every form field has a visible label + visible error message + `aria-describedby` link.
