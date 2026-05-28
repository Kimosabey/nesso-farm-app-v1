# Module · Crop Lifecycle

## Purpose
Per-farm crop cycles: sowing → growth → harvest planning. Supports main / inter / border crop types and multi-harvest seasons.

## Surfaces
Mobile (capture), Web (manage + list).

## Data
- `crops` — schema in `03-database-schema.md`
- `popCatalog` referenced by activity planning
- Linked back from `activities` (crop → activities)

## APIs
| Method | Path | Filters |
|---|---|---|
| GET | `/crops` | `farmId, farmerId, flowerAgentId, year, season` |
| POST/PATCH/DELETE | `/crops[/:id]` | |

## Screens

### Mobile — `AddNewCrop.tsx`
- cropName autocomplete (catalog-backed)
- cropType radio (Main / Inter / Border)
- cropVariety autocomplete (depends on selected crop)
- unit segmented (kg/quintal/tonne/nos)
- acre / mappedAcre / estHarvest numerics
- waterType (RAINFED / IRRIGATION)
- method (SOWING / PLANTING) — affects activity templates
- practice (CONVENTIONAL / ORGANIC) — locks organic-only inputs
- sowingDate / harvestDate via native date picker
- multipleHarvest toggle (default off for cereals, on for flowers like Jasmine)
- season auto-derived from sowing month with override
- POP suggestion: surfaces the recommended POP from `popCatalog` for `(crop, variety, year)` and offers to seed pre-harvest plan

### Mobile — Crop list in `FarmDetails.tsx`
- Year filter pills, status chip, quick "Log activity" button

### Web — `/crops`
- Filter builder; columns farmer/farm/crop/variety/sowingDate/season/status/counts
- Detail panel with linked activities and pre-harvest plan

## UX
- Seeding POP activities: on save, optional checkbox "Generate planned activities from POP" → backend creates `activities` with `status: Pending` and `scheduledOn` computed from sowing date + offsets
- "Crop history" tab per farm groups completed crop cycles by year

## Validation
- `sowingDate` cannot be in the future > 30 days
- `harvestDate` ≥ `sowingDate + 7 days`
- `mappedAcre` ≤ farm.growingArea
- `estHarvest` non-negative

## Edge cases
- Multi-harvest: `harvestDate` represents first expected; subsequent harvests recorded via `activities` of type `Harvest`
- Edits cascade: changing sowingDate offers to reschedule all pending POP-generated activities by the same delta

## Acceptance criteria
- AC1: Creating a crop seeds the POP-recommended activities when the checkbox is ticked.
- AC2: A crop edit that shifts sowingDate by ±X days offers a one-click reschedule of pending activities.
- AC3: Inter and border crops display visually distinct on the farm crop list (icon + label).
