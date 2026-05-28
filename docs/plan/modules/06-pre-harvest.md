# Module · Pre-Harvest

## Purpose
Plan-side records: scheduled activities, growth-stage tracking, weather-driven advisories before a crop is harvested. Distinct from `activities` which captures execution.

## Surfaces
Mobile (capture + view), Web (report + bulk plan).

## Data
- `preHarvest` — schema in `03-database-schema.md`
- Linked to `farmers`, `farms`, `crops`

## APIs
| Method | Path |
|---|---|
| GET | `/pre-harvest?farmerId&farmId&growthStage&status` |
| GET | `/pre-harvest/farmers` |
| GET | `/pre-harvest/farms/:farmerId` |
| GET | `/pre-harvest/crops/:farmId` |
| POST/PATCH | `/pre-harvest[/:id]` |
| DELETE | `/pre-harvest/:id` |

## Screens

### Mobile — `PreHarvest.tsx`
Three tabs:

1. **Report** — donut of statuses + bar of activity & crop counts (uses `/stats/dashboard?scope=preHarvest`)
2. **Activities** — list of pre-harvest records with filters; add via FAB
3. **Crop History** — past growth stages grouped by crop cycle

Add modal uses hierarchical pickers (Agent → Farmer → Farm → Crop) seeded by `/pre-harvest/farmers`. Required fields:
- title
- cropCategory enum (ScentedFlowers / Vegetables / Fruits / Cereals / Other)
- activityType enum (FarmActivity / CropGrowth / WeatherAlert)
- growthStage (Germination / Vegetative / Flowering / HarvestReady / Harvested)
- season

### Web — `/pre-harvest`
- Sub-tabs match mobile
- Filter builder + table with growth-stage badges
- Bulk transition (e.g., move 20 records to Flowering)

## UX
- Growth stage badges are color-coded **and icon-tagged** for color-blind users
- Weather-alert records can be created automatically by the weather worker (see `07-weather.md`)

## Validation
- `cropCategory` server normalizes free strings to the closest enum
- `title` required, 3-120 chars

## Edge cases
- A farmer may have pre-harvest records on multiple crops simultaneously — UI groups by crop
- Deleting the linked crop soft-deletes the pre-harvest record (cascade)

## Acceptance criteria
- AC1: Hierarchical picker resolves `farmerId → farms → crops` in ≤ 2 s on a typical 3G connection.
- AC2: Bulk transition succeeds atomically; partial failure shows row-level errors.
- AC3: Report tab numbers match `/reports/pre-harvest` totals.
