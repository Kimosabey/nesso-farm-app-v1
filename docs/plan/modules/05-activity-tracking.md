# Module · Activity Tracking (Package of Practices)

## Purpose
Log every farm activity (sowing, watering, spraying, fertilization, harvest, etc.) with inputs, costs, photos, geotag, and POP compliance.

## Surfaces
Mobile (primary), Web (review + bulk ops).

## Data
- `activities` — schema in `03-database-schema.md`
- `inputCatalog` — ~180 inputs across kinds Chemical/Organic/Inventory/Other
- `popCatalog` — recommended activities per crop/variety/year
- Photos in S3 via pre-signed upload

## APIs
| Method | Path | Filters |
|---|---|---|
| GET | `/activities` | `farmId, cropId, status, from, to` |
| POST/PATCH/DELETE | `/activities[/:id]` | |
| POST | `/activities/sync` | offline batch (idempotent by `clientRequestId`) |

## Screens

### Mobile — `AddActivity.tsx`
1. Activity type picker (10 standard types, customizable):
   - Land Preparation, Sowing/Planting, Irrigation, Fertilization, Pesticide, Weeding, Pruning, Inspection, Harvest, Other
2. Date pickers: `scheduledOn` (default today), `completedDate` (if marking complete now)
3. Input picker (full-screen modal):
   - Tabs: Chemical / Organic / Inventory / Other
   - Search across `inputCatalog` with `searchTokens` (handles Kannada / Hindi script)
   - Recent inputs surface at top
   - Per pick: quantity, unit, cost → composes `inputs[]` array
4. Notes (free text, optional voice input via `expo-speech-recognition`)
5. Photos (multi, expo-camera; uploaded to S3 in parallel)
6. Geotag captured silently from `expo-location` (no permission re-prompt if granted)
7. POP compliance checkbox auto-suggests if the activity matches a POP entry for the crop

Sticky bottom: **Save**. Save creates record with `status: Completed` if completedDate present, else `Pending`.

### Mobile — `Activities.tsx`
- Two tabs: PENDING / APPROVED (Done)
- Toggle between **List** and **Calendar** views
- Filters: farm, crop, type, date range
- Swipe right on a list row → "Mark complete"; swipe left → "Edit"

### Web — `/activities`
- Filter builder with date range, status, type, association
- Bulk actions: mark complete, reschedule, export CSV
- Calendar view (FullCalendar-react or custom Recharts grid)

## UX & a11y
- Input picker remembers last 10 picks per user
- Cost composed automatically: `totalCost = sum(inputs[].quantity * inputs[].cost)`; user can override
- WCAG: every modal traps focus; ESC closes; tab order respects DOM
- Long-running upload shows determinate progress bar (no spinner)

## Offline
- All writes through outbox with `clientRequestId`
- Photos uploaded directly to S3 (pre-signed) when online; offline they sit in app cache until reconnect
- `activities.sync` accepts a batch payload up to 100 items

## Validation
- `activity` must be in allowed enum
- `inputs[].quantity > 0`, `cost ≥ 0`
- `completedDate` ≥ `scheduledOn - 365 days`
- `notes` ≤ 2000 chars; photos ≤ 5 per activity

## POP compliance
- On save, compare `(crop, activity, daysFromSowing)` to `popCatalog`
- If matched within tolerance, set `popCompliance: popId`
- Field officer sees a small green tick on POP-compliant rows

## Edge cases
- User logs an activity for a deleted farm: backend returns 410, client surfaces a sticky error
- Duplicate `clientRequestId`: returns the previously stored result (idempotency)
- Activity with future `scheduledOn` and no `completedDate` is `Pending`; cron job marks it `Overdue` after scheduledOn + 3 days

## Acceptance criteria
- AC1: Field officer can complete an activity entry (type + 2 inputs + 1 photo + geotag) in ≤ 60 s.
- AC2: Photos upload in parallel and don't block save.
- AC3: Offline activities sync within 30 s of reconnection.
- AC4: POP compliance auto-flags on matched activities.
- AC5: Bulk reschedule on web updates all selected activities atomically.
