# Module · Harvest

## Purpose
Record harvest events, generate batches, link to procurement and inventory.

## Surfaces
Mobile (`HarvestBoard.tsx` + harvest activity entry), Web (`/inventory/batches`).

## Data
- `activities` with `activity = "Harvest"` (execution record)
- `crops` with `multipleHarvest` flag (cycle metadata)
- `inventory` rows created on procurement acceptance (post-harvest)

## Flow
A "harvest" is captured as an **activity** of type `Harvest` (quantity in `inputs[0].quantity`, unit on the crop). When procurement confirms, an **inventory batch** is created and back-references the procurement, which back-references the farmer/crop/harvest activity.

```
Harvest activity ──► (procurement order: pricing, weighing) ──► Inventory batch (batchId, QR)
```

## APIs
- `POST /activities` with `activity: "Harvest"` (no new endpoint)
- `GET /activities?status=Completed&type=Harvest&from&to` — feeds harvest dashboards
- `GET /inventory?status=AVAILABLE&from&to` — derived batch view

## Screens

### Mobile — `HarvestBoard.tsx`
- Three sections: **Today** / **Tomorrow** / **Planned**
- Each card shows farmer, farm, crop, expected quantity, distance from current GPS
- Tap to navigate to FarmDetails → log harvest activity
- Filters: assigned officer scope, crop, association

### Mobile — Harvest activity entry
Variant of `AddActivity.tsx` pre-filled when entered from a harvest plan card:
- Yield quantity + unit
- Grade (optional, dropdown)
- Photos of produce
- Geotag mandatory (not optional like other activities)

### Web — `/inventory/batches`
- Batch list with QR preview; filters by harvest date / supplier / grade / status
- Action: Generate QR (if missing)

## UX
- Mobile shows distance from officer to plot using `expo-location` and Haversine to farm.location
- "Today" cards have a brand-green accent and slight scale-up animation on the active card

## Validation
- Quantity > 0
- Unit ∈ {kg, quintal, tonne, nos}
- Geotag accuracy required < 50 m for harvest (warn otherwise)

## Edge cases
- Partial harvest (multi-harvest crops): each harvest is its own activity row; `crops.estHarvest` is informational, not a constraint
- Late harvest entry (> 7 days after `scheduledOn`): warning banner

## Acceptance criteria
- AC1: A harvest activity logged on mobile appears on the web batch list within 30 s (after procurement step).
- AC2: Today/Tomorrow sections recompute on midnight rollover without app restart.
- AC3: Grade picker honors the configured grade enum per crop type.
